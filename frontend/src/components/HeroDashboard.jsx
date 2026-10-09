import React, { useEffect, useState } from 'react';
import { 
  Briefcase, Code, MapPin, Sparkles, FolderGit2, 
  Layers, CheckCircle2, Award, Terminal, ArrowRight, Download 
} from 'lucide-react';

const heroRoles = ['Software Developer', 'and Network Designer'];

export default function HeroDashboard({ profile, projects = [] }) {
  const name = profile.name || 'Belayneh Shiferaw';
  const [greetingText, setGreetingText] = useState('');
  const [displayedName, setDisplayedName] = useState('');
  const [displayedRole, setDisplayedRole] = useState('');
  const [activeRole, setActiveRole] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setGreetingText("Hi, I'm");
      setDisplayedName(name);
      setDisplayedRole(heroRoles[0]);
      setActiveRole(0);
      return undefined;
    }

    let timeoutId;
    let cancelled = false;
    setGreetingText('');
    setDisplayedName('');
    setDisplayedRole('');

    const typeText = (text, update, speed, onComplete) => {
      let index = 0;
      const typeNextCharacter = () => {
        if (cancelled) return;
        index += 1;
        update(text.slice(0, index));
        if (index < text.length) {
          timeoutId = window.setTimeout(typeNextCharacter, speed);
        } else if (onComplete) {
          timeoutId = window.setTimeout(onComplete, 180);
        }
      };
      typeNextCharacter();
    };

    const eraseRole = (roleIndex) => {
      let remaining = heroRoles[roleIndex].length;
      const eraseNextCharacter = () => {
        if (cancelled) return;
        remaining -= 1;
        setDisplayedRole(heroRoles[roleIndex].slice(0, remaining));
        if (remaining > 0) {
          timeoutId = window.setTimeout(eraseNextCharacter, 38);
        } else {
          const nextRole = (roleIndex + 1) % heroRoles.length;
          setActiveRole(nextRole);
          timeoutId = window.setTimeout(() => typeRole(nextRole), 220);
        }
      };
      eraseNextCharacter();
    };

    const typeRole = (roleIndex) => {
      typeText(heroRoles[roleIndex], setDisplayedRole, 75, () => {
        timeoutId = window.setTimeout(() => eraseRole(roleIndex), 1800);
      });
    };

    typeText("Hi, I'm", setGreetingText, 95, () => {
      typeText(name, setDisplayedName, 105, () => typeRole(0));
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [name]);

  return (
    <section 
      id="home" 
      className="relative pt-8 pb-16 px-4 sm:px-8 lg:px-12 bg-[#060b13] overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Hero Text & 4 Stat Cards */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Large Typography Header */}
            <div className="space-y-3">
              <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tight font-heading text-slate-100">
                {greetingText}
              </h1>

              <div className="flex items-center gap-3">
                <div className="w-2.5 h-12 sm:h-16 bg-emerald-400 rounded-full animate-pulse" />
                <div className="text-4xl sm:text-6xl lg:text-7xl font-bold font-heading text-slate-200">
                  {displayedName}
                </div>
              </div>

              <div
                className="hero-role-line text-2xl sm:text-3xl font-bold text-emerald-400"
                aria-label={heroRoles[activeRole]}
              >
                <span className="hero-role-text" aria-hidden="true">
                  {displayedRole}
                </span>
              </div>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                I enjoy turning real-world problems into useful technology—from friendly web apps and dependable APIs to secure networks.
              </p>
            </div>

            {/* 2x2 METRIC SUMMARY CARDS GRID (Matching Reference Image) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Card 1: EXPERIENCE */}
              <div className="bg-[#0e1726]/90 border border-slate-800/80 p-5 rounded-2xl space-y-2 hover:border-emerald-500/40 transition-all">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">EXPERIENCE</div>
                <div className="text-2xl font-black font-heading text-slate-100">2+ years</div>
                <div className="text-xs text-slate-400">Real-world web development and internships</div>
              </div>

              {/* Card 2: PROJECTS */}
              <div className="bg-[#0e1726]/90 border border-slate-800/80 p-5 rounded-2xl space-y-2 hover:border-emerald-500/40 transition-all">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">PROJECTS</div>
                <div className="text-2xl font-black font-heading text-slate-100">{projects.length}</div>
                <div className="text-xs text-slate-400">Web apps, management tools, and IoT prototypes</div>
              </div>

              {/* Card 3: STACK */}
              <div className="bg-[#0e1726]/90 border border-slate-800/80 p-5 rounded-2xl space-y-2 hover:border-emerald-500/40 transition-all">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">STACK</div>
                <div className="text-lg font-extrabold text-emerald-400">React · Node · Mongo</div>
                <div className="text-xs text-slate-400">Modern stacks for production systems</div>
              </div>

              {/* Card 4: STATUS */}
              <div className="bg-[#0e1726]/90 border border-slate-800/80 p-5 rounded-2xl space-y-2 hover:border-emerald-500/40 transition-all">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">STATUS</div>
                <div className="text-lg font-extrabold text-cyan-400">Open to work</div>
                <div className="text-xs text-slate-400">Remote, hybrid, and local roles</div>
              </div>

            </div>

            {/* CV action */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {profile.cvAvailable ? (
                <a 
                  href={profile.resumeUrl || '/api/profile/cv'}
                  download
                  className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-sm hover:border-slate-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download CV
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  title="A CV has not been uploaded yet"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-bold text-sm cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> CV not uploaded
                </button>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: MOVABLE & FLOATING PROFILE CARD (Matching Reference Image) */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end pt-4 lg:pt-0">
            <div 
              className="bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-slate-950/80 max-w-sm w-full space-y-6 select-none transition-shadow hover:shadow-emerald-500/10 group"
            >
              {/* Avatar Circle with Online Dot */}
              <div className="space-y-4">
                <div className="profile-cinematic-frame relative w-full aspect-[4/5] max-h-[420px] mx-auto overflow-hidden rounded-2xl shadow-xl">
                  <img 
                    src={profile.avatarUrl || "/belayneh.jpg"} 
                    alt={profile.name || "Belayneh Shiferaw"}
                    loading="eager"
                    fetchpriority="high"
                    className="profile-cinematic-image w-full h-full object-cover object-center pointer-events-none" 
                  />
                  <div className="profile-doorway" aria-hidden="true">
                    <div className="profile-door-panel profile-door-panel-left">
                      <span className="profile-door-knob" />
                    </div>
                    <div className="profile-door-panel profile-door-panel-right">
                      <span className="profile-door-knob" />
                    </div>
                    <div className="profile-code-window">
                      <div className="profile-code-titlebar">
                        <span className="profile-code-indicator" />
                        <span>profile.jsx</span>
                      </div>
                      <pre><code>
                        <span><b>const</b> profile = {'{'}</span>
                        <span>  name: <i>"Belayneh Shiferaw"</i>,</span>
                        <span>  role: <i>"Full-Stack Engineer"</i>,</span>
                        <span>  focus: [<i>"React"</i>, <i>"Node.js"</i>, <i>"Networks"</i>]</span>
                        <span>{'}'};</span>
                      </code></pre>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10 pointer-events-none" />
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {profile.role || 'Software Developer'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black font-heading text-slate-100 uppercase">
                    {profile.name || 'BELAYNEH SHIFERAW'}
                  </h3>
                </div>
              </div>

              {/* Profile Details Pills Grid */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/90 p-3 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">FOCUS</div>
                    <div className="text-xs font-bold text-slate-200">Web platforms</div>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">SKILLS</div>
                    <div className="text-xs font-bold text-emerald-400">Full-stack · IoT</div>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">LOCATION</div>
                    <div className="text-xs font-bold text-slate-200">{profile.location || 'Bahir Dar, Ethiopia'}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
