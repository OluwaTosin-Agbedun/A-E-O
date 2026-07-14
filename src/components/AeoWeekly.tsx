import { useState } from 'react';
import { Mail, BookOpen, Clock, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { WEEKLY_ISSUES } from '../data';

export default function AeoWeekly() {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const getTeaser = (id: string) => {
    switch (id) {
      case 'wk-1':
        return "With the concluding declarations in Ekiti, our data forensics team isolated three significant takeaways from the IReV uploads: first, the speed of form submission increased by 14% compared to the previous cycle; second, over 94% of submitted forms were fully legible; third, a critical lag in collation validation was recorded in 2 central LGAs. Here is what we must demand from ad-hoc training before Osun.";
      case 'wk-2':
        return "Without programmatic party definitions and stable funding metrics, democratic structures struggle to hold collation processes accountable. This analytical commentary dissects the legal framework of political party internal democracy and suggests structural reforms to protect general electoral integrity.";
      case 'wk-3':
        return "Abuja, Nigeria. The Athena Election Observatory issues a formal statement addressing the delays in polling-unit data synchronization. We urge the Independent National Electoral Commission (INEC) to address server latency concerns to maintain public confidence before the Osun off-cycle election.";
      default:
        return "";
    }
  };

  return (
    <section className="py-16 bg-paper border-b border-line" id="weekly">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="eyebrow text-brand-purple font-semibold">Weekly briefing</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2 mb-4 leading-tight">
            AEO Weekly newsletter &amp; commentary
          </h2>
          <p className="text-ink2 text-base">
            Our weekly briefings and analytical commentary dissecting electoral integrity, democratic governance, and press releases.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WEEKLY_ISSUES.map((issue) => {
            const isExpanded = expandedIssue === issue.id;
            return (
              <div 
                key={issue.id}
                className="bg-white border border-line rounded-xl p-6 shadow-custom hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full uppercase ${
                      issue.tag.includes('Newsletter') 
                        ? 'bg-blue-50 text-brand-blue border border-blue-100' 
                        : issue.tag.includes('Analysis')
                        ? 'bg-purple-50 text-brand-purple border border-purple-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {issue.tag}
                    </span>
                    <span className="text-xs font-mono font-semibold text-mut flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {issue.date}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base sm:text-lg text-ink mb-3 leading-snug">
                    {issue.title}
                  </h3>
                  
                  <p className="text-xs text-ink2 mb-4 leading-relaxed">
                    {issue.summary}
                  </p>

                  {/* Teaser content via expanding */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-line bg-paper/50 p-3 rounded-lg text-xs text-ink2 leading-relaxed animate-fade-in">
                      <span className="font-bold text-ink block mb-1">Teaser Preview:</span>
                      {getTeaser(issue.id)}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                  <button
                    onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue font-mono cursor-pointer hover:underline"
                  >
                    <span>{isExpanded ? 'Collapse teaser' : 'Read teaser online'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <a 
                    href="#subscribe"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[11px] font-mono text-mut hover:text-brand-purple flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Subscribe to full
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
