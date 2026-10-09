import React from 'react';
import { BookOpen, CalendarDays, CheckCircle2, GraduationCap, MapPin } from 'lucide-react';

const academicFocus = [
  'Software Engineering',
  'Databases',
  'Algorithms',
  'Computer Networks',
  'Artificial Intelligence',
  'Web Technologies'
];

export default function Education() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-slate-100">
            Education
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            My Computer Science studies at Bahir Dar University and the academic areas shaping my technical foundation.
          </p>
        </div>

        <article className="glass-card mx-auto max-w-4xl overflow-hidden border-cyan-500/30">
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500" />
          <div className="space-y-7 p-6 sm:p-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-cyan-400">2024 – Begin</p>
                  <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-100">
                    BSc Computer Science
                  </h2>
                  <p className="font-semibold text-slate-300">Bahir Dar University</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 text-sm text-slate-400 sm:items-end">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-400">
                  <CalendarDays className="h-4 w-4" />
                  Graduating student · 2027
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  Bahir Dar, Ethiopia
                </span>
              </div>
            </div>

            <p className="border-t border-slate-800 pt-6 leading-relaxed text-slate-300">
              I began my Bachelor of Science in Computer Science in 2024 and am now a graduating student in 2027. My academic focus includes software engineering, databases, algorithms, computer networks, AI, and web technologies.
            </p>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                Academic focus
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {academicFocus.map((area) => (
                  <div
                    key={area}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-sm text-slate-300"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
