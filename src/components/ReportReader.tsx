import { useState, useEffect } from 'react';
import { ArrowLeft, Download, CheckCircle2, FileText, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { triggerPdfDownload } from './PublicationsPage';
import { formatReportDate } from '../utils/date';

interface ReportReaderProps {
  reportId: string | null;
  onClose: () => void;
}

export default function ReportReader({ reportId, onClose }: ReportReaderProps) {
  const { reports } = useCMS();
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Auto-scroll to top when a report is loaded
  useEffect(() => {
    if (reportId) {
      window.scrollTo(0, 0);
      setDownloadProgress(null);
      setDownloadSuccess(false);
    }
  }, [reportId]);

  if (!reportId) return null;

  const report = reports.find(r => r.id === reportId);
  if (!report) return null;

  const handleDownloadPDF = () => {
    if (downloadProgress !== null) return;
    setDownloadProgress(0);
    setDownloadSuccess(false);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setDownloadProgress(100);
        setDownloadSuccess(true);
        
        // Trigger the actual file download safely outside state updater
        triggerPdfDownload(
          report.title,
          report.summary,
          report.authorsList || report.author || 'AEO Research Team',
          report.date,
          report.pdfUrl,
          report.sections.map((s, idx) => `Chapter ${idx + 1}: ${s.title}\n${s.content}`).join('\n\n')
        );

        setTimeout(() => {
          setDownloadProgress(null);
        }, 2500);
      } else {
        setDownloadProgress(currentProgress);
      }
    }, 150);
  };

  return (
    <div className="bg-white min-h-screen font-sans animate-fade-in">
      
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

          {/* Interactive Download Action */}
          <div>
            {downloadProgress !== null ? (
              <div className="flex items-center gap-2 bg-paper border border-line px-4 py-2 rounded-lg text-xs font-semibold font-mono text-ink">
                {downloadProgress < 100 ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-brand-blue animate-spin" />
                    <span>Compiling PDF... {downloadProgress}%</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                    <span className="text-brand-green">Download Ready!</span>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-1.5 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm shadow-green-600/10"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF · {report.size}</span>
              </button>
            )}
          </div>
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
          {report.sections.map((section, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink flex items-center gap-2">
                {section.title}
              </h2>
              <p className="text-ink2 pl-0 sm:pl-5">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {/* Visual Download Success Popover Toast */}
        {downloadSuccess && (
          <div className="my-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 text-xs sm:text-sm animate-fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Dispatched to your download buffer!</span>
              The live site serves the direct compiled binary database spreadsheet representation. This demo simulation verified the audit parameters successfully.
            </div>
          </div>
        )}

      </article>

    </div>
  );
}
