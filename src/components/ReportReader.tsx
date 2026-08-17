import { useState, useEffect } from 'react';
import { ArrowLeft, Download, CheckCircle2, FileText, Loader2, Sparkles, BookOpen } from 'lucide-react';
import SEO from './SEO';
import { useCMS } from '../context/CMSContext';
import { triggerPdfDownload } from './PublicationsPage';
import { formatReportDate } from '../utils/date';
import { generateSlug, getItemSlug } from '../utils/url';
import FormattedText from './FormattedText';

interface ReportReaderProps {
  reportId: string | null;
  onClose: () => void;
}

export default function ReportReader({ reportId, onClose }: ReportReaderProps) {
  const { reports } = useCMS();
  const [isDownloaded, setIsDownloaded] = useState(false);

  const decodedId = reportId ? decodeURIComponent(reportId) : '';
  const report = reports.find(r => 
    (r.slug && (r.slug === reportId || r.slug === decodedId)) ||
    generateSlug(r.title) === reportId ||
    generateSlug(r.title) === decodedId ||
    r.id === reportId ||
    r.id === decodedId
  );

  // Auto-scroll to top and synchronize canonical URL slug
  useEffect(() => {
    if (reportId) {
      window.scrollTo(0, 0);
      setIsDownloaded(false);
    }
    if (report) {
      const canonicalSlug = getItemSlug(report);
      if (canonicalSlug && window.location.pathname !== `/reports/${canonicalSlug}` && window.location.pathname !== `/report/${canonicalSlug}`) {
        window.history.replaceState({}, '', `/reports/${canonicalSlug}`);
      }
    }
  }, [reportId, report]);

  if (!reportId) return null;
  if (!report) return null;

  const handleDownloadPDF = () => {
    setIsDownloaded(true);
    triggerPdfDownload(
      report.title,
      report.summary,
      report.authorsList || report.author || 'AEO Research Team',
      report.date,
      report.pdfUrl,
      (report.sections || []).map((s, idx) => `Chapter ${idx + 1}: ${s.title}\n${s.content}`).join('\n\n')
    );
    setTimeout(() => {
      setIsDownloaded(false);
    }, 4000);
  };

  return (
    <div className="bg-white min-h-screen font-sans animate-fade-in">
      <SEO 
        title={report.title}
        description={report.summary || report.sections?.[0]?.content?.substring(0, 160) || 'Forensic audit report by Athena Election Observatory.'}
        canonicalPath={`/reports/${getItemSlug(report)}`}
        ogType="article"
        ogImage={report.image}
      />
      
      {/* Reader Navigation Bar */}
      <div className="bg-white/95 border-b border-line shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <button 
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink2 hover:text-brand-blue focus:outline-none transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← All audit reports</span>
          </button>
        </div>
      </div>

      {/* Main Document Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Document Header Metadata */}
        <div className="border-b border-line pb-6 mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full uppercase ${
              report.tagType === 'analysis' 
                ? 'bg-purple-50 text-brand-purple border border-purple-100' 
                : report.tagType === 'dci'
                ? 'bg-blue-50 text-brand-blue border border-blue-100'
                : 'bg-green-50 text-brand-green border border-green-100'
            }`}>
              {report.tag}
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight tracking-tight">
            {report.title}
          </h1>

          <div className="text-sm font-medium text-mut font-sans mt-2">
            {formatReportDate(report.date)}
          </div>
        </div>

        {/* Dynamic Section Contents */}
        <div className="space-y-8 text-ink text-sm sm:text-base leading-relaxed">
          {(report.sections || []).map((section, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink flex items-center gap-2">
                {section.title}
              </h2>
              <FormattedText content={section.content} className="text-ink2 pl-0 sm:pl-5" />
            </section>
          ))}
        </div>

        {/* Download Action Box (Placed After Text Contents) */}
        <div className="mt-12 pt-8 border-t border-line">
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

      </article>

    </div>
  );
}
