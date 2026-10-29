import React, { useState, useEffect } from 'react';
import SidebarLayout from './components/SidebarLayout';
import HeroDashboard from './components/HeroDashboard';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import Education from './components/Education';
import Achievements from './components/Achievements';
import Timeline from './components/Timeline';
import { getLocalCertificates } from './certificateFiles';

const PROJECTS_STORAGE_KEY = 'belayneh-portfolio-projects';

const starterSkills = [
  { id: 'starter-skill-react', name: 'React', category: 'Web Development' },
  { id: 'starter-skill-node', name: 'Node.js', category: 'Web Development' },
  { id: 'starter-skill-express', name: 'Express', category: 'Web Development' },
  { id: 'starter-skill-php', name: 'PHP', category: 'Web Development' },
  { id: 'starter-skill-cisco', name: 'Cisco Packet Tracer', category: 'Network Design' },
  { id: 'starter-skill-vlans', name: 'VLANs', category: 'Network Design' },
  { id: 'starter-skill-routers', name: 'Routers', category: 'Network Design' },
  { id: 'starter-skill-switches', name: 'Switches', category: 'Network Design' },
  { id: 'starter-skill-mysql', name: 'MySQL Stored Procedures', category: 'Database Architecture' },
  { id: 'starter-skill-mongodb', name: 'MongoDB', category: 'Database Architecture' },
  { id: 'starter-skill-javascript', name: 'JavaScript', category: 'Languages & Tools' },
  { id: 'starter-skill-python', name: 'Python', category: 'Languages & Tools' },
  { id: 'starter-skill-esp32', name: 'ESP32', category: 'IoT & Hardware' },
  { id: 'starter-skill-sensors', name: 'Sensor Controls', category: 'IoT & Hardware' }
];

const starterProjects = [
  {
    id: 'starter-portfolio-cms',
    title: 'Portfolio CMS & Project Showcase',
    category: 'Web Development',
    description: 'A React and Vite portfolio backed by an Express JSON API, with an admin dashboard for managing project entries and browser-local persistence when the API is unavailable.',
    tags: ['React', 'Vite', 'Node.js', 'Express', 'Local Storage'],
    githubUrl: '#',
    liveUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
    featured: true,
    year: '2026'
  },
  {
    id: 'starter-hotel-network',
    title: 'Hotel Management Network Design',
    category: 'Network Design',
    description: 'A Cisco Packet Tracer network design for hotel management operations, organized around the connectivity needs of front desk, administration, staff, and guests.',
    tags: ['Cisco Packet Tracer', 'Network Design', 'Routing & Switching'],
    githubUrl: '#',
    liveUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
    featured: true,
    year: '2026'
  }
];

const readStoredProjects = () => {
  try {
    const storedProjects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    return Array.isArray(storedProjects) ? storedProjects : [];
  } catch {
    return [];
  }
};

const mergeProjects = (...projectLists) => {
  const projectsById = new Map();
  projectLists.flat().forEach((project) => {
    if (project && project.id) projectsById.set(project.id, project);
  });
  return Array.from(projectsById.values());
};

export default function App() {
  const [theme, setTheme] = useState(() => {
    let savedTheme = 'light';
    try {
      savedTheme = window.localStorage.getItem('portfolio-theme') || 'light';
    } catch (err) {
      console.warn('Unable to read saved theme preference:', err);
    }
    const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.toggle('light-theme', initialTheme === 'light');
    return initialTheme;
  });
  const [currentView, setCurrentView] = useState(() => (
    window.location.pathname.replace(/\/+$/, '').toLowerCase() === '/admin' ||
    new URLSearchParams(window.location.search).has('resetToken')
      ? 'admin'
      : 'public'
  )); // 'public' | 'admin'
  const [activeSection, setActiveSection] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');

  // Default fallback data for Belayneh Shiferaw
  const [profile, setProfile] = useState({
    name: 'Belayneh Shiferaw',
    role: 'Software Developer',
    tagline: 'I build useful web applications and reliable networks, with a focus on thoughtful design and solving real problems.',
    bio: 'I am a graduating Computer Science student at Bahir Dar University. Since beginning my studies in 2024, I have enjoyed turning ideas into practical technology by building web applications and APIs, designing databases and computer networks, and exploring how software and IoT hardware can work together.',
    location: 'Bahir Dar, Ethiopia',
    phone: '0930584008',
    email: 'belexshiferaw@gmail.com',
    telegram: 'https://t.me/Tele_ale12',
    github: 'https://github.com/BelaynehShiferaw',
    linkedin: 'https://www.linkedin.com/in/belayneh-shiferaw-1b9389387/',
    avatarUrl: '/belayneh.jpg',
    resumeUrl: '/resume.pdf',
    status: 'Actively seeking professional opportunities'
  });

  const [projects, setProjects] = useState(() =>
    mergeProjects(readStoredProjects(), starterProjects)
  );
  const [skills, setSkills] = useState(starterSkills);
  const [experience, setExperience] = useState([]);
  const [certificates, setCertificates] = useState(getLocalCertificates);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigateToView = (nextView) => {
    const resolvedView = typeof nextView === 'function' ? nextView(currentView) : nextView;
    if (resolvedView !== currentView) {
      window.history.pushState({}, '', resolvedView === 'admin' ? '/admin' : '/');
      setCurrentView(resolvedView);
    }
  };

  useEffect(() => {
    const handleHistoryNavigation = () => {
      setCurrentView(
        window.location.pathname.replace(/\/+$/, '').toLowerCase() === '/admin'
          ? 'admin'
          : 'public'
      );
    };

    window.addEventListener('popstate', handleHistoryNavigation);
    return () => window.removeEventListener('popstate', handleHistoryNavigation);
  }, []);

  // Fetch initial data from Express REST Server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, projRes, skRes, expRes, msgRes, certRes] = await Promise.allSettled([
          fetch('/api/profile').then(r => r.json()),
          fetch('/api/projects').then(r => r.json()),
          fetch('/api/skills').then(r => r.json()),
          fetch('/api/experience').then(r => r.json()),
          fetch('/api/messages').then(r => r.json()),
          fetch('/api/certificates').then(r => r.json())
        ]);

        if (profRes.status === 'fulfilled' && profRes.value) setProfile(profRes.value);
        if (projRes.status === 'fulfilled' && Array.isArray(projRes.value)) {
          setProjects(mergeProjects(readStoredProjects(), projRes.value, starterProjects));
        }
        if (skRes.status === 'fulfilled' && Array.isArray(skRes.value) && skRes.value.length > 0) {
          setSkills(skRes.value);
        }
        if (expRes.status === 'fulfilled' && Array.isArray(expRes.value)) setExperience(expRes.value);
        if (msgRes.status === 'fulfilled' && Array.isArray(msgRes.value)) setMessages(msgRes.value);
        if (certRes.status === 'fulfilled' && Array.isArray(certRes.value)) {
          const localCertificates = getLocalCertificates();
          const serverCertificates = certRes.value.filter(
            certificate => !localCertificates.some(local => local.id === certificate.id)
          );
          setCertificates([...localCertificates, ...serverCertificates]);
        }
      } catch (err) {
        console.warn('Backend connection warning, using default data store:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (err) {
      console.warn('Unable to save projects to browser storage:', err);
    }
  }, [projects, loading]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('light-theme', nextTheme === 'light');
    try {
      window.localStorage.setItem('portfolio-theme', nextTheme);
    } catch (err) {
      console.warn('Unable to save theme preference:', err);
    }
  };

  const handleNewMessage = (newMsg) => {
    setMessages(prev => [newMsg, ...prev]);
  };

  // Filter projects by search term if typed
  const filteredProjects = searchTerm
    ? projects.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    : projects;

  const renderPublicView = () => {
    const featuredProject = filteredProjects.find(project => project.featured) || filteredProjects[0];

    if (activeSection === 'home') {
      return (
        <div className="portfolio-home">
          <HeroDashboard profile={profile} projects={projects} />
          {featuredProject && (
            <section id="projects-preview" className="featured-preview">
              <div className="featured-preview-heading">
                <div>
                  <p>Featured work</p>
                  <h2>Recent systems I’ve built</h2>
                </div>
                <button type="button" onClick={() => setActiveSection('projects')}>
                  View all projects <span aria-hidden="true">→</span>
                </button>
              </div>
              <button
                type="button"
                className="featured-preview-project"
                onClick={() => setActiveSection('projects')}
              >
                <span className="featured-preview-tags">{(featuredProject.tags || []).join(' · ')}</span>
                <h3>{featuredProject.title}</h3>
                <p>{featuredProject.description}</p>
                <span className="featured-preview-action">Explore project details <span aria-hidden="true">→</span></span>
              </button>
            </section>
          )}
          <About experience={experience} profile={profile} />
          <Skills skills={skills} />
          <Projects projects={filteredProjects} />
          <section id="experience" className="portfolio-anchor">
            <Timeline />
          </section>
          <section id="education" className="portfolio-anchor">
            <Education profile={profile} />
          </section>
          <section id="achievements" className="portfolio-anchor">
            <Achievements certificates={certificates} />
          </section>
          <Contact profile={profile} onSendMessage={handleNewMessage} />
        </div>
      );
    }

    switch (activeSection) {
      case 'about':
        return <About experience={experience} profile={profile} />;
      case 'skills':
        return <Skills skills={skills} />;
      case 'projects':
        return <Projects projects={filteredProjects} />;
      case 'experience':
        return <Timeline />;
      case 'education':
        return <Education profile={profile} />;
      case 'achievements':
        return <Achievements certificates={certificates} eager />;
      case 'contact':
        return <Contact profile={profile} onSendMessage={handleNewMessage} />;
      default:
        return <HeroDashboard profile={profile} projects={projects} />;
    }
  };

  return (
    currentView === 'public' ? (
      <SidebarLayout
        currentView={currentView}
        setCurrentView={navigateToView}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        profile={profile}
        theme={theme}
        toggleTheme={toggleTheme}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      >
        <div className="portfolio-page">
          {renderPublicView()}
          <Footer
            profile={profile}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            setCurrentView={navigateToView}
          />
        </div>
      </SidebarLayout>
    ) : (
      <SidebarLayout
        currentView={currentView}
        setCurrentView={navigateToView}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        profile={profile}
        theme={theme}
        toggleTheme={toggleTheme}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      >
        <div>
          <AdminDashboard 
            profile={profile}
            projects={projects}
            skills={skills}
            certificates={certificates}
            messages={messages}
            setProjects={setProjects}
            setSkills={setSkills}
            setCertificates={setCertificates}
            setMessages={setMessages}
            setProfile={setProfile}
          />
          <Footer
            profile={profile}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            setCurrentView={navigateToView}
          />
        </div>
      </SidebarLayout>
    )
  );
}
