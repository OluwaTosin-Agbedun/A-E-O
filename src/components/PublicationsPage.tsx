import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowLeft, BookOpen, FileText, Mail, Bell, Calendar, ChevronDown, ChevronUp, User, X, Download, Award, MapPin, Users, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { formatReportDate, parseDateValue, sortItemsByDate } from '../utils/date';
import { getItemSlug } from '../utils/url';
import DiaryElectionDetail from './DiaryElectionDetail';
import { DiaryItem } from '../types';

export const triggerPdfDownload = (title: string, summary: string, author: string, date: string, pdfUrl?: string, customContent?: string) => {
  if (pdfUrl) {
    if (pdfUrl.startsWith('data:') || pdfUrl.startsWith('blob:') || pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
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
  type: 'audit' | 'assessment' | 'weekly' | 'announcement' | 'dcm' | 'brief' | 'africa-election-watch';
  typeName: string;
  category: string;
  title: string;
  summary: string;
  author: string;
  authorsList: string;
  date: string;
  image: string;
  readTimeOrSize: string;
  readingTime?: string;
  originalItem: any;
  pdfUrl?: string;
  downloadSectionTitle?: string;
  downloadButtonLabel?: string;
  reads?: number;
  downloads?: number;
}

export default function PublicationsPage() {
  const { reports, weekly, announcements, diaryNat, diaryLoc, diaryAfr, diaryOth } = useCMS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAuthorsExpanded, setIsAuthorsExpanded] = useState(true);
  const [isDatesExpanded, setIsDatesExpanded] = useState(true);
  const [isTypesExpanded, setIsTypesExpanded] = useState(true);

  const publicationTypes = [
    { value: 'brief', label: 'Reports and Briefs' },
    { value: 'audit', label: 'Post-Election Audits' },
    { value: 'assessment', label: 'Political Landscape Monitor' },
    { value: 'dcm', label: 'Democratic Competitiveness Map (DCM)' },
    { value: 'africa-election-watch', label: 'Africa Election Watch' },
    { value: 'weekly', label: 'AEO Weekly Digest' },
    { value: 'announcement', label: 'Announcements' }
  ];
  
  // State for announcement reader modal & diary detail modal
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<UnifiedPublication | null>(null);
  const [selectedDiaryItem, setSelectedDiaryItem] = useState<DiaryItem | null>(null);

  // Combine all diary items and find the 3 closest elections
  const allDiaryItems = useMemo(() => {
    const nat = (diaryNat || []).map(item => ({
      ...item,
      region: item.region || ('nigeria' as const),
      type: item.type || (item.title.toLowerCase().includes('presidential') ? ('presidential' as const) : ('governorship' as const))
    }));
    const loc = (diaryLoc || []).map(item => ({
      ...item,
      region: item.region || ('nigeria' as const),
      type: item.type || ('local_government' as const)
    }));
    const afr = (diaryAfr || []).map(item => ({
      ...item,
      region: item.region || ('africa' as const),
      type: item.type || ('presidential' as const)
    }));
    const oth = (diaryOth || []).map(item => ({
      ...item,
      region: item.region || ('other' as const),
      type: item.type || ('presidential' as const)
    }));
    return [...nat, ...loc, ...afr, ...oth];
  }, [diaryNat, diaryLoc, diaryAfr, diaryOth]);

  const closestElections = useMemo(() => {
    const statusPriority: Record<string, number> = {
      'In view': 1,
      'Scheduled': 2,
      'Tracking': 3,
      'Provisional': 4,
      'Concluded': 5
    };
    return [...allDiaryItems].sort((a, b) => {
      const pA = statusPriority[a.status] || 99;
      const pB = statusPriority[b.status] || 99;
      if (pA !== pB) return pA - pB;
      return parseDateValue(a.date) - parseDateValue(b.date);
    }).slice(0, 3);
  }, [allDiaryItems]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigateTo = (to: string) => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Determine current path to set mode
  const currentPath = window.location.pathname;
  let pageMode: 'all' | 'audit' | 'assessment' | 'weekly' | 'announcement' | 'dcm' | 'reports-briefs' | 'africa-election-watch' = 'all';
  if (currentPath === '/reports-and-briefs' || currentPath === '/reports-briefs' || currentPath === '/publications/reports-and-briefs' || currentPath === '/publications/reports-briefs') pageMode = 'reports-briefs';
  else if (currentPath === '/post-election-audits' || currentPath === '/publications/post-election-audits') pageMode = 'audit';
  else if (currentPath === '/political-landscape-monitor' || currentPath === '/publications/political-landscape-monitor') pageMode = 'assessment';
  else if (currentPath === '/democratic-competitiveness-map' || currentPath === '/publications/democratic-competitiveness-map' || currentPath === '/democracy-competitive-index' || currentPath === '/publications/democracy-competitive-index') pageMode = 'dcm';
  else if (currentPath === '/africa-election-watch' || currentPath === '/publications/africa-election-watch') pageMode = 'africa-election-watch';
  else if (currentPath === '/aeo-weekly-digest' || currentPath === '/publications/aeo-weekly-digest') pageMode = 'weekly';
  else if (currentPath === '/announcements' || currentPath === '/publications/announcements') pageMode = 'announcement';

  useEffect(() => {
    if (pageMode === 'dcm') {
      const existingScript = document.querySelector('script[src="https://public.flourish.studio/resources/embed.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://public.flourish.studio/resources/embed.js';
        script.async = true;
        document.body.appendChild(script);
      } else if ((window as any).Flourish && typeof (window as any).Flourish.load === 'function') {
        (window as any).Flourish.load();
      }
    }
  }, [pageMode]);

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
      author: r.author || '',
      authorsList: r.authorsList || r.author || '',
      date: formatReportDate(r.date),
      image: r.image || '',
      readTimeOrSize: r.size,
      readingTime: r.readingTime,
      originalItem: r,
      pdfUrl: r.pdfUrl,
      downloadSectionTitle: r.downloadSectionTitle,
      downloadButtonLabel: r.downloadButtonLabel,
      reads: r.reads,
      downloads: r.downloads
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
      author: r.author || '',
      authorsList: r.authorsList || r.author || '',
      date: formatReportDate(r.date),
      image: r.image || '',
      readTimeOrSize: r.size,
      readingTime: r.readingTime,
      originalItem: r,
      pdfUrl: r.pdfUrl,
      downloadSectionTitle: r.downloadSectionTitle,
      downloadButtonLabel: r.downloadButtonLabel,
      reads: r.reads,
      downloads: r.downloads
});
  });

  // 2.5 DCM reports (tagType === 'dcm')
  reports.filter(r => r.tagType === 'dcm' || r.tagType === ('dci' as any)).forEach(r => {
    unifiedPublications.push({
      id: r.id,
      type: 'dcm',
      typeName: 'Democratic Competitiveness Map (DCM) Report',
      category: r.tag || 'DCM REPORT',
      title: r.title,
      summary: r.summary,
      author: r.author || '',
      authorsList: r.authorsList || r.author || '',
      date: formatReportDate(r.date),
      image: r.image || '',
      readTimeOrSize: r.size,
      readingTime: r.readingTime,
      originalItem: r,
      pdfUrl: r.pdfUrl,
      downloadSectionTitle: r.downloadSectionTitle,
      downloadButtonLabel: r.downloadButtonLabel,
      reads: r.reads,
      downloads: r.downloads
});
  });

  // 2.6 Reports & Briefs (tagType === 'brief')
  reports.filter(r => r.tagType === 'brief').forEach(r => {
    unifiedPublications.push({
      id: r.id,
      type: 'brief',
      typeName: 'Reports & Briefs',
      category: r.tag || 'REPORTS & BRIEFS',
      title: r.title,
      summary: r.summary,
      author: r.author || '',
      authorsList: r.authorsList || r.author || '',
      date: formatReportDate(r.date),
      image: r.image || '',
      readTimeOrSize: r.size,
      readingTime: r.readingTime,
      originalItem: r,
      pdfUrl: r.pdfUrl,
      downloadSectionTitle: r.downloadSectionTitle,
      downloadButtonLabel: r.downloadButtonLabel,
      reads: r.reads,
      downloads: r.downloads
});
  });

  // 2.7 Africa Election Watch (tagType === 'africa-election-watch')
  reports.filter(r => r.tagType === 'africa-election-watch').forEach(r => {
    unifiedPublications.push({
      id: r.id,
      type: 'africa-election-watch',
      typeName: 'Africa Election Watch',
      category: r.tag || 'AFRICA ELECTION WATCH',
      title: r.title,
      summary: r.summary,
      author: r.author || '',
      authorsList: r.authorsList || r.author || '',
      date: formatReportDate(r.date),
      image: r.image || '',
      readTimeOrSize: r.size,
      readingTime: r.readingTime,
      originalItem: r,
      pdfUrl: r.pdfUrl,
      downloadSectionTitle: r.downloadSectionTitle,
      downloadButtonLabel: r.downloadButtonLabel,
      reads: r.reads,
      downloads: r.downloads
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
      author: w.author || '',
      authorsList: w.authorsList || w.author || '',
      date: formatReportDate(w.date),
      image: w.image || '',
      readTimeOrSize: w.readingTime || '5 min read',
      readingTime: w.readingTime,
      originalItem: w,
      pdfUrl: w.pdfUrl,
      downloadSectionTitle: w.downloadSectionTitle,
      downloadButtonLabel: w.downloadButtonLabel,
      reads: w.reads,
      downloads: w.downloads
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
      author: a.author || '',
      authorsList: a.authorsList || a.author || '',
      date: formatReportDate(a.date),
      image: a.image || '',
      readTimeOrSize: '3 min read',
      readingTime: a.readingTime,
      originalItem: a,
      pdfUrl: a.pdfUrl,
      downloadSectionTitle: a.downloadSectionTitle,
      downloadButtonLabel: a.downloadButtonLabel,
      reads: a.reads,
      downloads: a.downloads
});
  });

  // Scope publications by the current page mode
  const scopedPublications = unifiedPublications.filter(p => {
    if (pageMode === 'all') return true;
    if (pageMode === 'reports-briefs') return p.type === 'brief';
    return p.type === pageMode;
  });

  // Sort publications: descending order by publication/upload date
  const sortedPublications = sortItemsByDate(scopedPublications, 'date', 'desc');

  // Extract year helper
  const getYearFromDate = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== 'string') return 'Other';
    const yearMatch = dateStr.match(/\b(202\d)\b/);
    return yearMatch ? yearMatch[1] : 'Other';
  };

  // Get list of unique authors for the current scoped category
  const allAuthors = Array.from(new Set(sortedPublications.map(p => p.author))).filter(Boolean);

  // Get list of unique years for the current scoped category
  const allYears = Array.from(new Set(sortedPublications.map(p => getYearFromDate(p.date)))).filter(Boolean).sort().reverse();

  // Filter scoped publications based on selection
  const filteredPublications = sortedPublications.filter(p => {
    const titleText = p.title || '';
    const summaryText = p.summary || '';
    const authorsText = p.authorsList || '';
    const matchesSearch = 
      titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summaryText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      authorsText.toLowerCase().includes(searchQuery.toLowerCase());

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
    const slug = getItemSlug(pub);
    if (pub.type === 'audit' || pub.type === 'assessment' || pub.type === 'dcm' || pub.type === 'brief' || pub.type === 'africa-election-watch') {
      navigateTo(`/reports/${slug}`);
    } else if (pub.type === 'weekly') {
      navigateTo(`/weekly/${slug}`);
    } else if (pub.type === 'announcement') {
      navigateTo(`/announcement/${slug}`);
    }
  };

  // Page texts depending on the Mode
  const getPageInfo = () => {
    switch (pageMode) {
      case 'reports-briefs':
        return {
          title: "Reports and Briefs",
          description: "Access our full registry of forensic election audits, sub-national tech assessments, and policy research briefs.",
          icon: <FileText className="w-8 h-8 text-brand-blue" />
        };
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
      case 'dcm':
        return {
          title: "Democratic Competitiveness Map (DCM)",
          description: "The Democratic Competitiveness Map (DCM) is AEO’s state-by-state outlook of the conditions under which political competition occurs in Nigeria. It uses verified evidence to show the extent to which Nigeria’s political and institutional environment allows political actors to freely organise, campaign, and compete for public offices under fair, lawful, and reasonably equal conditions. The documented conditions in a particular state and during a defined reporting period are summarised and represented in a colour map. The DCM does not score or rank the states. Therefore, the colour map is not a numerical score, a political label, or a permanent judgment on a state.",
          icon: <Award className="w-8 h-8 text-brand-blue" />
        };
      case 'africa-election-watch':
        return {
          title: "Africa Election Watch",
          description: "Cross-border electoral monitoring, comparative regional research, and democratic health assessments across African nations.",
          icon: <Globe className="w-8 h-8 text-teal-600" />
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

          {/* AEO Democratic Competitiveness Monitor (DCM) Map Section */}
          {pageMode === 'dcm' && (
            <div className="bg-white border border-line rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm mb-12">
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold tracking-widest text-brand-blue uppercase">
                  Interactive Map Visualization
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
                  AEO Democratic Competitiveness Monitor (DCM) Map
                </h2>
                <p className="text-ink2 text-sm leading-relaxed max-w-3xl">
                  Explore the latest Democratic Competitiveness Monitor (DCM) update across Nigeria. The map provides a state-level overview of classifications based on traceable evidence gathered during the monitoring cycle.
                </p>
              </div>

              <div className="w-full overflow-hidden rounded-xl border border-line bg-paper">
                <iframe 
                  src="https://flo.uri.sh/visualisation/30399422/embed" 
                  title="AEO Democratic Competitiveness Monitor Map"
                  className="w-full h-[650px] sm:h-[800px] lg:h-[850px] border-0"
                  sandbox="allow-same-origin allow-scripts allow-top-navigation allow-popups"
                />
              </div>

              <div className="text-xs text-mut leading-relaxed italic border-t border-line pt-4">
                Methodology note: Classifications are assigned only where traceable evidence was identified during the monitoring period. Grey indicates insufficient evidence within the review cycle and does not represent a positive or negative finding.
              </div>
            </div>
          )}

          {/* Full DCM Brief Content */}
          {pageMode === 'dcm' && (
            <div className="bg-white border border-line rounded-2xl p-6 sm:p-10 space-y-8 shadow-sm mb-12">
              <div className="border-b border-line pb-6 space-y-2">
                <span className="text-xs font-mono font-bold tracking-widest text-brand-blue uppercase">
                  Executive Brief & Analysis
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
                  Nigeria’s Political Competition Environment From 1 July – 28 September 2026
                </h2>
              </div>

              <div className="space-y-6 text-ink2 text-base leading-relaxed">
                <h3 className="font-display font-bold text-xl text-ink">Executive Brief</h3>
                <p>
                  As Nigeria moves into the pre-election phase of the 2027 general elections, political competition is beginning to take different forms across states. The Democratic Competitiveness Map (DCM) provides an evidence-based assessment of whether political environments are open, experiencing emerging pressure points, or facing more significant constraints.
                </p>
                <p>
                  The first DCM assessment identifies a political environment characterised by uneven competitive conditions rather than a single national pattern.
                </p>
                <p className="font-semibold text-ink">
                  The strongest concerns emerging from the map are concentrated around:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>political violence affecting party organisation and mobilisation;</li>
                  <li>administrative decisions influencing campaign access;</li>
                  <li>unresolved disputes over institutional neutrality.</li>
                </ul>
                <p className="font-semibold text-ink">
                  Of the 37 assessment units (36 states and the FCT):
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-ink">Three states</strong> are currently classified as Orange (Constrained): Benue, Delta and Enugu.</li>
                  <li><strong className="text-ink">Seven states</strong> are classified as Amber (Emerging Concern): Abia, Anambra, Imo, Kaduna, Kogi, Osun and Rivers.</li>
                  <li><strong className="text-ink">Twenty-seven states and the FCT</strong> remain Grey due to insufficient evidence for a responsible classification.</li>
                </ul>
                <p>
                  The current picture does not indicate that political competition is uniformly restricted across Nigeria. Rather, it highlights specific areas where competitive conditions require closer monitoring as parties move towards full campaign mobilisation.
                </p>
              </div>

              <div className="space-y-6 text-ink2 text-base leading-relaxed border-t border-line pt-8">
                <h3 className="font-display font-bold text-xl text-ink">Reading the Map: What the Classifications Mean</h3>
                <p>
                  The DCM colours should be understood as indicators of current political conditions, not permanent judgments about states.
                </p>
                <p>
                  The purpose of the map is therefore not to label states permanently, but to track whether political conditions improve, deteriorate or remain unchanged.
                </p>

                {/* Responsive Classification Table */}
                <div className="overflow-x-auto my-6 border border-line rounded-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-paper border-b border-line text-ink font-mono text-xs uppercase">
                        <th className="p-4 font-bold">Classification</th>
                        <th className="p-4 font-bold">Meaning</th>
                        <th className="p-4 font-bold">States Classified</th>
                        <th className="p-4 font-bold">Number of States</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-ink2">
                      <tr className="hover:bg-paper/50">
                        <td className="p-4 font-semibold text-ink flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shrink-0"></span>
                          Orange — Constrained
                        </td>
                        <td className="p-4">Verified incidents or patterns are materially affecting political competition</td>
                        <td className="p-4 font-medium text-ink">Benue, Delta, Enugu</td>
                        <td className="p-4 font-mono">3</td>
                      </tr>
                      <tr className="hover:bg-paper/50">
                        <td className="p-4 font-semibold text-ink flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shrink-0"></span>
                          Amber — Emerging Concern
                        </td>
                        <td className="p-4">Material concerns exist but do not yet demonstrate a sustained restrictive pattern</td>
                        <td className="p-4 font-medium text-ink">Abia, Anambra, Imo, Kaduna, Kogi, Osun, Rivers</td>
                        <td className="p-4 font-mono">7</td>
                      </tr>
                      <tr className="hover:bg-paper/50">
                        <td className="p-4 font-semibold text-ink flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-slate-300 inline-block shrink-0"></span>
                          Grey — Insufficient Evidence
                        </td>
                        <td className="p-4">Evidence is insufficient to responsibly classify political competition conditions</td>
                        <td className="p-4 font-medium text-ink">27 states and FCT</td>
                        <td className="p-4 font-mono">28</td>
                      </tr>
                      <tr className="hover:bg-paper/50">
                        <td className="p-4 font-semibold text-ink flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                          Green — Open
                        </td>
                        <td className="p-4">Evidence indicates broadly open competitive conditions</td>
                        <td className="p-4 font-medium text-ink">None classified in this cycle</td>
                        <td className="p-4 font-mono">0</td>
                      </tr>
                      <tr className="hover:bg-paper/50">
                        <td className="p-4 font-semibold text-ink flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-600 inline-block shrink-0"></span>
                          Red — Severely Constrained
                        </td>
                        <td className="p-4">Serious and sustained restrictions substantially affect competition</td>
                        <td className="p-4 font-medium text-ink">None classified in this cycle</td>
                        <td className="p-4 font-mono">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>
                  The current map shows an uneven political competition environment as Nigeria moves towards the 2027 general elections. The available evidence identifies concentrated concerns in ten states, particularly around political violence, campaign access and institutional neutrality. The large number of Grey classifications reflects an evidence gap rather than a conclusion that political competition is either open or restricted.
                </p>
              </div>

              <div className="space-y-6 text-ink2 text-base leading-relaxed border-t border-line pt-8">
                <h3 className="font-display font-bold text-xl text-ink">Key Signals Emerging from the Current Map</h3>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-display font-bold text-lg text-ink">1. Political mobilisation is becoming the main area of concern</h4>
                    <p>
                      The strongest restrictive signals currently relate to the ability of political actors to organise, hold meetings and mobilise supporters.
                    </p>
                    <p className="font-bold text-ink">Benue, Delta and Enugu — Orange</p>
                    <p>Across these states, the evidence points to incidents affecting political activity:</p>
                    
                    <div className="pl-4 border-l-2 border-brand-blue space-y-4 my-4">
                      <div>
                        <h5 className="font-bold text-ink mb-1">Benue</h5>
                        <ul className="list-disc pl-6 space-y-1.5">
                          <li>Peter Obi’s convoy was obstructed on 8 September 2026 while travelling to Yelwata, Guma Local Government Area, for a humanitarian visit.</li>
                          <li>Police confirmed the incident and arrested 46 individuals.</li>
                          <li>Allegations of political involvement remain disputed between Obi/NDC officials and the Benue State Government.</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-bold text-ink mb-1">Enugu</h5>
                        <ul className="list-disc pl-6 space-y-1.5">
                          <li>On 12 September 2026, armed men disrupted an NDC ward meeting in Nkanu West Local Government Area, reportedly injuring two people.</li>
                          <li>On the same day, materials prepared for a PDP rally in the same area were destroyed.</li>
                          <li>Police ordered a CID investigation, but responsibility for the incidents remains unresolved.</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-bold text-ink mb-1">Delta</h5>
                        <ul className="list-disc pl-6 space-y-1.5">
                          <li>Violence disrupted an APC stakeholders’ meeting in Effurun on 26 July.</li>
                          <li>On 18 September, suspected attackers opened fire on an NDC/Obi-Kwankwaso mobilisation march in Warri, with one person reportedly critically injured.</li>
                        </ul>
                      </div>
                    </div>

                    <p className="font-semibold text-ink">Why this matters for 2027:</p>
                    <p>
                      Before election day, parties must be able to build structures, hold meetings and mobilise supporters. The key question is whether these incidents remain isolated or develop into broader patterns affecting political participation.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-line/60">
                    <h4 className="font-display font-bold text-lg text-ink">2. Campaign access is emerging as a new competitive issue</h4>
                    <p>The map also identifies concerns beyond physical violence.</p>
                    <p>In Anambra, Abia and Enugu, the issue relates to political advertising regulations.</p>
                    <p>The concern is not simply that fees exist. The issue is whether campaign regulations create equal practical opportunities for different political actors.</p>
                    <p className="font-semibold text-ink">Examples:</p>
                    <ul className="list-disc pl-6 space-y-1.5">
                      <li>Anambra introduced a presidential billboard fee of ₦50 million.</li>
                      <li>Abia introduced a presidential billboard fee of ₦200 million.</li>
                      <li>Enugu introduced a flat ₦150 million fee structure currently under legal challenge.</li>
                    </ul>
                    <p className="font-semibold text-ink">Why this matters for 2027:</p>
                    <p>
                      Campaign visibility and communication will become increasingly important as parties compete for voter attention. Regulatory decisions affecting campaign access will therefore require close monitoring.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-line/60">
                    <h4 className="font-display font-bold text-lg text-ink">3. Institutional response will determine whether concerns escalate</h4>
                    <p>Several Amber classifications reflect unresolved disputes rather than established patterns.</p>
                    <p className="font-semibold text-ink">Examples:</p>

                    <div className="pl-4 border-l-2 border-brand-blue space-y-4 my-4">
                      <div>
                        <h5 className="font-bold text-ink mb-1">Imo</h5>
                        <ul className="list-disc pl-6 space-y-1.5">
                          <li>The state restricted an opposition lawmaker’s billboard placement to six locations.</li>
                          <li>The lawmaker obtained a Federal Capital Territory High Court injunction preventing enforcement of the restriction.</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-bold text-ink mb-1">Kaduna</h5>
                        <ul className="list-disc pl-6 space-y-1.5">
                          <li>Between 9 and 17 September, competing allegations emerged involving an ADC solidarity march, attacks on ADC supporters’ vehicles and counter-allegations involving APC-linked groups.</li>
                          <li>Available evidence confirms political tension but does not yet independently establish responsibility.</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-bold text-ink mb-1">Kogi</h5>
                        <ul className="list-disc pl-6 space-y-1.5">
                          <li>On 15 September 2026, armed men disrupted an ADC ward meeting in Ejule-Alla, Ofu Local Government Area.</li>
                          <li>At least one party member was reportedly injured.</li>
                          <li>The identity and political affiliation of the attackers remain unresolved.</li>
                        </ul>
                      </div>
                    </div>

                    <p className="font-semibold text-ink">Why this matters for 2027:</p>
                    <p>
                      The future direction of these states will depend not only on whether incidents occur, but on whether institutions respond effectively through investigation, enforcement and dispute resolution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-ink2 text-base leading-relaxed border-t border-line pt-8">
                <h3 className="font-display font-bold text-xl text-ink">The DCM and the 2027 Election Environment</h3>
                <p>
                  The value of the DCM is that it moves analysis beyond election-day events.
                </p>
                <p className="font-semibold text-ink">Competitive elections depend on conditions that develop before voting begins:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>whether parties can organise;</li>
                  <li>whether candidates can campaign;</li>
                  <li>whether regulations are applied fairly;</li>
                  <li>whether security institutions protect political activity;</li>
                  <li>whether disputes are resolved through credible institutions.</li>
                </ul>
                <p>
                  The current map therefore provides an early picture of where competitive conditions require attention as Nigeria approaches 2027.
                </p>
              </div>
            </div>
          )}

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
                      {pub.image ? (
                        <div className="w-full md:w-64 shrink-0 relative bg-paper min-h-[160px] md:min-h-full">
                          <img 
                            src={pub.image} 
                            alt={pub.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                      ) : null}

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

                        {/* Bottom line: Displays author, reading time (if available), and date */}
                        <div className="pt-4 border-t border-line/60 flex items-center justify-between text-xs text-mut font-semibold">
                          <div className="flex items-center gap-2">
                            {pub.authorsList ? (
                              <>
                                <span className="text-ink">{pub.authorsList}</span>
                                <span>·</span>
                              </>
                            ) : null}
                            {pub.readingTime ? (
                              <>
                                <span className="text-ink2">{pub.readingTime}</span>
                                <span>·</span>
                              </>
                            ) : null}
                            <span className="text-ink2">{pub.date}</span>
                          </div>
                          
                          {(pub.reads !== undefined || pub.downloads !== undefined) && (
                            <div className="flex items-center gap-3 text-mut">
                              {pub.reads !== undefined && (
                                <span className="flex items-center gap-1" title="Reads">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span>{pub.reads}</span>
                                </span>
                              )}
                              {pub.downloads !== undefined && (
                                <span className="flex items-center gap-1" title="Downloads">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  <span>{pub.downloads}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>

    </div>
  );
}
