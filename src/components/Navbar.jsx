import React, { useState } from 'react';
import { Menu, X, Sun, Moon, ShieldCheck, UsersRound, Home, User, FolderGit2, Code2, Mail } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, currentView, setCurrentView, setActiveSection, profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home', icon: Home },
    { name: 'About Me', href: '#about', icon: User },
    { name: 'Projects', href: '#projects', icon: FolderGit2 },
    { name: 'Skills', href: '#skills', icon: Code2 },
    { name: 'Contact', href: '#contact', icon: Mail },
  ];

  const handleNavClick = (href) => {
    setMobileOpen(false);
    const sectionId = href.replace('#', '');
    setActiveSection(sectionId);
    if (currentView !== 'public') {
      setCurrentView('public');
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="sticky top-0 z-50 glass-nav transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 transition-colors hover:border-emerald-400/50 hover:text-emerald-300"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="hidden min-w-0 text-left sm:block">
              <div style={{ minWidth: 0 }}>
                <span className="block truncate text-lg font-bold font-heading bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  {profile.name || 'Belayneh Shiferaw'}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" /> {profile.role || 'Software Developer'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentView(currentView === 'admin' ? 'public' : 'admin')}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                currentView === 'admin'
                  ? 'border-amber-400/50 bg-amber-400/10 text-amber-300'
                  : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-400/50 hover:text-emerald-300'
              }`}
              title={currentView === 'admin' ? 'Exit admin' : 'Admin panel'}
              aria-label={currentView === 'admin' ? 'Exit admin' : 'Admin panel'}
            >
              <UsersRound className="h-5 w-5" />
            </button>

            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300 transition-colors hover:border-emerald-400/50 hover:text-emerald-300"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => {
                setActiveSection('home');
                setCurrentView('public');
                setMobileOpen(false);
              }}
              className="h-9 w-9 overflow-hidden rounded-full border border-emerald-400/60 transition-shadow hover:shadow-md hover:shadow-emerald-500/20"
              title="View portfolio profile"
              aria-label="View portfolio profile"
            >
              <img src={profile.avatarUrl || '/belayneh.jpg'} alt="" className="h-full w-full object-cover" />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-slate-950/65 backdrop-blur-sm"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside style={{ width: 'min(20rem, 86vw)' }} className="absolute inset-y-0 left-0 z-10 flex flex-col border-r border-slate-800 bg-slate-950 px-5 py-5 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <img src={profile.avatarUrl || '/belayneh.jpg'} alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover" />
                <div style={{ minWidth: 0 }}>
                  <p className="truncate text-sm font-bold text-slate-100">{profile.name || 'Belayneh Shiferaw'}</p>
                  <p className="truncate text-xs text-slate-400">{profile.role || 'Software Developer'}</p>
                </div>
              </div>
              <button type="button" onClick={() => setMobileOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white" aria-label="Close navigation menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav aria-label="Portfolio navigation" className="flex-1 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-900 hover:text-emerald-300"
                  >
                    <Icon className="h-4 w-4 text-emerald-400" />
                    {link.name}
                  </a>
                );
              })}
            </nav>
            <a href={`mailto:${profile.email || 'belexshiferaw@gmail.com'}`} className="mt-5 flex items-center gap-2 border-t border-slate-800 pt-5 text-sm text-slate-400 hover:text-cyan-300">
              <Mail className="h-4 w-4" /> {profile.email || 'belexshiferaw@gmail.com'}
            </a>
          </aside>
        </div>
      )}
    </header>
  );
}
