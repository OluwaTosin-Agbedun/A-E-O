import { useState } from 'react';
import { Search, AlertCircle, ArrowRight, FileText, Newspaper, HelpCircle, Mail, Bell, Calendar } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { formatReportDate } from '../utils/date';

interface AuditReportsProps {
  onOpenReport: (id: string) => void;
  onOpenWeekly: (id: string) => void;
}

type PubType = 'audit' | 'monitor' | 'weekly' | 'announcements';

export default function AuditReports({ onOpenReport, onOpenWeekly }: AuditReportsProps) {
  const { reports, weekly, announcements } = useCMS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<PubType>('audit');
  const [expandedAnn, setExpandedAnn] = useState<string | null>(null);

  // Search filter based on current tab
  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase();
    
    if (selectedTag === 'audit') {
      const audits = reports.filter(r => r.tagType === 'analysis');
      return audits.filter(r => 
        r.title.toLowerCase().includes(query) || 
        r.summary.toLowerCase().includes(query)
      );
    }
    
    if (selectedTag === 'monitor') {
      const monitors = reports.filter(r => r.tagType === 'tech');
      return monitors.filter(r => 
        r.title.toLowerCase().includes(query) || 
        r.summary.toLowerCase().includes(query)
      );
    }
    
    if (selectedTag === 'weekly') {
      return weekly.filter(w => 
        w.title.toLowerCase().includes(query) || 
        w.summary.toLowerCase().includes(query) || 
        w.tag.toLowerCase().includes(query)
      );
    }
    
    if (selectedTag === 'announcements') {
      return announcements.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.summary.toLowerCase().includes(query) ||
        (a.content && a.content.toLowerCase().includes(query))
      );
    }
    
    return [];
  };

  const filteredItems = getFilteredItems();

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'press': return 'Press Release';
      case 'bulletin': return 'Official Bulletin';
      case 'statement': return 'Public Statement';
      case 'alert': return 'Security/Audit Alert';
      default: return cat;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'press': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'bulletin': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'statement': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'alert': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  // Archive buttons depending on tab
  const handleArchiveNavigation = () => {
    let path = '/reports-archive';
    if (selectedTag === 'weekly') {
      path = '/weekly-archive';
    } else if (selectedTag === 'announcements') {
      path = '/press-bulletins';
    }
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const getArchiveButtonText = () => {
    switch (selectedTag) {
      case 'audit': return 'All Audit Reports \u2192';
      case 'monitor': return 'All Landscape Reports \u2192';
      case 'weekly': return 'All Weekly Briefings \u2192';
      case 'announcements': return 'All Press & Bulletins \u2192';
    }
  };

  return (
    <section className="py-16 bg-white border-b border-line" id="reports">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-line pb-6">
          <div className="max-w-3xl">
            <span className="eyebrow text-brand-blue font-semibold">Latest publications</span>
          </div>
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          
          {/* Tag Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => { setSelectedTag('audit'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
                selectedTag === 'audit' 
                  ? 'bg-navy text-white' 
                  : 'bg-paper text-ink2 hover:bg-line border border-line'
              }`}
            >
              Post-election audit reports
            </button>
            <button
              onClick={() => { setSelectedTag('monitor'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
                selectedTag === 'monitor' 
                  ? 'bg-navy text-white' 
                  : 'bg-paper text-ink2 hover:bg-line border border-line'
              }`}
            >
              Political landscape monitor
            </button>
            <button
              onClick={() => { setSelectedTag('weekly'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
                selectedTag === 'weekly' 
                  ? 'bg-navy text-white' 
                  : 'bg-paper text-ink2 hover:bg-line border border-line'
              }`}
            >
              AEO weekly digest
            </button>
            <button
              onClick={() => { setSelectedTag('announcements'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
                selectedTag === 'announcements' 
                  ? 'bg-navy text-white' 
                  : 'bg-paper text-ink2 hover:bg-line border border-line'
              }`}
            >
              Announcements
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-mut" />
            </div>
            <input
              type="text"
              placeholder={`Search ${selectedTag === 'weekly' ? 'weekly issues' : selectedTag === 'announcements' ? 'announcements' : 'reports'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-line rounded-lg text-sm bg-paper text-ink placeholder:text-mut focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

        </div>

        {/* Dynamic Display Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* AUDIT & MONITORING REPORTS CARD RENDER */}
            {(selectedTag === 'audit' || selectedTag === 'monitor') && (
              filteredItems.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => onOpenReport(report.id)}
                  className="bg-white border border-line rounded-xl p-6 shadow-custom hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full uppercase ${
                        report.tagType === 'analysis' 
                          ? 'bg-purple-50 text-brand-purple border border-purple-100' 
                          : 'bg-green-50 text-brand-green border border-green-100'
                      }`}>
                        {report.tag}
                      </span>
                      <span className="text-xs font-mono font-semibold text-mut">
                        {formatReportDate(report.date)}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-ink mb-2 group-hover:text-brand-blue transition-colors">
                      {report.title}
                    </h3>
                    
                    <p className="text-xs text-ink2 mb-6 leading-relaxed">
                      {report.summary}
                    </p>
                  </div>

                  <div className="border-t border-line pt-4 mt-auto">
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue font-mono group-hover:translate-x-1 transition-transform">
                        Read more
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* WEEKLY DIGESTS CARD RENDER */}
            {selectedTag === 'weekly' && (
              filteredItems.map((issue) => (
                <div 
                  key={issue.id}
                  onClick={() => onOpenWeekly(issue.id)}
                  className="bg-white border border-line rounded-xl p-6 shadow-custom hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-emerald-50 text-brand-green border border-emerald-100 text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full uppercase">
                        {issue.tag}
                      </span>
                      <span className="text-xs font-mono font-semibold text-mut">
                        {formatReportDate(issue.date)}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-ink mb-2 group-hover:text-brand-blue transition-colors">
                      {issue.title}
                    </h3>
                    
                    <p className="text-xs text-ink2 mb-6 leading-relaxed">
                      {issue.summary}
                    </p>
                  </div>

                  <div className="border-t border-line pt-4 mt-auto">
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue font-mono group-hover:translate-x-1 transition-transform">
                        Read issue
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* ANNOUNCEMENTS CARD RENDER */}
            {selectedTag === 'announcements' && (
              filteredItems.map((ann) => (
                <div 
                  key={ann.id}
                  onClick={() => {
                    setExpandedAnn(expandedAnn === ann.id ? null : ann.id);
                  }}
                  className="bg-white border border-line rounded-xl p-6 shadow-custom hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getCategoryColor(ann.category)}`}>
                        {getCategoryLabel(ann.category)}
                      </span>
                      <span className="text-xs font-mono font-semibold text-mut flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatReportDate(ann.date)}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-ink mb-2 group-hover:text-brand-blue transition-colors leading-tight">
                      {ann.title}
                    </h3>
                    
                    <p className="text-xs text-ink2 leading-relaxed mb-4">
                      {ann.summary}
                    </p>

                    {expandedAnn === ann.id && ann.content && (
                      <div className="mt-3 p-3 bg-panel border border-line/60 rounded-lg font-mono text-[10px] text-ink2 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {ann.content}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-line pt-4 mt-4">
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue font-mono">
                        {expandedAnn === ann.id ? 'Collapse' : 'Read details'}
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform ${expandedAnn === ann.id ? 'rotate-90' : ''}`} />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

          </div>
        ) : (
          <div className="bg-paper border border-line border-dashed rounded-2xl p-12 text-center max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-mut mx-auto mb-3" />
            <h4 className="font-display font-bold text-lg text-ink mb-1">No content matches your filters</h4>
            <p className="text-xs text-ink2 mb-4">Try clearing your search query or choosing another tab tag.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs bg-navy hover:bg-navy-dark text-white font-semibold font-mono tracking-wider px-4 py-2 rounded-lg cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <button 
            onClick={handleArchiveNavigation}
            className="inline-flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-ink bg-paper border border-line px-5 py-3 rounded-lg hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer uppercase"
          >
            {getArchiveButtonText()}
          </button>
        </div>

      </div>
    </section>
  );
}
