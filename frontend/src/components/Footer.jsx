import React from 'react';
import { Terminal, Github, Linkedin, Send, Mail, Phone, Heart, GraduationCap } from 'lucide-react';

export default function Footer({ profile }) {
  const githubUrl = profile.github || "https://github.com/BelaynehShiferaw";

  return (
    <footer className="portfolio-footer bg-slate-950 border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-900">
        
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Terminal className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span className="text-xl font-bold font-heading text-slate-100">
              {profile.name || 'Belayneh Shiferaw'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
            I am a Computer Science student and developer in Bahir Dar, Ethiopia. I enjoy building useful web apps and designing reliable networks.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-300 pt-2">
            <a href={`tel:${profile.phone || '0930584008'}`} className="flex items-center gap-1.5 hover:text-emerald-400">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{profile.phone || '0930584008'}</span>
            </a>
            <span>•</span>
            <a href={`mailto:${profile.email || 'belexshiferaw@gmail.com'}`} className="flex items-center gap-1.5 hover:text-cyan-400">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>{profile.email || 'belexshiferaw@gmail.com'}</span>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-200 font-heading">Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#home" className="hover:text-emerald-400 transition-colors">Home</a></li>
            <li><a href="#about" className="hover:text-emerald-400 transition-colors">About Me</a></li>
            <li><a href="#projects" className="hover:text-emerald-400 transition-colors">Projects</a></li>
            <li><a href="#skills" className="hover:text-emerald-400 transition-colors">Skills</a></li>
            <li><a href="#contact" className="hover:text-emerald-400 transition-colors">Contact Me</a></li>
          </ul>
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-200 font-heading">Connect & Code</h4>
          <div className="flex items-center gap-2">
            <a 
              href={githubUrl} 
              target="_blank" 
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/40 transition-colors"
              title="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href={profile.telegram || "https://t.me/belayneh_shiferaw"} 
              target="_blank" 
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
              title="Telegram"
            >
              <Send className="w-4 h-4" />
            </a>
            <a
              href={profile.linkedin || 'https://www.linkedin.com/in/belayneh-shiferaw-1b9389387/'}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/40 transition-colors"
              title="LinkedIn Profile"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a 
              href={`mailto:${profile.email || 'belexshiferaw@gmail.com'}`}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
          <div className="pt-2">
            <a 
              href={githubUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs font-mono text-emerald-400 hover:underline block truncate"
            >
              BelaynehShiferaw @ GitHub
            </a>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <div>
          © {new Date().getFullYear()} {profile.name || 'Belayneh Shiferaw'} • Bahir Dar University CS.
        </div>
        <div className="flex items-center gap-1">
          <span>Developed with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          <span>using React, Express & Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
}
