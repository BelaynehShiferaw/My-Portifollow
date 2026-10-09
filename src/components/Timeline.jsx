import React from 'react';
import { Cpu, Network, Sprout, Waypoints } from 'lucide-react';

const experienceItems = [
  {
    period: '2-Month Internship',
    title: 'ICT4D Research Center',
    organization: 'Bahir Dar University',
    description: 'Gained practical experience in IoT, smart agriculture, network design, and ICT infrastructure through hands-on research and development activities.',
    icon: Sprout,
    accent: 'emerald'
  },
  {
    period: 'Technical Project',
    title: 'IoT-Based Smart Irrigation System',
    organization: 'Smart Agriculture · IoT',
    description: 'Worked on an IoT-based smart irrigation solution involving sensors, monitoring, automation, and network-connected agricultural technologies.',
    icon: Cpu,
    accent: 'cyan'
  },
  {
    period: 'Networking Project',
    title: 'Enterprise Redundant Polytechnic Campus Network',
    organization: 'Cisco Networking · Enterprise Infrastructure',
    description: 'Designed an enterprise campus network architecture incorporating VLAN segmentation, routing, redundancy, network security, wireless connectivity, and scalable core–distribution–access design.',
    icon: Network,
    accent: 'purple'
  },
  {
    period: 'Present',
    title: 'Full-Stack Development & Cisco Networking',
    organization: 'Continuous Technical Development',
    description: 'Developing practical skills in React.js, Node.js, REST APIs, MongoDB, Cisco IOS, enterprise network design, network security, and IoT systems.',
    icon: Waypoints,
    accent: 'amber'
  }
];

const accentStyles = {
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-400/60',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 group-hover:border-cyan-400/60',
  purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400 group-hover:border-purple-400/60',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400 group-hover:border-amber-400/60'
};

export default function Timeline() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-slate-100">
            Experience
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Research, engineering projects, and ongoing technical development across IoT, full-stack software, and Cisco networking.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {experienceItems.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="glass-card group flex h-full flex-col gap-5 border-slate-800 p-6 transition-colors hover:border-emerald-500/40 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${accentStyles[item.accent]}`}>
                    {item.period}
                  </span>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${accentStyles[item.accent]}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold font-heading leading-snug text-slate-100 sm:text-2xl">
                    {item.title}
                  </h2>
                  <p className="text-sm font-semibold text-cyan-400">{item.organization}</p>
                </div>

                <p className="border-t border-slate-800 pt-4 text-sm leading-relaxed text-slate-400">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
