import React from 'react';
import { BookOpen, Clock, Calendar, ArrowRight } from 'lucide-react';

export default function Blog({ blogs }) {
  return (
    <section id="blog" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-4xl sm:text-6xl font-extrabold font-heading">
            Engineering Blog & <br />
            <span className="gradient-text-emerald">Tech Documentation</span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg">
            Articles and deep dives written by Belayneh Shiferaw on networking architecture, IoT hardware, and database optimization.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs && blogs.map((blog) => (
            <article
              key={blog.id}
              className="glass-card p-6 space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    {blog.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold font-heading text-slate-100 group-hover:text-emerald-400 transition-colors leading-snug">
                  {blog.title}
                </h3>

                <p className="text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{blog.date}</span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-300 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                >
                  Read article
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
