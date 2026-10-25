import React, { useState, useEffect } from 'react';
import { 
  Lock, LayoutDashboard, FolderGit2, Cpu, Inbox, Settings, Award,
  Plus, Trash2, Edit3, CheckCircle, XCircle, Eye, EyeOff, LogOut, 
  Sparkles, Save, ShieldCheck, Mail, Phone, ExternalLink, Upload, FileText, Calendar 
} from 'lucide-react';
import { deleteProjectFile, saveProjectFile } from '../projectFiles';
import {
  deleteLocalCertificate,
  hasExpectedCertificateSignature
} from '../certificateFiles';

export default function AdminDashboard({ profile, projects, skills, certificates, messages, setProjects, setSkills, setCertificates, setMessages, setProfile }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [recoveryMode, setRecoveryMode] = useState(() => Boolean(new URLSearchParams(window.location.search).get('resetToken')));
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get('resetToken') || '');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryRequested, setRecoveryRequested] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityPasswords, setShowSecurityPasswords] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState({ newPassword: '', confirmPassword: '' });
  const [credentialsForm, setCredentialsForm] = useState({ currentUsername: '', currentPassword: '', newUsername: '', newPassword: '' });
  const [activeTab, setActiveTab] = useState('overview');

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Modals state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '', category: 'Web Development', description: '', tags: '', githubUrl: '', liveUrl: '', imageUrl: '', featured: false, year: getTodayDateString()
  });
  const [projectImageFile, setProjectImageFile] = useState(null);
  const [projectAttachmentFile, setProjectAttachmentFile] = useState(null);

  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Web Development', proficiency: 85 });

  const [certificateForm, setCertificateForm] = useState({ title: '', issuer: '', date: '', file: null });
  const [certificateUploading, setCertificateUploading] = useState(false);

  const [profileForm, setProfileForm] = useState({ ...profile });
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [statusAlert, setStatusAlert] = useState('');

  useEffect(() => {
    setProfileForm({ ...profile });
  }, [profile]);

  // Handle Admin Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminToken(data.token);
        setIsAuthenticated(true);
        return;
      }
      setAuthError(data.message || 'Invalid username or password.');
    } catch (err) {
      setAuthError('Unable to reach the authentication server. Please try again.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Unable to send a recovery email.');
        return;
      }
      setRecoveryRequested(true);
    } catch (err) {
      setAuthError('Unable to reach the authentication server. Please try again.');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (recoveryForm.newPassword !== recoveryForm.confirmPassword) {
      setAuthError('The new passwords do not match.');
      return;
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: recoveryForm.newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Unable to reset the password.');
        return;
      }
      setRecoveryMode(false);
      setResetToken('');
      setLoginForm({ username: '', password: '' });
      setRecoveryForm({ newPassword: '', confirmPassword: '' });
      window.history.replaceState({}, '', window.location.pathname);
      setAuthError('Password reset. Sign in with your new password.');
    } catch (err) {
      setAuthError('Unable to reach the authentication server. Please try again.');
    }
  };

  const handleSaveCredentials = async () => {
    setAuthError('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentialsForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showStatus(data.message || 'Unable to update admin credentials.');
        return;
      }
      setCredentialsForm({ currentUsername: '', currentPassword: '', newUsername: '', newPassword: '' });
      showStatus('Admin credentials updated. Use the new username and password next time you sign in.');
    } catch (err) {
      showStatus('Unable to reach the authentication server. Credentials were not changed.');
    }
  };

  // --- PROJECT CRUD HANDLERS ---
  const handleOpenProjectModal = (proj = null) => {
    setProjectImageFile(null);
    setProjectAttachmentFile(null);
    if (proj) {
      setEditingProject(proj);
      let formattedYear = proj.year || getTodayDateString();
      if (/^\d{4}$/.test(formattedYear)) {
        formattedYear = `${formattedYear}-01-01`;
      }
      setProjectForm({
        title: proj.title,
        category: proj.category,
        description: proj.description,
        tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : proj.tags,
        githubUrl: proj.githubUrl,
        liveUrl: proj.liveUrl,
        imageUrl: proj.imageUrl,
        featured: proj.featured,
        year: formattedYear
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        title: '', category: 'Web Development', description: '', tags: '', githubUrl: '', liveUrl: '', imageUrl: '', featured: false, year: getTodayDateString()
      });
    }
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    let imageAsset = editingProject?.imageAsset || null;
    let attachment = editingProject?.attachment || null;
    try {
      if (projectImageFile) imageAsset = await saveProjectFile(projectImageFile);
      if (projectAttachmentFile) attachment = await saveProjectFile(projectAttachmentFile);
    } catch (err) {
      showStatus('Unable to store the selected file in this browser. Try a smaller file.');
      return;
    }

    const payload = {
      ...projectForm,
      tags: projectForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      imageAsset,
      attachment
    };

    if (editingProject) {
      let savedProject;
      try {
        const res = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Project update failed.');
        savedProject = data.project;
      } catch (err) {
        savedProject = { ...editingProject, ...payload };
      }
      setProjects(current => current.map(p => p.id === editingProject.id ? savedProject : p));
    } else {
      let savedProject;
      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Project creation failed.');
        savedProject = data.project;
      } catch (err) {
        savedProject = { id: 'proj-' + Date.now(), ...payload };
      }
      setProjects(current => [savedProject, ...current.filter(p => p.id !== savedProject.id)]);
    }

    setProjectModalOpen(false);
    showStatus('Project saved successfully!');
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    const deletedProject = projects.find(project => project.id === id);
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    } catch (err) {}
    await Promise.allSettled([
      deleteProjectFile(deletedProject?.imageAsset?.id),
      deleteProjectFile(deletedProject?.attachment?.id)
    ]);
    setProjects(projects.filter(p => p.id !== id));
    showStatus('Project deleted.');
  };

  // --- SKILL CRUD HANDLERS ---
  const handleOpenSkillModal = (skill = null) => {
    if (skill) {
      setEditingSkill(skill);
      setSkillForm({ name: skill.name, category: skill.category, proficiency: skill.proficiency ?? 85 });
    } else {
      setEditingSkill(null);
      setSkillForm({ name: '', category: 'Web Development', proficiency: 85 });
    }
    setSkillModalOpen(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    if (editingSkill) {
      try {
        const res = await fetch(`/api/skills/${editingSkill.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(skillForm)
        });
        const data = await res.json();
        if (data.success) {
          setSkills(skills.map(s => s.id === editingSkill.id ? data.skill : s));
        }
      } catch (err) {
        setSkills(skills.map(s => s.id === editingSkill.id ? { ...s, ...skillForm } : s));
      }
    } else {
      try {
        const res = await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(skillForm)
        });
        const data = await res.json();
        if (data.success) {
          setSkills([...skills, data.skill]);
        }
      } catch (err) {
        const newS = { id: 'sk-' + Date.now(), ...skillForm };
        setSkills([...skills, newS]);
      }
    }
    setSkillModalOpen(false);
    showStatus('Skill saved successfully!');
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await fetch(`/api/skills/${id}`, { method: 'DELETE' });
    } catch (err) {}
    setSkills(skills.filter(s => s.id !== id));
    showStatus('Skill removed.');
  };

  const handleUploadCertificate = async (e) => {
    e.preventDefault();
    if (!certificateForm.file) {
      showStatus('Choose a certificate file to upload.');
      return;
    }
    if (certificateForm.file.size > 15 * 1024 * 1024) {
      showStatus('Certificate files must be 15 MB or smaller.');
      return;
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(certificateForm.file.type)) {
      showStatus('Upload a PDF, JPG, PNG, or WebP certificate.');
      return;
    }
    if (!(await hasExpectedCertificateSignature(certificateForm.file))) {
      showStatus('The selected file does not match its PDF or image format. Choose the original certificate file.');
      return;
    }

    setCertificateUploading(true);
    try {
      const query = new URLSearchParams({
        title: certificateForm.title.trim(),
        issuer: certificateForm.issuer.trim(),
        date: certificateForm.date.trim()
      });
      let response;
      try {
        response = await fetch(`/api/certificates?${query}`, {
          method: 'POST',
          headers: {
            'Content-Type': certificateForm.file.type,
            Authorization: `Bearer ${adminToken}`
          },
          body: certificateForm.file
        });
      } catch (error) {
        throw new Error('Unable to reach the certificate service. Start the API server and try again.');
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Certificate upload failed (HTTP ${response.status}).`);
      }
      const certificate = data.certificate;

      setCertificates(current => [certificate, ...current.filter(item => item.id !== certificate.id)]);
      setCertificateForm({ title: '', issuer: '', date: '', file: null });
      const fileInput = document.getElementById('certificate-file-input');
      if (fileInput) fileInput.value = '';
      showStatus('Certificate uploaded successfully.');
    } catch (error) {
      showStatus(error.message || 'Unable to upload certificate.');
    } finally {
      setCertificateUploading(false);
    }
  };

  const handleDeleteCertificate = async (certificate) => {
    if (!window.confirm(`Delete "${certificate.title}"?`)) return;
    try {
      if (certificate.localBlobId) {
        await deleteLocalCertificate(certificate);
      } else {
        const res = await fetch(`/api/certificates/${certificate.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error(data.message || `Unable to delete certificate (HTTP ${res.status}).`);
      }
      setCertificates(certificates.filter(item => item.id !== certificate.id));
      showStatus('Certificate deleted.');
    } catch (error) {
      showStatus(error.message || 'Unable to reach the server. Certificate was not deleted.');
    }
  };

  // --- INBOX HANDLERS ---
  const handleToggleMessageRead = async (id) => {
    try {
      const res = await fetch(`/api/messages/${id}/read`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setMessages(messages.map(m => m.id === id ? { ...m, read: !m.read } : m));
      } else {
        setMessages(messages.map(m => m.id === id ? { ...m, read: !m.read } : m));
      }
    } catch (err) {
      setMessages(messages.map(m => m.id === id ? { ...m, read: !m.read } : m));
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete message from inbox?')) return;
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    } catch (err) {}
    setMessages(messages.filter(m => m.id !== id));
    showStatus('Message deleted.');
  };

  const handleExportMessages = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `messages_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showStatus('Exported messages to JSON file!');
  };

  // --- PROFILE UPDATE HANDLER ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      } else {
        setProfile({ ...profileForm });
      }
    } catch (err) {
      setProfile({ ...profileForm });
    }
    showStatus('Profile information updated successfully!');
  };

  const handleUploadCv = async () => {
    if (!cvFile) {
      showStatus('Choose a PDF CV first.');
      return;
    }
    if (cvFile.size > 10 * 1024 * 1024) {
      showStatus('CV must be 10 MB or smaller.');
      return;
    }

    setCvUploading(true);
    try {
      const res = await fetch('/api/profile/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/pdf' },
        body: cvFile
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to upload CV.');
      const updatedProfile = { ...profile, resumeUrl: data.resumeUrl, cvAvailable: true };
      setProfile(updatedProfile);
      setProfileForm(current => ({ ...current, resumeUrl: data.resumeUrl }));
      setCvFile(null);
      showStatus('CV uploaded. The public Home page download is ready.');
    } catch (error) {
      showStatus(error.message || 'Unable to upload CV. Check that the server is running.');
    } finally {
      setCvUploading(false);
    }
  };

  const showStatus = (msg) => {
    setStatusAlert(msg);
    setTimeout(() => setStatusAlert(''), 3500);
  };

  // Render Login Modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-slate-100">Belayneh Admin Portal</h2>
            <p className="text-xs text-slate-400">Enter password to manage portfolio, projects, skills & contact inbox.</p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
              {authError}
            </div>
          )}

          {recoveryMode && resetToken ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={recoveryForm.newPassword}
                    onChange={(e) => setRecoveryForm({ ...recoveryForm, newPassword: e.target.value })}
                    className="w-full px-4 pr-12 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={recoveryForm.confirmPassword}
                  onChange={(e) => setRecoveryForm({ ...recoveryForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <button type="submit" className="w-full gradient-btn py-3.5 rounded-xl font-bold text-sm">Reset Password</button>
              <button type="button" onClick={() => { setRecoveryMode(false); setResetToken(''); setAuthError(''); window.history.replaceState({}, '', window.location.pathname); }} className="w-full text-sm text-slate-300 hover:text-white">Back to sign in</button>
            </form>
          ) : recoveryMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {recoveryRequested ? (
                <p className="text-sm text-slate-300 text-center">If that email matches the admin account, a password reset link has been sent.</p>
              ) : (
                <>
                  <p className="text-xs text-slate-400 text-center">Enter the email address associated with the admin account.</p>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Admin Email</label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button type="submit" className="w-full gradient-btn py-3.5 rounded-xl font-bold text-sm">Send reset link</button>
                </>
              )}
              <button type="button" onClick={() => { setRecoveryMode(false); setRecoveryRequested(false); setAuthError(''); }} className="w-full text-sm text-slate-300 hover:text-white">Back to sign in</button>
            </form>
          ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 pr-12 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full gradient-btn py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-emerald-500 shadow-lg shadow-amber-500/20"
            >
              Unlock Admin Portal
            </button>
          </form>
          )}
          {!recoveryMode && <button type="button" onClick={() => { setRecoveryMode(true); setRecoveryRequested(false); setAuthError(''); }} className="w-full text-sm text-amber-400 hover:text-amber-300">Forgot password?</button>}
        </div>
      </div>
    );
  }

  const unreadMessagesCount = messages.filter(m => !m.read).length;

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner Bar */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-amber-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2">
              <span>Admin Management Dashboard</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">Live Mode</span>
            </h1>
            <p className="text-xs text-slate-400">Welcome, Belayneh Shiferaw. Full CRUD control over portfolio data.</p>
          </div>
        </div>

        <button
          onClick={() => { setIsAuthenticated(false); setAdminToken(''); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Lock Dashboard</span>
        </button>
      </div>

      {statusAlert && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5" />
          <span>{statusAlert}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'overview' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'projects' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'skills' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Skills ({skills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'certificates' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificates ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
            activeTab === 'messages' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Inbox ({messages.length})</span>
          {unreadMessagesCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'profile' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* --- TAB 1: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase">Total Projects</div>
              <div className="text-3xl font-bold font-heading text-emerald-400">{projects.length}</div>
              <div className="text-xs text-slate-500">Live in portfolio</div>
            </div>

            <div className="glass-card p-6 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase">Skill Badges</div>
              <div className="text-3xl font-bold font-heading text-cyan-400">{skills.length}</div>
              <div className="text-xs text-slate-500">Categorized proficiencies</div>
            </div>

            <div className="glass-card p-6 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase">Inbox Messages</div>
              <div className="text-3xl font-bold font-heading text-purple-400">{messages.length}</div>
              <div className="text-xs text-slate-500">Visitor inquiries</div>
            </div>

            <div className="glass-card p-6 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase">System Status</div>
              <div className="text-xl font-bold font-heading text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Online
              </div>
              <div className="text-xs text-slate-500">Node REST API Proxy Active</div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-bold font-heading text-slate-100">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => { setActiveTab('projects'); handleOpenProjectModal(); }}
                className="gradient-btn px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Project
              </button>

              <button
                onClick={() => { setActiveTab('skills'); handleOpenSkillModal(); }}
                className="gradient-btn-outline px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Skill
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-2"
              >
                <Inbox className="w-4 h-4 text-purple-400" /> View Inbox ({messages.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: PROJECTS MANAGER --- */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-heading text-slate-100">Manage Portfolio Projects</h2>
            <button
              onClick={() => handleOpenProjectModal()}
              className="gradient-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="glass-card p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                      {proj.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      {proj.year}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-slate-100">{proj.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>

                  <div className="flex flex-wrap gap-1 pt-2">
                    {proj.tags && proj.tags.map((t, i) => (
                      <span key={i} className="text-[10px] bg-slate-900 text-emerald-400 border border-slate-800 px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{proj.featured ? '⭐ Featured' : 'Standard'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenProjectModal(proj)}
                      className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-emerald-400"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: SKILLS MANAGER --- */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-heading text-slate-100">Manage Skills & Proficiencies</h2>
            <button
              onClick={() => handleOpenSkillModal()}
              className="gradient-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {skills.map((sk) => (
              <div key={sk.id} className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-100">{sk.name}</div>
                    <div className="text-xs text-slate-400">{sk.category}</div>
                  </div>
                  {Number.isFinite(sk.proficiency) && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                      {sk.proficiency}%
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenSkillModal(sk)}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-emerald-400"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(sk.id)}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-100">Manage Certificate Papers</h2>
            <p className="mt-1 text-sm text-slate-400">Upload original PDF or image certificates (JPG, PNG, WebP), up to 15 MB each.</p>
          </div>

          <form onSubmit={handleUploadCertificate} className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm font-semibold text-slate-300">
              Certificate title
              <input
                type="text"
                required
                maxLength={120}
                value={certificateForm.title}
                onChange={(e) => setCertificateForm({ ...certificateForm, title: e.target.value })}
                placeholder="Certificate title"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-300">
              Issuing organization
              <input
                type="text"
                maxLength={120}
                value={certificateForm.issuer}
                onChange={(e) => setCertificateForm({ ...certificateForm, issuer: e.target.value })}
                placeholder="Organization or institution"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-300">
              Date issued
              <input
                type="text"
                maxLength={40}
                value={certificateForm.date}
                onChange={(e) => setCertificateForm({ ...certificateForm, date: e.target.value })}
                placeholder="e.g. 2025"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-300">
              Certificate file
              <input
                id="certificate-file-input"
                type="file"
                required
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(e) => setCertificateForm({ ...certificateForm, file: e.target.files?.[0] || null })}
                className="text-sm"
              />
            </label>
            <div className="md:col-span-2">
              <button type="submit" disabled={certificateUploading} className="gradient-btn px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
                <Upload className="w-4 h-4" />
                {certificateUploading ? 'Uploading…' : 'Upload Certificate'}
              </button>
            </div>
          </form>

          {certificates.length === 0 ? (
            <p className="glass-card p-6 text-sm text-slate-400">No certificate papers uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="glass-card p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-100 truncate">{certificate.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {[certificate.issuer, certificate.date].filter(Boolean).join(' · ') || certificate.contentType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={certificate.fileUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-emerald-400" aria-label={`View ${certificate.title}`}>
                      <FileText className="w-4 h-4" />
                    </a>
                    <button type="button" onClick={() => handleDeleteCertificate(certificate)} className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-red-400" aria-label={`Delete ${certificate.title}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 4: INBOX MESSAGES --- */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-3">
                <span>Contact Form Submissions</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
                  {messages.length} Total
                </span>
              </h2>
            </div>

            {messages.length > 0 && (
              <button
                onClick={handleExportMessages}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
              >
                <span>Export Messages (.json)</span>
              </button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400">
              No inbox messages received yet.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`glass-card p-6 space-y-3 transition-all ${
                    msg.read ? 'opacity-85 border-slate-800/60' : 'border-emerald-500/30 bg-emerald-950/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        {!msg.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="New Unread Message" />
                        )}
                        <span>{msg.name}</span>
                        {msg.subject && <span className="text-xs text-emerald-400 font-normal">({msg.subject})</span>}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-cyan-400" /> {msg.email}</span>
                        {msg.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {msg.phone}</span>}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleToggleMessageRead(msg.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                        msg.read 
                          ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' 
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {msg.read ? 'Mark as Unread' : 'Mark as Read'}
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 5: PROFILE SETTINGS --- */}
      {activeTab === 'profile' && (
        <div className="glass-card p-8 space-y-6 max-w-3xl">
          <h2 className="text-xl font-bold font-heading text-slate-100">Edit Portfolio Profile Details</h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Role / Subtitle</label>
                <input
                  type="text"
                  value={profileForm.role || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Direct Phone</label>
                <input
                  type="text"
                  value={profileForm.phone || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Contact Email</label>
                <input
                  type="email"
                  value={profileForm.email || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">LinkedIn Profile URL</label>
              <input
                type="url"
                value={profileForm.linkedin || ''}
                onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                placeholder="https://www.linkedin.com/in/your-profile/"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Profile Photo Image URL / Path</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/50 flex-shrink-0 bg-slate-900">
                  <img 
                    src={profileForm.avatarUrl || "/belayneh.jpg"} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <input
                  type="text"
                  value={profileForm.avatarUrl || '/belayneh.jpg'}
                  onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                  placeholder="/belayneh.jpg"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Location</label>
              <input
                type="text"
                value={profileForm.location || ''}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Bio Overview</label>
              <textarea
                rows="4"
                value={profileForm.bio || ''}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div>
                <label htmlFor="profile-cv-upload" className="text-xs font-semibold text-slate-300">CV / Resume PDF</label>
                <p className="mt-1 text-xs text-slate-500">Upload a PDF up to 10 MB. It will be available to visitors from the Home page.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  id="profile-cv-upload"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="min-w-0 flex-1 text-xs text-slate-300"
                />
                <button
                  type="button"
                  onClick={handleUploadCv}
                  disabled={!cvFile || cvUploading}
                  className="gradient-btn flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" /> {cvUploading ? 'Uploading...' : 'Upload CV'}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                {profile.cvAvailable ? 'A CV is published for visitor downloads.' : 'No CV is published yet. Upload a PDF to enable the Home page download.'}
              </p>
            </div>

            <button
              type="submit"
              className="gradient-btn flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </form>

          <section className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Admin Login Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Current Username</label>
                <input type="text" autoComplete="username" value={credentialsForm.currentUsername} onChange={(e) => setCredentialsForm({ ...credentialsForm, currentUsername: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Current Password</label>
                <input type={showSecurityPasswords ? 'text' : 'password'} autoComplete="current-password" value={credentialsForm.currentPassword} onChange={(e) => setCredentialsForm({ ...credentialsForm, currentPassword: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">New Username</label>
                <input type="text" required autoComplete="username" value={credentialsForm.newUsername} onChange={(e) => setCredentialsForm({ ...credentialsForm, newUsername: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">New Password (minimum 8 characters)</label>
                <input type={showSecurityPasswords ? 'text' : 'password'} minLength={8} autoComplete="new-password" value={credentialsForm.newPassword} onChange={(e) => setCredentialsForm({ ...credentialsForm, newPassword: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setShowSecurityPasswords(!showSecurityPasswords)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold">
                {showSecurityPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSecurityPasswords ? 'Hide passwords' : 'Show passwords'}
              </button>
              <button type="button" onClick={handleSaveCredentials} disabled={!credentialsForm.currentUsername || !credentialsForm.currentPassword || !credentialsForm.newUsername || credentialsForm.newPassword.length < 8} className="gradient-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                <Save className="w-4 h-4" /> Update Admin Credentials
              </button>
            </div>
          </section>
        </div>
      )}

      {/* PROJECT EDIT/ADD MODAL */}
      {projectModalOpen && (
        <div className="project-modal-backdrop bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card project-modal-panel max-w-xl w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-heading text-slate-100">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button onClick={() => setProjectModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Project Title</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Category</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Network Design">Network Design</option>
                    <option value="IoT & Full Stack">IoT & Full Stack</option>
                    <option value="Database & Web">Database & Web</option>
                    <option value="Python & NLP">Python & NLP</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      Date / Year
                    </label>
                    <button
                      type="button"
                      onClick={() => setProjectForm(prev => ({ ...prev, year: getTodayDateString() }))}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors underline cursor-pointer"
                    >
                      Set Today
                    </button>
                  </div>
                  <input
                    type="date"
                    value={projectForm.year}
                    onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 cursor-pointer dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Description</label>
                <textarea
                  rows="3"
                  required
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Cisco Packet Tracer, MySQL"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Image URL</label>
                <input
                  type="text"
                  value={projectForm.imageUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Upload project image from this device</label>
                <label className="project-file-picker flex items-center gap-3 px-3 py-3 rounded-lg border border-dashed border-slate-700 bg-slate-900/60 text-slate-300 cursor-pointer hover:border-emerald-500/60">
                  <Upload className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{projectImageFile?.name || editingProject?.imageAsset?.name || 'Choose an image file'}</span>
                  <input type="file" accept="image/*" className="project-file-input" onChange={(e) => setProjectImageFile(e.target.files?.[0] || null)} />
                </label>
                <p className="text-[11px] text-slate-500">A selected image overrides the image URL and is saved in this browser.</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Project file (optional)</label>
                <label className="project-file-picker flex items-center gap-3 px-3 py-3 rounded-lg border border-dashed border-slate-700 bg-slate-900/60 text-slate-300 cursor-pointer hover:border-emerald-500/60">
                  <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{projectAttachmentFile?.name || editingProject?.attachment?.name || 'Choose a project file'}</span>
                  <input type="file" accept=".pkt,.pdf,.zip,.rar,.7z,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.json,.sql,.txt" className="project-file-input" onChange={(e) => setProjectAttachmentFile(e.target.files?.[0] || null)} />
                </label>
                <p className="text-[11px] text-slate-500">Packet Tracer, PDF, ZIP, documents, and common project files are supported. Stored in this browser.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">GitHub Repository URL</label>
                  <input
                    type="text"
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Live Demo URL</label>
                  <input
                    type="text"
                    value={projectForm.liveUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={projectForm.featured}
                  onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                  className="rounded text-emerald-500 bg-slate-900 border-slate-800"
                />
                <label htmlFor="featured" className="font-semibold text-slate-300">Feature this project on homepage</label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-btn px-5 py-2 rounded-lg font-bold"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SKILL EDIT/ADD MODAL */}
      {skillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-heading text-slate-100">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </h3>
              <button onClick={() => setSkillModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Skill Name</label>
                <input
                  type="text"
                  required
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Category</label>
                <select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Network Design">Network Design</option>
                  <option value="Database Architecture">Database Architecture</option>
                  <option value="Languages & Tools">Languages & Tools</option>
                  <option value="IoT & Hardware">IoT & Hardware</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Proficiency Score ({skillForm.proficiency}%)</label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={skillForm.proficiency}
                  onChange={(e) => setSkillForm({ ...skillForm, proficiency: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSkillModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-btn px-5 py-2 rounded-lg font-bold"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
