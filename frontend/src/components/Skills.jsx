import React, { useState } from 'react';
import { Code2, Network, Database, Cpu, Terminal } from 'lucide-react';

export default function Skills({ skills }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All', 
    'Web Development', 
    'Network Design', 
    'Database Architecture', 
    'Languages & Tools', 
    'IoT & Hardware'
  ];

  const matchesCategory = (skillCategory, selected) => {
    if (selected === 'All') return true;

    const groupedCategories = {
      'Web Development': ['Software Engineering'],
      'Network Design': ['Computer Networks'],
      'Database Architecture': ['Database Systems'],
      'Languages & Tools': ['Computer Science Core', 'Software Engineering'],
      'IoT & Hardware': ['Hardware & IoT']
    };

    return skillCategory === selected || groupedCategories[selected]?.includes(skillCategory) || false;
  };

  const filteredSkills = selectedCategory === 'All'
    ? skills
    : skills.filter(s => matchesCategory(s.category, selectedCategory));

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Web Development': return Code2;
      case 'Network Design': return Network;
      case 'Database Architecture': return Database;
      case 'IoT & Hardware': return Cpu;
      default: return Terminal;
    }
  };

  return (
    <section id="skills" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-4xl sm:text-6xl font-extrabold font-heading">
            Skills & <br />
            <span className="gradient-text-emerald">Technology Stack</span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg">
            Proficiencies across Web Development, Cisco Network Architecture, Relational/NoSQL Databases, and Embedded Hardware Systems.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Progress Bar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {filteredSkills.map((skill) => {
            const IconComp = getCategoryIcon(skill.category);
            return (
              <div 
                key={skill.id}
                className="glass-card p-6 space-y-3 hover:border-emerald-500/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm sm:text-base">{skill.name}</h4>
                      <span className="text-xs text-slate-400">{skill.category}</span>
                    </div>
                  </div>
                  {Number.isFinite(skill.proficiency) && (
                    <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {skill.proficiency}%
                    </span>
                  )}
                </div>

                {/* Progress Meter Bar */}
                {Number.isFinite(skill.proficiency) && (
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Core Expertise Quick Summary Banner */}
        <div className="glass-card p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border-emerald-500/30 grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-extrabold font-heading text-emerald-400">Web Dev</div>
            <div className="text-xs text-slate-400 font-medium">React, Node, Express, PHP</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold font-heading text-cyan-400">Cisco Networks</div>
            <div className="text-xs text-slate-400 font-medium">VLANs, Routers, Switches</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold font-heading text-purple-400">Databases</div>
            <div className="text-xs text-slate-400 font-medium">MySQL Procedures & Mongo</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold font-heading text-amber-400">IoT Automation</div>
            <div className="text-xs text-slate-400 font-medium">ESP32 & Sensor Controls</div>
          </div>
        </div>

      </div>
    </section>
  );
}
