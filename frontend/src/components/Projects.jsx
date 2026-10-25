import React, { useEffect, useState } from 'react';
import { 
  FolderGit2, ExternalLink, Github, Sparkles, Filter, Download,
  X, Layers, Calendar, Monitor, Network, Server, ShieldCheck,
  Database, Code2, Boxes, Play, RotateCcw, ArrowRight
} from 'lucide-react';
import { getProjectFile } from '../projectFiles';

const networkNodes = [
  { id: 'client', label: 'Client device', detail: 'Staff / user VLAN', icon: Monitor },
  { id: 'access', label: 'Access switch', detail: 'Edge connectivity', icon: Network },
  { id: 'core', label: 'Core switch', detail: 'VLAN routing', icon: Boxes },
  { id: 'security', label: 'Router / ACL', detail: 'Policy boundary', icon: ShieldCheck },
  { id: 'server', label: 'Services', detail: 'Server / Internet', icon: Server }
];

function NetworkSimulation({ project }) {
  const [packetStep, setPacketStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = window.setTimeout(() => {
      if (packetStep >= networkNodes.length - 1) {
        setIsRunning(false);
      } else {
        setPacketStep(step => step + 1);
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [isRunning, packetStep]);

  const startSimulation = () => {
    setPacketStep(0);
    setIsRunning(true);
  };

  const isHotelNetwork = /hotel/i.test(project.title);
  const segments = isHotelNetwork
    ? ['Reception VLAN', 'Administration VLAN', 'Guest Wi-Fi VLAN']
    : ['Staff / User VLAN', 'Management VLAN', 'Server VLAN'];

  return (
    <section className="project-system-view" aria-label="Illustrative network packet simulation">
      <div className="project-system-heading">
        <div>
          <p className="project-system-eyebrow">Network simulation</p>
          <h4>Packet route through the network</h4>
        </div>
        <button type="button" onClick={isRunning ? () => setIsRunning(false) : startSimulation} className="project-sim-button">
          {isRunning ? <RotateCcw className="w-4 h-4" /> : packetStep >= networkNodes.length - 1 ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pause' : packetStep >= networkNodes.length - 1 ? 'Replay' : 'Simulate packet'}
        </button>
      </div>

      <div className="network-diagram-scroll">
        <div className="network-diagram">
          <div className="network-path" aria-label="Packet path">
            {networkNodes.map((node, index) => {
              const Icon = node.icon;
              const reached = packetStep >= index;
              const current = packetStep === index && isRunning;
              return (
                <React.Fragment key={node.id}>
                  <div className={`network-node${reached ? ' is-reached' : ''}${current ? ' is-current' : ''}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <strong>{node.label}</strong>
                    <span>{node.detail}</span>
                  </div>
                  {index < networkNodes.length - 1 && (
                    <div className={`network-link${packetStep > index ? ' is-active' : ''}`} aria-hidden="true">
                      <ArrowRight className="w-4 h-4" />
                      {packetStep === index && isRunning && <i className="network-packet" />}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="network-segments">
            {segments.map((segment, index) => <span key={segment}>VLAN {index + 10} · {segment}</span>)}
          </div>
        </div>
      </div>

      <p className="project-system-note">
        {packetStep >= networkNodes.length - 1 ? 'Packet reached the destination along the illustrated route.' : 'Illustrative topology based on the project category and tags; this does not execute a Cisco Packet Tracer file.'}
      </p>
    </section>
  );
}

function SoftwareSystemView({ project }) {
  const tags = (project.tags || []).map(tag => tag.trim()).filter(Boolean);
  const layers = [
    {
      title: 'User experience',
      subtitle: 'Screens and interaction',
      icon: Monitor,
      match: /react|html|css|frontend|interface|web|mobile/i
    },
    {
      title: 'Application services',
      subtitle: 'Rules, APIs, and workflows',
      icon: Code2,
      match: /node|express|flask|python|api|backend|auth|mqtt/i
    },
    {
      title: 'Data and integrations',
      subtitle: 'Persistence and connected systems',
      icon: Database,
      match: /mongo|mysql|sql|database|esp32|iot|storage/i
    }
  ];

  return (
    <section className="project-system-view" aria-label="Software system overview">
      <div className="project-system-heading">
        <div>
          <p className="project-system-eyebrow">System overview</p>
          <h4>How the project fits together</h4>
        </div>
        <span className="project-system-badge"><Layers className="w-4 h-4" /> Architecture</span>
      </div>
      <div className="software-architecture">
        {layers.map((layer, index) => {
          const Icon = layer.icon;
          const matchedTags = tags.filter(tag => layer.match.test(tag));
          return (
            <React.Fragment key={layer.title}>
              <article className="architecture-layer">
                <span className="architecture-layer-icon"><Icon className="w-5 h-5" /></span>
                <div>
                  <h5>{layer.title}</h5>
                  <p>{layer.subtitle}</p>
                  <div className="architecture-tags">
                    {(matchedTags.length ? matchedTags : ['Project component']).map(tag => <span key={tag}>{tag}</span>)}
                  </div>
                </div>
              </article>
              {index < layers.length - 1 && <div className="architecture-connector" aria-hidden="true"><ArrowRight className="w-4 h-4" /></div>}
            </React.Fragment>
          );
        })}
      </div>
      <p className="project-system-note">Overview organized from the project description and listed technologies. Add specific architecture details to the project description for a more exact system map.</p>
    </section>
  );
}

export default function Projects({ projects }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [fileUrls, setFileUrls] = useState({});

  useEffect(() => {
    let active = true;
    let createdUrls = [];
    const assetDescriptors = projects.flatMap(project => [project.imageAsset, project.attachment]).filter(asset => asset?.id);

    Promise.all(assetDescriptors.map(async asset => {
      const file = await getProjectFile(asset.id);
      return file ? [asset.id, URL.createObjectURL(file)] : null;
    })).then(entries => {
      const validEntries = entries.filter(Boolean);
      if (!active) {
        validEntries.forEach(([, url]) => URL.revokeObjectURL(url));
        return;
      }
      createdUrls = validEntries.map(([, url]) => url);
      setFileUrls(Object.fromEntries(validEntries));
    }).catch(error => console.warn('Unable to load locally stored project files:', error));

    return () => {
      active = false;
      createdUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [projects]);

  const categories = ['All', 'IoT & Full Stack', 'Network Design', 'Database & Web', 'Python & NLP', 'Web Development'];

  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  const selectedIsNetwork = selectedProject && /network|cisco|vlan|ospf|packet tracer|routing/i.test(
    `${selectedProject.category} ${(selectedProject.tags || []).join(' ')}`
  );

  return (
    <section id="projects" className="py-20 relative bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <h2 className="text-4xl sm:text-6xl font-extrabold font-heading">
            Recent Work & Projects 
          </h2>

          <p className="text-slate-400 text-base sm:text-lg">
            Explore web applications, Cisco network infrastructure setups, database systems, and IoT hardware projects built by Belayneh Shiferaw.
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="glass-card overflow-hidden group flex flex-col hover:border-emerald-500/40 transition-all duration-300"
            >
              {/* Project Thumbnail Image */}
              <div className="relative h-52 overflow-hidden bg-slate-900">
                <img 
                  src={fileUrls[project.imageAsset?.id] || project.imageUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop"} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-emerald-400 text-xs font-semibold">
                    {project.category}
                  </span>
                </div>

                {project.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold font-heading text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {project.title}
                    </h3>
                    {project.year && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded-md">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        {project.year}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tech Tag Pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.tags && project.tags.map((tag, i) => (
                    <span key={i} className="badge-tech">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Links */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                  >
                    <span>Details & Architecture</span>
                  </button>

                  <div className="flex items-center gap-3">
                    {project.githubUrl && project.githubUrl !== '#' && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="View Code on GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.liveUrl && project.liveUrl !== '#' && (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {project.attachment && fileUrls[project.attachment.id] && (
                      <a
                        href={fileUrls[project.attachment.id]}
                        download={project.attachment.name}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                        title={`Download ${project.attachment.name}`}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Detail Modal */}
      {selectedProject && (
        <div className="project-modal-backdrop bg-slate-950/85 backdrop-blur-md">
          <div className="glass-card project-modal-panel project-details-panel max-w-2xl w-full p-6 sm:p-8 space-y-6 relative border border-emerald-500/30 animate-in fade-in zoom-in duration-200">
            
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  {selectedProject.category}
                </span>
                {selectedProject.year && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedProject.year}
                  </span>
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">{selectedProject.title}</h3>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 h-64">
              <img 
                src={fileUrls[selectedProject.imageAsset?.id] || selectedProject.imageUrl} 
                alt={selectedProject.title}
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>

            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Project Overview & Architecture</span>
                </h4>
                <p className="text-slate-300 leading-relaxed text-sm bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
                  {selectedProject.description}
                </p>
              </div>

              {selectedIsNetwork
                ? <NetworkSimulation key={selectedProject.id} project={selectedProject} />
                : <SoftwareSystemView key={selectedProject.id} project={selectedProject} />}

              {selectedProject.attachment && fileUrls[selectedProject.attachment.id] && (
                <a
                  href={fileUrls[selectedProject.attachment.id]}
                  download={selectedProject.attachment.name}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Download className="w-4 h-4" />
                  Download {selectedProject.attachment.name}
                </a>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Tech Stack & Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags && selectedProject.tags.map((tag, idx) => (
                    <span key={idx} className="badge-tech text-xs py-1 px-3">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500 hidden sm:block">
                Built by <span className="text-slate-300 font-semibold">Belayneh Shiferaw</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {selectedProject.githubUrl && selectedProject.githubUrl !== '#' && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-medium text-sm transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>View Repository</span>
                  </a>
                )}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Close Specification
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
