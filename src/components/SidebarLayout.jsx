import React, { useState, useEffect } from 'react';
import { 
  Home, User, Code2, FolderGit2, Briefcase, GraduationCap, 
  Trophy, FileText, 
  LogOut, Search, Settings, Download, ChevronLeft, ChevronRight, 
  Menu, X, Sparkles, ShieldCheck, Sun, Moon, UsersRound
} from 'lucide-react';

export default function SidebarLayout({ 
  children, 
  currentView, 
  setCurrentView, 
  activeSection, 
  setActiveSection, 
  profile,
  theme,
  toggleTheme,
  searchTerm,
  setSearchTerm
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuGroups = [
    {
      title: 'MAIN',
      items: [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'about', label: 'About Me', icon: User }
      ]
    },
    {
      title: 'PORTFOLIO',
      items: [
        { id: 'skills', label: 'Skills', icon: Code2 },
        { id: 'projects', label: 'Projects', icon: FolderGit2 },
        { id: 'experience', label: 'Experience', icon: Briefcase },
          { id: 'education', label: 'Education', icon: GraduationCap }
      ]
    },
    {
      title: 'ACHIEVEMENTS',
      items: [
        { id: 'achievements', label: 'Achievements', icon: Trophy }
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { id: 'contact', label: 'Contact', icon: FileText }
      ]
    }
  ];

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (currentView !== 'public') {
      setCurrentView('public');
    }
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex overflow-x-hidden">
      
      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* --- TOP DASHBOARD HEADER BAR --- */}
        <header className="portfolio-header sticky top-0 z-30 border-b px-4 sm:px-6">
          <div className="header-top-row">
          
          {/* Left: Mobile Menu Toggle & Search Bar */}
          <div className="header-search-group flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input */}
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search projects, skills, blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-all"
              />
            </div>
          </div>

          {currentView === 'public' && (
            <nav className="public-section-nav" aria-label="Portfolio pages">
              {menuGroups.flatMap((group) => group.items).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`public-section-nav-link${activeSection === item.id ? ' is-active' : ''}`}
                    aria-label={item.label}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Header Action Icons */}
          <div className="header-actions flex items-center gap-3">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>

            {currentView === 'admin' && (
              <button 
                onClick={() => setCurrentView('public')}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/15"
                title="Exit Admin panel"
                aria-label="Exit Admin panel"
              >
                <LogOut className="w-4 h-4" />
                <span>Portfolio</span>
              </button>
            )}

            {/* Download Resume Button */}
            <a 
              href={profile.resumeUrl || "/resume.pdf"}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Resume</span>
            </a>

          </div>
          </div>
        </header>

        {/* --- MOBILE DRAWER SLIDE-OVER --- */}
        {mobileMenuOpen && (
          <div className="navigation-drawer-backdrop">
            <div className="navigation-drawer-scrim" onClick={() => setMobileMenuOpen(false)} />
            <div className="navigation-drawer-panel bg-[#0b1320] p-5 space-y-6 flex flex-col z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xl font-bold font-heading text-slate-100">Portfolio</span>
                <button onClick={() => setMobileMenuOpen(false)} className="drawer-close-button" aria-label="Close navigation menu">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {menuGroups.map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{group.title}</div>
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`drawer-nav-button${activeSection === item.id ? ' is-active' : ''}`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 min-w-0 py-6 sm:py-8">
          {children}
        </main>

      </div>

    </div>
  );
}
