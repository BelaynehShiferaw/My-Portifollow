import React from 'react';
import { ArrowDown, ArrowUpRight, Github, Mail } from 'lucide-react';

export default function Hero({ profile }) {
  const name = profile.name || 'Belayneh Shiferaw';
  const role = profile.role || 'Full-Stack Software Developer';
  const githubUrl = profile.github || 'https://github.com/BelaynehShiferaw';
  const email = profile.email || 'belexshiferaw@gmail.com';
  const avatarUrl = profile.avatarUrl || '/belayneh.jpg';

  return (
    <section id="home" className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/5" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-7 lg:col-span-7">
          <div className="space-y-4">
            <h1 className="max-w-3xl break-words text-5xl font-extrabold leading-tight text-slate-50 sm:text-6xl lg:text-7xl">
              {name}
            </h1>
            <h2 className="max-w-2xl text-2xl font-semibold text-emerald-300 sm:text-3xl">
              {role}
            </h2>
            <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              {profile.bio || profile.tagline || 'I build reliable web applications, APIs, and connected systems with a focus on clear design and practical results.'}
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-5 pt-4">
            <a href="#projects" className="gradient-btn flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold sm:min-w-[192px]">
              Explore my work <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${email}`}
              aria-label="Send an email to Belayneh Shiferaw"
              className="flex items-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-5 py-3.5 text-sm font-semibold text-emerald-300 shadow-lg shadow-emerald-500/10 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
            >
              <Mail className="h-4 w-4" /> Get in touch
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-slate-800 pt-5 text-sm text-slate-400">
            <a href={githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-white">
              <Github className="h-4 w-4" /> GitHub <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-white">
                LinkedIn <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 transition-colors hover:text-white">
              {email}
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <div className="absolute -inset-3 rounded-3xl border border-emerald-400/20" />
          <figure className="relative h-[360px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 sm:h-[440px] lg:h-[520px]">
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover object-center" />
          </figure>
        </div>
      </div>
    </section>
  );
}
