import React from 'react';
import { GraduationCap, Briefcase, CheckCircle, Code, Network, Database } from 'lucide-react';

export default function About({ experience, profile }) {
  const highlights = [
    {
      title: 'Computer Science Core',
      desc: 'Data Structures, Algorithms, Complexity Analysis, Object-Oriented Programming (C++, Java, Python), and Operating Systems.',
      icon: GraduationCap,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Full-Stack Web Engineering',
      desc: 'Building scalable web applications with React, Node.js, Express REST APIs, Tailwind CSS, and frontend/backend integration.',
      icon: Code,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    },
    {
      title: 'Cisco Network Architecture',
      desc: 'Configuring routers, switches, VLAN segmentation, inter-VLAN routing, OSPF, and network security policies in Cisco Packet Tracer.',
      icon: Network,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Database & Systems Design',
      desc: 'Designing normalized relational MySQL schemas with custom stored procedures, transactional triggers, and MongoDB document databases.',
      icon: Database,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    }
  ];

  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-4xl sm:text-6xl font-extrabold font-heading">
            About Me
          </h2>

  
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          <div className="lg:col-span-5">
            <div className="glass-card p-4 sm:p-5 border-emerald-500/30 overflow-hidden">
              <img
                src={profile.avatarUrl || '/belayneh.jpg'}
                alt={profile.name || 'Belayneh Shiferaw'}
                className="w-full rounded-2xl object-cover aspect-[4/5] shadow-xl shadow-slate-950/40"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 glass-card p-8 border-emerald-500/30">
            
            <p className="text-slate-300 leading-relaxed">
              {profile.bio || 'I build modern web applications, reliable APIs, and secure network systems with a focus on clean code, performance, and real-world impact. My work blends software engineering, database design, and network architecture to solve meaningful problems.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span><strong>BSc in Computer Science</strong></span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Full-Stack Developer</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Network & Systems Design</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>GitHub: <a href="https://github.com/BelaynehShiferaw" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">BelaynehShiferaw</a></span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-bold font-heading text-center text-slate-100 flex items-center justify-center gap-3">
            <Briefcase className="w-6 h-6 text-emerald-400" />
            <span>Computer Science Experience Timeline</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {experience && experience.map((exp) => (
              <div key={exp.id} className="glass-card p-6 space-y-4 relative border-t-2 border-t-emerald-500">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    {exp.period}
                  </span>
                </div>
                <h4 className="text-lg font-bold font-heading text-slate-200">{exp.role}</h4>
                <div className="text-xs font-medium text-slate-400">{exp.company}</div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
