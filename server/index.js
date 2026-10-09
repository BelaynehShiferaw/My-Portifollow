import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomBytes, randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import { connectDatabase, readDB, writeDB } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CV_FILE = path.join(__dirname, 'data', 'uploads', 'cv.pdf');
const CERTIFICATE_DIRECTORY = path.join(__dirname, 'data', 'uploads', 'certificates');
const MAX_CERTIFICATE_SIZE = 15 * 1024 * 1024;
const PORT = process.env.API_PORT || process.env.PORT || 5001;
const passwordResetTokens = new Map();
const adminSessions = new Map();

const isAuthenticatedAdmin = (req) => {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
  const session = token && adminSessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (token) adminSessions.delete(token);
    return false;
  }
  return true;
};

// Send CORS + JSON Response
const sendJSON = (res, statusCode, body) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(body));
};

const server = http.createServer((req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Body Parsing Helper
  const getBody = (callback) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      let data = {};
      try {
        data = body ? JSON.parse(body) : {};
      } catch (err) {
        return sendJSON(res, 400, { success: false, message: 'Request body must contain valid JSON.' });
      }
      Promise.resolve(callback(data)).catch(error => {
        console.error('API request failed:', error.message);
        if (!res.headersSent) sendJSON(res, 500, { success: false, message: 'The request could not be completed.' });
      });
    });
    req.on('error', error => {
      console.error('Request body read failed:', error.message);
      if (!res.headersSent) sendJSON(res, 400, { success: false, message: 'Unable to read the request body.' });
    });
  };

  // --- ROUTE HANDLERS ---

  if (pathname === '/api/profile/cv' && method === 'GET') {
    if (!fs.existsSync(CV_FILE)) {
      return sendJSON(res, 404, { success: false, message: 'No CV has been uploaded yet.' });
    }
    const cv = fs.readFileSync(CV_FILE);
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': cv.length,
      'Content-Disposition': 'attachment; filename="Belayneh-Shiferaw-CV.pdf"',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(cv);
  }

  if (pathname === '/api/profile/cv' && method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.toLowerCase().includes('application/pdf')) {
      req.resume();
      return sendJSON(res, 415, { success: false, message: 'Upload a PDF file.' });
    }

    const chunks = [];
    let totalBytes = 0;
    let tooLarge = false;
    req.on('data', chunk => {
      totalBytes += chunk.length;
      if (totalBytes > 10 * 1024 * 1024) {
        tooLarge = true;
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', async () => {
      if (tooLarge) return sendJSON(res, 413, { success: false, message: 'CV must be 10 MB or smaller.' });
      const cv = Buffer.concat(chunks);
      if (!cv.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
        return sendJSON(res, 400, { success: false, message: 'The selected file is not a valid PDF.' });
      }

      const db = readDB();
      fs.mkdirSync(path.dirname(CV_FILE), { recursive: true });
      try {
        fs.writeFileSync(CV_FILE, cv);
      } catch (error) {
        console.error('Unable to save uploaded CV:', error.message);
        return sendJSON(res, 500, { success: false, message: 'Unable to save the CV on the server.' });
      }
      db.profile = { ...db.profile, resumeUrl: '/api/profile/cv' };
      if (!(await writeDB(db))) return sendJSON(res, 500, { success: false, message: 'CV saved, but its profile link could not be updated.' });
      return sendJSON(res, 200, { success: true, resumeUrl: db.profile.resumeUrl, cvAvailable: true });
    });
    req.on('error', error => {
      console.error('CV upload request failed:', error.message);
      if (!res.headersSent) sendJSON(res, 400, { success: false, message: 'CV upload failed.' });
    });
    return;
  }

  // Auth Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    return getBody(async data => {
      const { username, password } = data;
      const db = readDB();
      const storedUser = db.profile?.adminUsername || process.env.ADMIN_USERNAME;
      const storedPass = db.profile?.adminPassword || process.env.ADMIN_PASSWORD;

      if (username && password && username === storedUser && password === storedPass) {
        const token = randomBytes(32).toString('hex');
        adminSessions.set(token, { expiresAt: Date.now() + 4 * 60 * 60 * 1000 });
        return sendJSON(res, 200, {
          success: true,
          token,
          user: { name: 'Belayneh Shiferaw', role: 'Admin' }
        });
      }
      return sendJSON(res, 401, { success: false, message: 'Invalid Admin Credentials' });
    });
  }

  if (pathname === '/api/auth/change-password' && method === 'POST') {
    return getBody(async data => {
      const { currentUsername, currentPassword, newUsername, newPassword } = data;
      const db = readDB();
      const storedUser = db.profile?.adminUsername || process.env.ADMIN_USERNAME;
      const storedPass = db.profile?.adminPassword || process.env.ADMIN_PASSWORD;
      if (!currentUsername || !currentPassword || !newUsername || !newPassword ||
          currentUsername !== storedUser || currentPassword !== storedPass) {
        return sendJSON(res, 401, { success: false, message: 'Current username or password is incorrect.' });
      }
      if (newPassword.length < 8) {
        return sendJSON(res, 400, { success: false, message: 'New password must be at least 8 characters.' });
      }
      db.profile.adminUsername = newUsername;
      db.profile.adminPassword = newPassword;
      if (!(await writeDB(db))) return sendJSON(res, 500, { success: false, message: 'Unable to save the new credentials.' });
      adminSessions.clear();
      return sendJSON(res, 200, { success: true, message: 'Admin credentials updated.' });
    });
  }

  if (pathname === '/api/auth/forgot-password' && method === 'POST') {
    return getBody(async data => {
      const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
      const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS &&
        process.env.ADMIN_RECOVERY_EMAIL && process.env.PUBLIC_APP_URL;
      if (!smtpConfigured) {
        return sendJSON(res, 503, { success: false, message: 'Email password recovery is not configured. Contact the site administrator.' });
      }
      const adminEmail = process.env.ADMIN_RECOVERY_EMAIL.trim().toLowerCase();
      if (email && email === adminEmail) {
        const token = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const resetTokensForEmail = [...passwordResetTokens.entries()]
          .filter(([, reset]) => reset.email === adminEmail);
        resetTokensForEmail.forEach(([hash]) => passwordResetTokens.delete(hash));
        passwordResetTokens.set(tokenHash, { email: adminEmail, expiresAt: Date.now() + 15 * 60 * 1000 });

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
        const resetUrl = new URL('/', process.env.PUBLIC_APP_URL);
        resetUrl.searchParams.set('resetToken', token);
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: adminEmail,
            subject: 'Reset your portfolio admin password',
            text: `Use this link to reset your admin password. It expires in 15 minutes: ${resetUrl}`,
            html: `<p>Use the link below to reset your portfolio admin password. It expires in 15 minutes.</p><p><a href="${resetUrl}">Reset admin password</a></p><p>If you did not request this, you can ignore this email.</p>`
          });
        } catch (error) {
          passwordResetTokens.delete(tokenHash);
          console.error('Unable to send admin password recovery email:', error.message);
          return sendJSON(res, 503, { success: false, message: 'Unable to send the recovery email right now. Please try again later.' });
        }
      }
      return sendJSON(res, 200, { success: true, message: 'If that email matches the admin account, a password reset link has been sent.' });
    });
  }

  if (pathname === '/api/auth/reset-password' && method === 'POST') {
    return getBody(async data => {
      const { token, newPassword } = data;
      if (typeof token !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) {
        return sendJSON(res, 400, { success: false, message: 'A valid reset link and a password of at least 8 characters are required.' });
      }
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const reset = passwordResetTokens.get(tokenHash);
      if (!reset || reset.expiresAt < Date.now()) {
        passwordResetTokens.delete(tokenHash);
        return sendJSON(res, 400, { success: false, message: 'This reset link is invalid or expired. Request a new link.' });
      }
      const db = readDB();
      const adminEmail = (process.env.ADMIN_RECOVERY_EMAIL || '').trim().toLowerCase();
      if (reset.email !== adminEmail) {
        passwordResetTokens.delete(tokenHash);
        return sendJSON(res, 400, { success: false, message: 'This reset link is invalid or expired. Request a new link.' });
      }
      db.profile.adminPassword = newPassword;
      if (!(await writeDB(db))) return sendJSON(res, 500, { success: false, message: 'Unable to save the new password.' });
      passwordResetTokens.delete(tokenHash);
      adminSessions.clear();
      return sendJSON(res, 200, { success: true, message: 'Password reset successfully. Sign in with your new password.' });
    });
  }

  // Profile
  if (pathname === '/api/profile') {
    const db = readDB();
    if (method === 'GET') {
      const { adminUsername, adminPassword, ...publicProfile } = db.profile || {};
      const legacyResumePath = publicProfile.resumeUrl && publicProfile.resumeUrl !== '/api/profile/cv'
        ? path.join(__dirname, '..', 'public', publicProfile.resumeUrl.replace(/^[/\\]+/, ''))
        : '';
      return sendJSON(res, 200, {
        ...publicProfile,
        cvAvailable: fs.existsSync(CV_FILE) || Boolean(legacyResumePath && fs.existsSync(legacyResumePath))
      });
    }
    if (method === 'PUT') {
      return getBody(async data => {
        const { adminUsername: ignoredUsername, adminPassword: ignoredPassword, cvAvailable: ignoredCvAvailable, ...profileUpdates } = data;
        db.profile = { ...db.profile, ...profileUpdates };
        if (!(await writeDB(db))) return sendJSON(res, 500, { success: false, message: 'Unable to save profile updates.' });
        const { adminUsername, adminPassword, ...publicProfile } = db.profile;
        const legacyResumePath = publicProfile.resumeUrl && publicProfile.resumeUrl !== '/api/profile/cv'
          ? path.join(__dirname, '..', 'public', publicProfile.resumeUrl.replace(/^[/\\]+/, ''))
          : '';
        return sendJSON(res, 200, {
          success: true,
          profile: {
            ...publicProfile,
            cvAvailable: fs.existsSync(CV_FILE) || Boolean(legacyResumePath && fs.existsSync(legacyResumePath))
          }
        });
      });
    }
  }

  // Projects
  if (pathname === '/api/projects') {
    const db = readDB();
    if (method === 'GET') {
      return sendJSON(res, 200, db.projects || []);
    }
    if (method === 'POST') {
      return getBody(async data => {
        const newProject = {
          id: 'proj-' + Date.now(),
          title: data.title || 'Untitled Project',
          category: data.category || 'Web Development',
          description: data.description || '',
          tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : []),
          githubUrl: data.githubUrl || '#',
          liveUrl: data.liveUrl || '#',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop',
          imageAsset: data.imageAsset || null,
          attachment: data.attachment || null,
          featured: Boolean(data.featured),
          year: data.year || new Date().getFullYear().toString()
        };
        db.projects.unshift(newProject);
        if (!(await writeDB(db))) return sendJSON(res, 500, { success: false, message: 'Unable to save project.' });
        return sendJSON(res, 201, { success: true, project: newProject });
      });
    }
  }

  if (pathname.startsWith('/api/projects/') && method === 'PUT') {
    const id = pathname.replace('/api/projects/', '');
    const db = readDB();
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx === -1) return sendJSON(res, 404, { success: false, message: 'Project not found' });
    return getBody(async data => {
      db.projects[idx] = { ...db.projects[idx], ...data };
      if (!(await writeDB(db))) return sendJSON(res, 500, { success: false, message: 'Unable to save project changes.' });
      return sendJSON(res, 200, { success: true, project: db.projects[idx] });
    });
  }

  if (pathname.startsWith('/api/projects/') && method === 'DELETE') {
    const id = pathname.replace('/api/projects/', '');
    const db = readDB();
    db.projects = db.projects.filter(p => p.id !== id);
    return writeDB(db).then(saved => sendJSON(res, saved ? 200 : 500, {
      success: saved,
      message: saved ? 'Project deleted' : 'Unable to delete project.'
    }));
  }

  if (pathname === '/api/certificates' && method === 'GET') {
    const certificates = (readDB().certificates || []).map(certificate => ({
      ...certificate,
      fileUrl: `/api/certificates/${certificate.id}/file`
    }));
    return sendJSON(res, 200, certificates);
  }

  if (pathname === '/api/certificates' && method === 'POST') {
    if (!isAuthenticatedAdmin(req)) return sendJSON(res, 401, { success: false, message: 'Sign in to upload certificates.' });
    const mediaTypes = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    const contentType = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    if (!mediaTypes[contentType]) {
      req.resume();
      return sendJSON(res, 415, { success: false, message: 'Upload a PDF, JPG, PNG, or WebP certificate.' });
    }

    const title = parsedUrl.searchParams.get('title')?.trim();
    const issuer = parsedUrl.searchParams.get('issuer')?.trim() || '';
    const date = parsedUrl.searchParams.get('date')?.trim() || '';
    if (!title || title.length > 120 || issuer.length > 120 || date.length > 40) {
      req.resume();
      return sendJSON(res, 400, { success: false, message: 'Enter a certificate title (up to 120 characters); issuer and date must be 120 and 40 characters or fewer.' });
    }

    const chunks = [];
    let totalBytes = 0;
    let tooLarge = false;
    req.on('data', chunk => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_CERTIFICATE_SIZE) {
        tooLarge = true;
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', async () => {
      if (tooLarge) return sendJSON(res, 413, { success: false, message: 'Certificate files must be 15 MB or smaller.' });
      if (totalBytes === 0) return sendJSON(res, 400, { success: false, message: 'Choose a certificate file to upload.' });

      const file = Buffer.concat(chunks);
      const validSignature = contentType === 'application/pdf'
        ? file.subarray(0, 5).equals(Buffer.from('%PDF-'))
        : contentType === 'image/jpeg'
          ? file[0] === 0xff && file[1] === 0xd8 && file[2] === 0xff
          : contentType === 'image/png'
            ? file.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
            : file.subarray(0, 4).toString() === 'RIFF' && file.subarray(8, 12).toString() === 'WEBP';
      if (!validSignature) return sendJSON(res, 400, { success: false, message: 'The file content does not match its selected format.' });

      const id = randomUUID();
      const fileName = `${id}.${mediaTypes[contentType]}`;
      const filePath = path.join(CERTIFICATE_DIRECTORY, fileName);
      const certificate = {
        id,
        title,
        issuer,
        date,
        contentType,
        size: totalBytes,
        fileName
      };

      try {
        await fs.promises.mkdir(CERTIFICATE_DIRECTORY, { recursive: true });
        await fs.promises.writeFile(filePath, file, { flag: 'wx' });
        const db = readDB();
        db.certificates.unshift(certificate);
        if (!(await writeDB(db))) {
          await fs.promises.unlink(filePath);
          return sendJSON(res, 500, { success: false, message: 'Unable to save certificate details.' });
        }
        return sendJSON(res, 201, {
          success: true,
          certificate: { ...certificate, fileUrl: `/api/certificates/${id}/file` }
        });
      } catch (error) {
        console.error('Unable to store certificate:', error.message);
        return sendJSON(res, 500, { success: false, message: 'Unable to store the certificate file.' });
      }
    });
    req.on('error', error => {
      console.error('Certificate upload failed:', error.message);
      if (!res.headersSent) sendJSON(res, 400, { success: false, message: 'Certificate upload failed.' });
    });
    return;
  }

  const certificateFileMatch = pathname.match(/^\/api\/certificates\/([0-9a-f-]+)\/file$/i);
  if (certificateFileMatch && method === 'GET') {
    const certificate = (readDB().certificates || []).find(item => item.id === certificateFileMatch[1]);
    if (!certificate) return sendJSON(res, 404, { success: false, message: 'Certificate not found.' });
    const filePath = path.join(CERTIFICATE_DIRECTORY, path.basename(certificate.fileName));
    return fs.readFile(filePath, (error, file) => {
      if (error) {
        if (error.code !== 'ENOENT') console.error('Unable to read certificate file:', error.message);
        return sendJSON(res, error.code === 'ENOENT' ? 404 : 500, { success: false, message: 'Unable to read certificate file.' });
      }
      res.writeHead(200, {
        'Content-Type': certificate.contentType,
        'Content-Length': file.length,
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600'
      });
      return res.end(file);
    });
  }

  const certificateMatch = pathname.match(/^\/api\/certificates\/([0-9a-f-]+)$/i);
  if (certificateMatch && method === 'DELETE') {
    if (!isAuthenticatedAdmin(req)) return sendJSON(res, 401, { success: false, message: 'Sign in to delete certificates.' });
    const db = readDB();
    const certificateIndex = (db.certificates || []).findIndex(item => item.id === certificateMatch[1]);
    if (certificateIndex === -1) return sendJSON(res, 404, { success: false, message: 'Certificate not found.' });
    const [certificate] = db.certificates.splice(certificateIndex, 1);
    return writeDB(db).then(async (saved) => {
      if (!saved) return sendJSON(res, 500, { success: false, message: 'Unable to delete certificate details.' });
      try {
        await fs.promises.unlink(path.join(CERTIFICATE_DIRECTORY, path.basename(certificate.fileName)));
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error('Unable to remove certificate file:', error.message);
          return sendJSON(res, 500, { success: false, message: 'Certificate details were removed, but the file could not be deleted.' });
        }
      }
      return sendJSON(res, 200, { success: true, message: 'Certificate deleted.' });
    });
  }

  // Skills
  if (pathname === '/api/skills') {
    const db = readDB();
    if (method === 'GET') {
      return sendJSON(res, 200, db.skills || []);
    }
    if (method === 'POST') {
      return getBody(async data => {
        const newSkill = {
          id: 'sk-' + Date.now(),
          name: data.name || 'New Skill',
          category: data.category || 'Web Development',
          proficiency: Number(data.proficiency) || 80
        };
        db.skills.push(newSkill);
        if (!(await writeDB(db))) return sendJSON(res, 500, { success: false, message: 'Unable to save skill.' });
        return sendJSON(res, 201, { success: true, skill: newSkill });
      });
    }
  }

  if (pathname.startsWith('/api/skills/') && method === 'PUT') {
    const id = pathname.replace('/api/skills/', '');
    const db = readDB();
    const idx = db.skills.findIndex(s => s.id === id);
    if (idx === -1) return sendJSON(res, 404, { success: false, message: 'Skill not found' });
    return getBody(async data => {
      db.skills[idx] = { ...db.skills[idx], ...data };
      if (!(await writeDB(db))) return sendJSON(res, 500, { success: false, message: 'Unable to save skill changes.' });
      return sendJSON(res, 200, { success: true, skill: db.skills[idx] });
    });
  }

  if (pathname.startsWith('/api/skills/') && method === 'DELETE') {
    const id = pathname.replace('/api/skills/', '');
    const db = readDB();
    db.skills = db.skills.filter(s => s.id !== id);
    return writeDB(db).then(saved => sendJSON(res, saved ? 200 : 500, {
      success: saved,
      message: saved ? 'Skill deleted' : 'Unable to delete skill.'
    }));
  }

  // Experience, Services, Blogs
  if (pathname === '/api/experience' && method === 'GET') return sendJSON(res, 200, readDB().experience || []);
  if (pathname === '/api/services' && method === 'GET') return sendJSON(res, 200, readDB().services || []);
  if (pathname === '/api/blogs' && method === 'GET') return sendJSON(res, 200, readDB().blogs || []);

  // Server Health Check
  if (pathname === '/api/health' && method === 'GET') {
    const db = readDB();
    return sendJSON(res, 200, {
      status: 'online',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      counts: {
        projects: db.projects ? db.projects.length : 0,
        skills: db.skills ? db.skills.length : 0,
        messages: db.messages ? db.messages.length : 0,
        unreadMessages: db.messages ? db.messages.filter(m => !m.read).length : 0
      }
    });
  }

  // Messages Inbox
  if (pathname === '/api/messages') {
    const db = readDB();
    if (method === 'GET') return sendJSON(res, 200, db.messages || []);
    if (method === 'POST') {
      return getBody(async data => {
        const name = typeof data.name === 'string' ? data.name.trim() : '';
        const email = typeof data.email === 'string' ? data.email.trim() : '';
        const message = typeof data.message === 'string' ? data.message.trim() : '';
        if (!name || !email || !message) {
          return sendJSON(res, 400, { success: false, message: 'Name, email, and message are required.' });
        }

        const newMsg = {
          id: 'msg-' + randomUUID(),
          name: name.slice(0, 150),
          email: email.slice(0, 254),
          phone: typeof data.phone === 'string' ? data.phone.trim().slice(0, 50) : '',
          subject: typeof data.subject === 'string' ? data.subject.trim().slice(0, 200) : 'Portfolio Contact',
          message: message.slice(0, 10000),
          timestamp: new Date().toISOString(),
          read: false
        };
        db.messages.unshift(newMsg);
        if (!(await writeDB(db))) {
          return sendJSON(res, 503, { success: false, message: 'The message could not be saved. Please try again later.' });
        }

        const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL || db.profile?.email;
        const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && notificationEmail;
        if (!smtpConfigured) {
          return sendJSON(res, 201, {
            success: true,
            emailSent: false,
            message: 'Your message was saved to the portfolio inbox, but email notifications are not configured.',
            data: newMsg
          });
        }

        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          });
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: notificationEmail,
            replyTo: newMsg.email,
            subject: `[Portfolio contact] ${newMsg.subject}`,
            text: `Name: ${newMsg.name}\nEmail: ${newMsg.email}\nPhone: ${newMsg.phone || 'Not provided'}\n\n${newMsg.message}`
          });
          return sendJSON(res, 201, {
            success: true,
            emailSent: true,
            message: 'Your message was saved and emailed successfully.',
            data: newMsg
          });
        } catch (error) {
          console.error('Contact notification email failed:', error.message);
          return sendJSON(res, 201, {
            success: true,
            emailSent: false,
            message: 'Your message was saved to the portfolio inbox, but the email notification could not be delivered.',
            data: newMsg
          });
        }
      });
    }
  }

  // Toggle Message Read Status
  if (pathname.startsWith('/api/messages/') && pathname.endsWith('/read') && method === 'PATCH') {
    const id = pathname.replace('/api/messages/', '').replace('/read', '');
    const db = readDB();
    const msg = db.messages.find(m => m.id === id);
    if (!msg) return sendJSON(res, 404, { success: false, message: 'Message not found' });
    msg.read = !msg.read;
    return writeDB(db).then(saved => sendJSON(res, saved ? 200 : 500, {
      success: saved,
      message: saved ? 'Message status updated' : 'Unable to update message status.',
      data: msg
    }));
  }

  if (pathname.startsWith('/api/messages/') && method === 'DELETE') {
    const id = pathname.replace('/api/messages/', '');
    const db = readDB();
    db.messages = db.messages.filter(m => m.id !== id);
    return writeDB(db).then(saved => sendJSON(res, saved ? 200 : 500, {
      success: saved,
      message: saved ? 'Message deleted' : 'Unable to delete message.'
    }));
  }

  return sendJSON(res, 404, { error: 'Route not found' });
});

connectDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Belayneh REST Server running on http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Unable to start the API server:', error.message);
    process.exitCode = 1;
  });
