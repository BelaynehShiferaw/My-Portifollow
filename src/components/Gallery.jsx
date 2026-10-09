import React from 'react';

export default function Gallery() {
  const galleryItems = [
    {
      title: 'Smart Agriculture IoT Moisture Monitoring',
      category: 'IoT Hardware',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
      desc: 'ESP32 microcontroller integration with real-time web telemetry dashboard.'
    },
    {
      title: 'Cisco Campus Network Topology',
      category: 'Network Architecture',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
      desc: 'VLAN segmentation, inter-VLAN routing, and OSPF dynamic routing in Packet Tracer.'
    },
    {
      title: 'Stadium Management Admin Dashboard',
      category: 'Web Application',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop',
      desc: 'Full-stack React & Node.js application backed by MySQL stored procedures.'
    },
    {
      title: 'Amharic Natural Language Search Engine',
      category: 'Python & NLP',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop',
      desc: 'Bilingual query search engine utilizing TF-IDF text ranking algorithms.'
    }
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-slate-100">
          Project & Hardware <span className="gradient-text-emerald">Gallery</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Visual screenshots, network diagrams, and hardware prototype photos of systems engineered by Belayneh Shiferaw.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {galleryItems.map((item, idx) => (
          <div key={idx} className="bg-[#0e1726] border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
            <div className="relative h-64 overflow-hidden bg-slate-900">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-emerald-400 text-xs font-semibold">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-2">
              <h3 className="text-xl font-bold font-heading text-slate-100 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
