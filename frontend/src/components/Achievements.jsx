import React, { useEffect, useState } from 'react';
import { ExternalLink, FileText, Star } from 'lucide-react';
import { getLocalCertificateFile } from '../certificateFiles';

export default function Achievements({ certificates = [], eager = false }) {
  const [localFileUrls, setLocalFileUrls] = useState({});

  useEffect(() => {
    let active = true;
    const objectUrls = [];

    Promise.all(certificates.filter(certificate => certificate.localBlobId).map(async certificate => {
      const file = await getLocalCertificateFile(certificate.localBlobId);
      if (!file) return null;
      const fileUrl = URL.createObjectURL(file);
      objectUrls.push(fileUrl);
      return [certificate.id, fileUrl];
    })).then(entries => {
      const urls = entries.filter(Boolean);
      if (active) {
        setLocalFileUrls(Object.fromEntries(urls));
      } else {
        urls.forEach(([, fileUrl]) => URL.revokeObjectURL(fileUrl));
      }
    }).catch(error => {
      console.error('Unable to load locally saved certificate files:', error);
    });

    return () => {
      active = false;
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, [certificates]);

  const items = [
    {
      title: 'Cisco Campus Network Architecture Design',
      category: 'Computer Networks',
      description: 'Engineered segmented campus network featuring VLANs, inter-VLAN routing, OSPF dynamic routing, and ACL security policies using Cisco Packet Tracer.',
      badge: 'Network Architecture Design',
      date: '2026'
    },
    {
      title: 'Smart Agricultural IoT System Platform',
      category: 'Hardware & IoT',
      description: 'Integrated ESP32 microcontrollers, moisture sensors, Node.js REST endpoints, and a React real-time telemetry dashboard for automated irrigation.',
      badge: 'Hardware Innovation',
      date: '2026'
    },
    {
      title: 'Computer Science Academic Excellence',
      category: 'Academia',
      description: 'Consistently achieved high academic standing in Data Structures, Algorithms, and Software Engineering at Bahir Dar University.',
      badge: 'Academic Honor',
      date: '2024 - Present'
    }
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-slate-100">
        Key Achievements & Certifications
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Highlights of major technical milestones, network designs, IoT hardware innovations, and software achievements.
        </p>
      </div>

      <section aria-labelledby="certificates-heading" className="space-y-5">
        <div>
          <h2 id="certificates-heading" className="text-2xl sm:text-3xl font-bold font-heading text-slate-100">
            Certificate Papers
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Original certificates and course credentials.
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="glass-card p-6 text-sm text-slate-400">
            No certificate papers have been added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                fileUrl={certificate.fileUrl || localFileUrls[certificate.id]}
                eager={eager}
              />
            ))}
          </div>
        )}
      </section>


      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="glass-card p-6 space-y-4 hover:border-amber-500/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                {item.badge}
              </span>
              <span className="text-xs text-slate-500 font-mono">{item.date}</span>
            </div>

            <h3 className="text-xl font-bold font-heading text-slate-100 group-hover:text-amber-400 transition-colors">
              {item.title}
            </h3>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {item.description}
            </p>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>Category: <strong className="text-slate-300">{item.category}</strong></span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function CertificateCard({ certificate, fileUrl, eager }) {
  return (
    <article className="glass-card overflow-hidden">
      <div className="certificate-preview">
        {fileUrl && (certificate.contentType === 'application/pdf' ? (
          <iframe title={certificate.title} src={fileUrl} loading={eager ? 'eager' : 'lazy'} />
        ) : (
          <a href={fileUrl} target="_blank" rel="noreferrer" aria-label={`Open certificate: ${certificate.title}`}>
            <img src={fileUrl} alt={certificate.title} loading={eager ? 'eager' : 'lazy'} />
          </a>
        ))}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold font-heading text-slate-100">{certificate.title}</h3>
            {(certificate.issuer || certificate.date) && (
              <p className="mt-1 text-xs text-slate-400">
                {[certificate.issuer, certificate.date].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <FileText className="w-5 h-5 text-amber-400 shrink-0" />
        </div>
        {fileUrl && (
          <a
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:underline"
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
          >
            View certificate <ExternalLink className="w-4 h-4" />
          </a>
          
        )}
      </div>
    </article>
  );

}