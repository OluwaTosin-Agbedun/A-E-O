import { useState, useEffect } from 'react';
import { ArrowLeft, Download, CheckCircle2, FileText, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { REPORTS } from '../data';

interface ReportReaderProps {
  reportId: string | null;
  onClose: () => void;
}

export default function ReportReader({ reportId, onClose }: ReportReaderProps) {
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

  const report = REPORTS.find(r => r.id === reportId);
  if (!report) return null;

  const handleDownloadPDF = () => {
    if (downloadProgress !== null) return;
    setDownloadProgress(0);
    setDownloadSuccess(false);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadSuccess(true);
          setTimeout(() => {
            setDownloadProgress(null);
          }, 2500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-fade-in font-sans">
      
      {/* Sticky Reader Navigation Bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-line shadow-sm">
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
            <span className="text-xs font-mono font-medium text-mut">
              Published: {report.date}
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight tracking-tight">
            {report.title}
          </h1>

          <p className="text-xs font-mono text-mut flex items-center gap-1.5 bg-paper p-2.5 rounded-lg border border-line inline-block">
            <FileText className="w-4 h-4 text-brand-blue" />
            <span>Document Reference ID: AEO-AUD-{report.id.toUpperCase()}-2026-X</span>
            <span className="text-slate-300">|</span>
            <span>File Size: {report.size}</span>
          </p>
        </div>

        {/* Dynamic Section Contents */}
        <div className="space-y-8 text-ink text-sm sm:text-base leading-relaxed">
          {report.sections.map((section, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink flex items-center gap-2">
                <span className="text-brand-blue text-xs font-mono">0{idx + 1}.</span>
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

        {/* Document Footer Navigation */}
        <div className="border-t border-line mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button 
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold px-4.5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download forensic report PDF</span>
          </button>

          <button 
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink2 hover:text-brand-blue transition-colors cursor-pointer"
          >
            ← Back to all audit reports
          </button>
        </div>

      </article>

    </div>
  );
}
