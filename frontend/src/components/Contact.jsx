import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function Contact({ profile, onSendMessage }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Your message was saved to the portfolio inbox.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        if (onSendMessage) onSendMessage(data.data);
      } else {
        setErrorMsg(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg('The message could not reach the server, so it was not saved. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 relative bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-4xl sm:text-6xl font-extrabold font-heading">
            <span className="gradient-text-emerald">Contact Me</span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg">
            Have a web development project, network design task, or consultation? Reach out directly via phone, email, or send a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Phone Card */}
            <a 
              href={`tel:${profile.phone || '0930584008'}`}
              className="glass-card p-6 flex items-center gap-5 hover:border-emerald-500/50 transition-all duration-300 group block"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Phone / Call</div>
                <div className="text-xl font-bold font-heading text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {profile.phone || '0930584008'}
                </div>
                <div className="text-xs text-slate-400">Available for direct calls & WhatsApp</div>
              </div>
            </a>

            {/* Email Card */}
            <a 
              href={`mailto:${profile.email || 'belexshiferaw@gmail.com'}`}
              className="glass-card p-6 flex items-center gap-5 hover:border-cyan-500/50 transition-all duration-300 group block"
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Email Address</div>
                <div className="text-base sm:text-lg font-bold font-heading text-slate-100 group-hover:text-cyan-400 transition-colors truncate max-w-[240px]">
                  {profile.email || 'belexshiferaw@gmail.com'}
                </div>
                <div className="text-xs text-slate-400">Response within 24 hours</div>
              </div>
            </a>

            {/* Telegram Card */}
            <a 
              href={profile.telegram || 'https://t.me/Tele_ale12'}
              target="_blank"
              rel="noreferrer"
              className="glass-card p-6 flex items-center gap-5 hover:border-sky-500/50 transition-all duration-300 group block"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <Send className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Telegram Direct</div>
                <div className="text-lg font-bold font-heading text-slate-100 group-hover:text-sky-400 transition-colors">
                  @Tele_ale12
                </div>
                <div className="text-xs text-slate-400">Instant messaging on Telegram</div>
              </div>
            </a>

            {/* Location */}
            <div className="glass-card p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Location</div>
                <div className="text-lg font-bold font-heading text-slate-100">
                  {profile.location || 'Bahir Dar, Ethiopia'}
                </div>
                <div className="text-xs text-slate-400">Open for remote & local projects</div>
              </div>
            </div>

          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7 glass-card p-8 space-y-6">
            <h3 className="text-2xl font-bold font-heading text-slate-100">Send Belayneh a Message</h3>

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Your Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Abebe Bikila"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Your Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0911223344"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Web Development / Network Design"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Message *</label>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your project, timeline, or inquiry details..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-btn flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base shadow-xl shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message to Belayneh</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
