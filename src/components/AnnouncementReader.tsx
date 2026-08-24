import { useState, useEffect } from 'react';
import { ArrowLeft, Download, CheckCircle2, Loader2, Bell, Share2, Calendar, User } from 'lucide-react';
import SEO from './SEO';
import { useCMS } from '../context/CMSContext';
import { triggerPdfDownload } from './PublicationsPage';
import { formatReportDate } from '../utils/date';
import { generateSlug, getItemSlug } from '../utils/url';
import FormattedText from './FormattedText';

interface AnnouncementReaderProps {
  announcementId: string | null;
  onClose: () => void;
}

export default function AnnouncementReader({ announcementId, onClose }: AnnouncementReaderProps) {
  const { announcements } = useCMS();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  const decodedId = announcementId ? decodeURIComponent(announcementId) : '';
  const announcement = announcements.find(a => 
    (a.slug && (a.slug === announcementId || a.slug === decodedId)) ||
    generateSlug(a.title) === announcementId ||
    generateSlug(a.title) === decodedId ||
    a.id === announcementId ||
    a.id === decodedId
  );

  useEffect(() => {
    if (announcementId) {
      window.scrollTo(0, 0);
      setIsDownloaded(false);
      setHasShared(false);
    }
    if (announcement) {
      const canonicalSlug = getItemSlug(announcement);
      if (canonicalSlug && window.location.pathname !== `/announcement/${canonicalSlug}`) {
        window.history.replaceState({}, '', `/announcement/${canonicalSlug}`);
      }
    }
  }, [announcementId, announcement]);

  if (!announcementId) return null;

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'press': return 'Press Release';
      case 'bulletin': return 'Official Bulletin';
      case 'statement': return 'Public Statement';
      case 'alert': return 'Security / Audit Alert';
      default: return cat || 'Official Declaration';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'press': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'bulletin': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'statement': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'alert': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  if (!announcement) {
    return (
      <div className="min-h-screen bg-panel flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-line rounded-2xl p-8 max-w-md w-full text-center shadow-custom">
          <Bell className="w-10 h-10 text-brand-purple mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-ink mb-2">Announcement Not Found</h2>
          <p className="text-xs text-ink2 mb-6 leading-relaxed">
            The requested publication or announcement declaration could not be located in our active database registry.
          </p>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Publications</span>
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    setIsDownloaded(true);
    triggerPdfDownload(
      announcement.title,
      announcement.summary,
      announcement.authorsList || announcement.author || '',
      announcement.date,
      announcement.pdfUrl,
      announcement.content
    );
    setTimeout(() => {
      setIsDownloaded(false);
    }, 4000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: announcement.title,
        text: announcement.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setHasShared(true);
      setTimeout(() => setHasShared(false), 2000);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans animate-fade-in">
      <SEO 
        title={announcement ? announcement.title : 'Official Bulletin'}
        description={announcement ? announcement.summary : 'Official press bulletin from Athena Election Observatory.'}
        canonicalPath={`/announcement/${getItemSlug(announcement)}`}
        ogType="article"
      />
      {/* Reader Top Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-line sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-ink2 hover:text-brand-blue uppercase transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Publications</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-paper hover:bg-line border border-line text-ink text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{hasShared ? 'Copied Link!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Article Layout */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        
        {/* Banner image if available */}
        {announcement.image ? (
          <div className="rounded-2xl overflow-hidden border border-line h-64 sm:h-80 w-full relative bg-paper shadow-sm">
            <img
              src={announcement.image}
              alt={announcement.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between flex-wrap gap-3">
              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-md border shadow-sm ${getCategoryColor(announcement.category)}`}>
                {getCategoryLabel(announcement.category)}
              </span>
              <span className="text-white/90 font-mono text-xs flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-md border border-white/20">
                <Calendar className="w-3.5 h-3.5" />
                {formatReportDate(announcement.date)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-line">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-md border shadow-sm ${getCategoryColor(announcement.category)}`}>
              {getCategoryLabel(announcement.category)}
            </span>
            <span className="text-ink2 font-mono text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatReportDate(announcement.date)}
            </span>
          </div>
        )}

        {/* Title and Metadata */}
        <div className="space-y-4 border-b border-line pb-8">
          <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-ink leading-tight">
            {announcement.title}
          </h1>

          {(announcement.authorsList || announcement.author) ? (
            <div className="flex items-center gap-2 text-xs text-mut font-medium pt-2">
              <User className="w-4 h-4 text-brand-blue" />
              <span>
                Issued by <strong className="text-ink font-semibold">{announcement.authorsList || announcement.author}</strong>
              </span>
            </div>
          ) : null}
        </div>

        {/* Declaration Body / Content */}
        <div className="space-y-6 pt-2 text-ink2 leading-relaxed font-sans text-sm sm:text-base">
          <FormattedText 
            content={(announcement as any).content || (announcement as any).body || (announcement as any).richText || (announcement as any).html || announcement.summary} 
            className="text-base sm:text-lg text-ink2"
          />
        </div>

        {/* Download Action Box (Placed After Text Contents) */}
        <div className="pt-8 border-t border-line">
          <div className="bg-paper/80 border border-line p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-bold text-base text-ink">Download Official Statement</h4>
            </div>
            {isDownloaded ? (
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-brand-green text-xs font-semibold px-5 py-3 rounded-xl shrink-0">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>Downloaded</span>
              </div>
            ) : (
              <button 
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Actions and Navigation */}
        <div className="pt-10 border-t border-line">
          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-ink2 hover:text-brand-blue uppercase transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Publications Catalog</span>
            </button>
          </div>
        </div>

      </article>
    </div>
  );
}
