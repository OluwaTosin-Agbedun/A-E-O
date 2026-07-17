import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, BookOpen, FileText, Mail, Bell, Calendar, ChevronDown, ChevronUp, User, X, Download } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { formatReportDate } from '../utils/date';

export const triggerPdfDownload = (title: string, summary: string, author: string, date: string, pdfUrl?: string, customContent?: string) => {
  if (pdfUrl) {
    if (pdfUrl.startsWith('data:') || pdfUrl.startsWith('blob:') || pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
  }
  
  // Custom text-based document download fallback
  const content = `
ATHENA ELECTION OBSERVATORY (AEO)
OFFICIAL DOCUMENT ARCHIVE
=========================================
TITLE: ${title}
AUTHOR: ${author}
DATE: ${date}
-----------------------------------------

SUMMARY:
${summary}

${customContent ? `CONTENT:\n${customContent}` : ''}

=========================================
Document compiled by Athena Election Observatory.
Verification pipeline: AEO-SECURE-2026-X.
  `.trim();

  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface UnifiedPublication {
  id: string;
  type: 'audit' | 'assessment' | 'weekly' | 'announcement';
  typeName: string;
  category: string;
  title: string;
  summary: string;
  author: string;
  authorsList: string;
  date: string;
  image: string;
  readTimeOrSize: string;
  originalItem: any;
  pdfUrl?: string;
}

export default function PublicationsPage() {
  const { reports, weekly, announcements } = useCMS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAuthorsExpanded, setIsAuthorsExpanded] = useState(true);
  const [isDatesExpanded, setIsDatesExpanded] = useState(true);
  const [isTypesExpanded, setIsTypesExpanded] = useState(true);

  const publicationTypes = [
    { value: 'audit', label: 'Post-Election Audits' },
    { value: 'assessment', label: 'Political Landscape Monitor' },
    { value: 'weekly', label: 'AEO Weekly Digest' },
    { value: 'announcement', label: 'Announcements' }
  ];
  
  // State for announcement reader modal
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<UnifiedPublication | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigateTo = (to: string) => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Determine current path to set mode
  const currentPath = window.location.pathname;
  let pageMode: 'all' | 'audit' | 'assessment' | 'weekly' | 'announcement' = 'all';
  if (currentPath === '/post-election-audits') pageMode = 'audit';
  else if (currentPath === '/political-landscape-monitor') pageMode = 'assessment';
  else if (currentPath === '/aeo-weekly-digest') pageMode = 'weekly';
  else if (currentPath === '/announcements') pageMode = 'announcement';

  // Build unified publication items
  const unifiedPublications: UnifiedPublication[] = [];

  // 1. Audit reports (tagType === 'analysis')
  reports.filter(r => r.tagType === 'analysis').forEach(r => {
    unifiedPublications.push({
      id: r.id,
      type: 'audit',
      typeName: 'Post-election audit report',
      category: r.tag || 'ELECTION AUDIT',
      title: r.title,
      summary: r.summary,
      author: r.author || 'AEO Research Team',
      authorsList: r.authorsList || 'Athena Election Observatory Research Team',
      date: formatReportDate(r.date),
      image: r.image || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800',
      readTimeOrSize: r.size,
      originalItem: r,
      pdfUrl: r.pdfUrl
    });
  });

  // 2. Assessments (tagType === 'tech')
  reports.filter(r => r.tagType === 'tech').forEach(r => {
    let category = r.tag || 'TECHNOLOGY ASSESSMENT';
    if (r.id === 'kaduna-security' && !r.tag) category = 'GOVERNANCE AND LEADERSHIP';
    if (r.id === 'hospitals-reform' && !r.tag) category = 'HEALTH & EDUCATION';

    unifiedPublications.push({
      id: r.id,
      type: 'assessment',
      typeName: 'Political landscape monitor',
      category: category,
      title: r.title,
      summary: r.summary,
      author: r.author || 'AEO Audit Panel',
      authorsList: r.authorsList || 'AEO Technology Audit Panel',
      date: formatReportDate(r.date),
      image: r.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      readTimeOrSize: r.size,
      originalItem: r,
      pdfUrl: r.pdfUrl
    });
  });

  // 3. Weekly issues
  weekly.forEach(w => {
    unifiedPublications.push({
      id: w.id,
      type: 'weekly',
      typeName: 'AEO weekly digest',
      category: w.tag || 'AEO WEEKLY DIGEST',
      title: w.title,
      summary: w.summary,
      author: w.author || 'AEO Research Team',
      authorsList: w.authorsList || w.author || 'AEO Editorial Board',
      date: formatReportDate(w.date),
      image: w.image || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
      readTimeOrSize: w.readingTime || '5 min read',
      originalItem: w,
      pdfUrl: w.pdfUrl
    });
  });

  // 4. Announcements
  announcements.forEach(a => {
    unifiedPublications.push({
      id: a.id,
      type: 'announcement',
      typeName: 'Announcement',
      category: a.category === 'press' ? 'PRESS STATEMENT' : a.category === 'bulletin' ? 'OFFICIAL BULLETIN' : a.category === 'statement' ? 'PUBLIC STATEMENT' : 'ALERT',
      title: a.title,
      summary: a.summary,
      author: a.author || 'AEO Secretariat',
      authorsList: a.authorsList || 'Athena Election Observatory Secretariat',
      date: formatReportDate(a.date),
      image: a.image || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
      readTimeOrSize: '3 min read',
      originalItem: a,
      pdfUrl: a.pdfUrl
    });
  });

  // Scope publications by the current page mode
  const scopedPublications = unifiedPublications.filter(p => {
    if (pageMode === 'all') return true;
    return p.type === pageMode;
  });

  // Sort publications: show specific items at the top or newest
  const sortedPublications = [...scopedPublications].sort((a, b) => {
    if (a.id === 'kaduna-security') return -1;
    if (b.id === 'kaduna-security') return 1;
    if (a.id === 'hospitals-reform') return -1;
    if (b.id === 'hospitals-reform') return 1;
    return b.date.localeCompare(a.date);
  });

  // Extract year helper
  const getYearFromDate = (dateStr: string) => {
    const yearMatch = dateStr.match(/\b(202\d)\b/);
    return yearMatch ? yearMatch[1] : 'Other';
  };

  // Get list of unique authors for the current scoped category
  const allAuthors = Array.from(new Set(sortedPublications.map(p => p.author))).filter(Boolean);

  // Get list of unique years for the current scoped category
  const allYears = Array.from(new Set(sortedPublications.map(p => getYearFromDate(p.date)))).filter(Boolean).sort().reverse();

  // Filter scoped publications based on selection
  const filteredPublications = sortedPublications.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorsList.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAuthor = selectedAuthor === 'all' || p.author === selectedAuthor;
    
    if (pageMode === 'all') {
      const matchesType = selectedType === 'all' || p.type === selectedType;
      return matchesSearch && matchesAuthor && matchesType;
    } else {
      const matchesYear = selectedYear === 'all' || getYearFromDate(p.date) === selectedYear;
      return matchesSearch && matchesAuthor && matchesYear;
    }
  });

  // Count helpers for the current scope
  const getCountByAuthor = (authorName: string) => {
    if (authorName === 'all') return sortedPublications.length;
    return sortedPublications.filter(p => p.author === authorName).length;
  };

  const getCountByYear = (year: string) => {
    if (year === 'all') return sortedPublications.length;
    return sortedPublications.filter(p => getYearFromDate(p.date) === year).length;
  };

  const getCountByType = (type: string) => {
    if (type === 'all') return sortedPublications.length;
    return sortedPublications.filter(p => p.type === type).length;
  };

  const handleItemClick = (pub: UnifiedPublication) => {
    if (pub.type === 'audit' || pub.type === 'assessment') {
      navigateTo(`/report/${pub.id}`);
    } else if (pub.type === 'weekly') {
      navigateTo(`/weekly/${pub.id}`);
    } else if (pub.type === 'announcement') {
      setSelectedAnnouncement(pub);
    }
  };

  // Page texts depending on the Mode
  const getPageInfo = () => {
    switch (pageMode) {
      case 'audit':
        return {
          title: "Post-Election Audit Reports",
          description: "Explore our archive of comprehensive post-election audits and forensic reviews mapping voter accreditation and official results.",
          icon: <FileText className="w-8 h-8 text-brand-purple" />
        };
      case 'assessment':
        return {
          title: "Political Landscape Monitor",
          description: "Sub-national assessments, tech reviews, and governance research briefs analyzing democratic compliance.",
          icon: <BookOpen className="w-8 h-8 text-brand-blue" />
        };
      case 'weekly':
        return {
          title: "AEO Weekly Digest",
          description: "Our weekly analytical insights, digests, newsletters, and ongoing research updates on electoral processes.",
          icon: <Mail className="w-8 h-8 text-brand-green" />
        };
      case 'announcement':
        return {
          title: "Announcements & Statement Archive",
          description: "Athena Election Observatory's official public declarations, press releases, and rapid-response alerts.",
          icon: <Bell className="w-8 h-8 text-amber-500" />
        };
      default:
        return {
          title: "All Observatory Publications",
          description: "Access our entire registry of forensic audits, technology assessments, weekly newsletters, and press statements.",
          icon: <FileText className="w-8 h-8 text-brand-blue" />
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <div className="mb-8">
            <button 
              onClick={() => navigateTo('/')}
              className="inline-flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-brand-blue hover:text-brand-blue-dark transition-colors cursor-pointer uppercase"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>

          {/* Page Title / Header Block */}
          <div className="border-b border-line pb-8 mb-10">
            <div className="flex items-center gap-3.5 mb-2">
              {pageInfo.icon}
              <span className="text-xs font-mono font-bold tracking-widest text-brand-blue uppercase">
                Athena Observatory
              </span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-ink leading-tight">
              {pageInfo.title}
            </h1>
            <p className="text-ink2 text-base mt-3 max-w-3xl leading-relaxed">
              {pageInfo.description}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mut" />
            <input 
              type="text" 
              placeholder={`Search ${pageInfo.title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line focus:border-brand-blue focus:ring-1 focus:ring-brand-blue text-sm outline-none bg-white transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            
            {/* Sidebar Filter Panel */}
            <div className="lg:col-span-1 space-y-8">
              
              <div className="border border-line rounded-2xl bg-white p-5 space-y-6 shadow-sm">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink border-b border-line pb-2.5">
                  Filters
                </h3>

                {/* Filter by Type (shown when pageMode is 'all') or Filter by Year (shown on subpages) */}
                {pageMode === 'all' ? (
                  <div className="space-y-3">
                    <button 
                      onClick={() => setIsTypesExpanded(!isTypesExpanded)}
                      className="w-full flex items-center justify-between font-semibold text-sm text-ink hover:text-brand-blue transition-colors"
                    >
                      <span>Filter by Type</span>
                      {isTypesExpanded ? <ChevronUp className="w-3.5 h-3.5 text-mut" /> : <ChevronDown className="w-3.5 h-3.5 text-mut" />}
                    </button>

                    {isTypesExpanded && (
                      <div className="space-y-1 pt-1">
                        <button
                          onClick={() => setSelectedType('all')}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            selectedType === 'all' 
                              ? 'bg-brand-blue/5 text-brand-blue font-bold' 
                              : 'text-ink2 hover:bg-paper'
                          }`}
                        >
                          <span>All Types</span>
                          <span className="text-[10px] font-mono text-mut">({getCountByType('all')})</span>
                        </button>

                        {publicationTypes.map(pubType => (
                          <button
                            key={pubType.value}
                            onClick={() => setSelectedType(pubType.value)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              selectedType === pubType.value 
                                ? 'bg-brand-blue/5 text-brand-blue font-bold' 
                                : 'text-ink2 hover:bg-paper'
                            }`}
                          >
                            <span>{pubType.label}</span>
                            <span className="text-[10px] font-mono text-mut">({getCountByType(pubType.value)})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={() => setIsDatesExpanded(!isDatesExpanded)}
                      className="w-full flex items-center justify-between font-semibold text-sm text-ink hover:text-brand-blue transition-colors"
                    >
                      <span>Filter by Year</span>
                      {isDatesExpanded ? <ChevronUp className="w-3.5 h-3.5 text-mut" /> : <ChevronDown className="w-3.5 h-3.5 text-mut" />}
                    </button>

                    {isDatesExpanded && (
                      <div className="space-y-1 pt-1">
                        <button
                          onClick={() => setSelectedYear('all')}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            selectedYear === 'all' 
                              ? 'bg-brand-blue/5 text-brand-blue font-bold' 
                              : 'text-ink2 hover:bg-paper'
                          }`}
                        >
                          <span>All Years</span>
                          <span className="text-[10px] font-mono text-mut">({getCountByYear('all')})</span>
                        </button>

                        {allYears.map(year => (
                          <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              selectedYear === year 
                                ? 'bg-brand-blue/5 text-brand-blue font-bold' 
                                : 'text-ink2 hover:bg-paper'
                            }`}
                          >
                            <span>{year}</span>
                            <span className="text-[10px] font-mono text-mut">({getCountByYear(year)})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Filter by Author */}
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsAuthorsExpanded(!isAuthorsExpanded)}
                    className="w-full flex items-center justify-between font-semibold text-sm text-ink hover:text-brand-blue transition-colors"
                  >
                    <span>Filter by Author</span>
                    {isAuthorsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-mut" /> : <ChevronDown className="w-3.5 h-3.5 text-mut" />}
                  </button>

                  {isAuthorsExpanded && (
                    <div className="space-y-1 pt-1">
                      <button
                        onClick={() => setSelectedAuthor('all')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          selectedAuthor === 'all' 
                            ? 'bg-brand-blue/5 text-brand-blue font-bold' 
                            : 'text-ink2 hover:bg-paper'
                        }`}
                      >
                        <span>All Authors</span>
                        <span className="text-[10px] font-mono text-mut">({getCountByAuthor('all')})</span>
                      </button>

                      {allAuthors.map(author => (
                        <button
                          key={author}
                          onClick={() => setSelectedAuthor(author)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            selectedAuthor === author 
                              ? 'bg-brand-blue/5 text-brand-blue font-bold' 
                              : 'text-ink2 hover:bg-paper'
                          }`}
                        >
                          <span className="truncate pr-2">{author}</span>
                          <span className="text-[10px] font-mono text-mut flex-shrink-0">({getCountByAuthor(author)})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Publications List Grid */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Results count bar */}
              <div className="text-xs font-semibold text-ink2 border-b border-line pb-3 flex items-center justify-between">
                <span>{filteredPublications.length} publication{filteredPublications.length !== 1 ? 's' : ''} found</span>
                {((selectedAuthor !== 'all') || (pageMode === 'all' ? selectedType !== 'all' : selectedYear !== 'all') || searchQuery) && (
                  <button 
                    onClick={() => {
                      setSelectedAuthor('all');
                      setSelectedYear('all');
                      setSelectedType('all');
                      setSearchQuery('');
                    }}
                    className="text-[11px] font-mono font-bold text-brand-blue hover:underline uppercase tracking-wider"
                  >
                    Reset filters
                  </button>
                )}
              </div>

              {filteredPublications.length === 0 ? (
                <div className="bg-white border border-line rounded-2xl p-16 text-center space-y-4 shadow-sm">
                  <div className="bg-paper p-4 rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-line">
                    <BookOpen className="w-6 h-6 text-mut" />
                  </div>
                  <div className="max-w-xs mx-auto space-y-1">
                    <h4 className="font-semibold text-ink text-base">No matching publications</h4>
                    <p className="text-xs text-mut">Try adjusting your filters, search terms, or checking other criteria.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPublications.map((pub) => (
                    <div 
                      key={pub.id}
                      onClick={() => handleItemClick(pub)}
                      className="bg-white border border-line rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-brand-blue transition-all flex flex-col md:flex-row items-stretch cursor-pointer group"
                    >
                      {/* Left Side: Thumbnail Image with NO tags on top */}
                      <div className="w-full md:w-64 shrink-0 relative bg-paper min-h-[160px] md:min-h-full">
                        <img 
                          src={pub.image} 
                          alt={pub.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>

                      {/* Right Side: Title, Summary & Author/Date Footer only */}
                      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          
                          {/* Upper Label Category */}
                          <div className="text-[10px] font-mono font-extrabold tracking-widest text-brand-blue uppercase">
                            {pub.category}
                          </div>

                          {/* Beautiful title which highlights on hover */}
                          <h3 
                            className="font-display font-bold text-lg sm:text-xl md:text-2xl text-ink group-hover:text-brand-blue leading-snug transition-colors relative inline-block"
                          >
                            <span className="relative z-10">{pub.title}</span>
                            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-brand-blue scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                          </h3>

                          {/* Summary text */}
                          <p className="text-xs sm:text-sm text-ink2 leading-relaxed line-clamp-3">
                            {pub.summary}
                          </p>
                        </div>

                        {/* Bottom line: Displays ONLY author and date */}
                        <div className="pt-4 border-t border-line/60 flex items-center gap-2 text-xs text-mut font-semibold">
                          <span className="text-ink">{pub.authorsList}</span>
                          <span>·</span>
                          <span className="text-ink2">{pub.date}</span>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>

      {/* Elegant Modal for Announcements Reader */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedAnnouncement(null)}
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-line z-10 animate-scale-up">
            
            {/* Header image banner */}
            <div className="h-44 w-full relative bg-paper">
              <img 
                src={selectedAnnouncement.image} 
                alt={selectedAnnouncement.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Close button */}
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-blue text-white uppercase tracking-wider">
                  {selectedAnnouncement.category}
                </span>
                <span className="text-white/80 font-mono text-xs ml-3">
                  {selectedAnnouncement.date}
                </span>
              </div>
            </div>

            {/* Content area */}
            <div className="p-6 sm:p-8 space-y-5">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink leading-tight">
                {selectedAnnouncement.title}
              </h2>

              <div className="text-xs text-mut font-medium border-y border-line py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-ink font-semibold">Author:</span> {selectedAnnouncement.authorsList}
                </div>
                <div>
                  <span className="text-ink font-semibold">Issued:</span> {selectedAnnouncement.date}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-ink2 leading-relaxed bg-paper p-4 rounded-xl border border-line/60">
                  {selectedAnnouncement.summary}
                </p>

                {selectedAnnouncement.originalItem?.content && (
                  <p className="text-xs sm:text-sm text-ink2 leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.originalItem.content}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-line flex justify-end gap-3">
                <button
                  onClick={() => triggerPdfDownload(
                    selectedAnnouncement.title,
                    selectedAnnouncement.summary,
                    selectedAnnouncement.authorsList,
                    selectedAnnouncement.date,
                    selectedAnnouncement.pdfUrl,
                    selectedAnnouncement.originalItem?.content
                  )}
                  className="bg-brand-blue hover:bg-brand-blue-dark text-white font-mono text-xs font-bold tracking-wider uppercase px-5 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="bg-navy hover:bg-navy-dark text-white font-mono text-xs font-bold tracking-wider uppercase px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Close Document
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
