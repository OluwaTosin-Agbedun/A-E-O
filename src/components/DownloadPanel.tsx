import React from 'react';
import { Download, CheckCircle2 } from 'lucide-react';

export interface DownloadPanelProps {
  fileUrl?: string;
  title?: string;
  buttonLabel?: string;
  onDownload?: () => void;
  isDownloaded?: boolean;
  className?: string;
}

export const DEFAULT_DOWNLOAD_SECTION_TITLE = 'Download Official Statement';
export const DEFAULT_DOWNLOAD_BUTTON_LABEL = 'Download Report';

/**
 * Reusable Publication Download Panel
 * 
 * Renders ONLY when a downloadable document (fileUrl) is attached.
 * Supports publication-specific section titles and button labels with
 * backward-compatible defaults.
 */
export default function DownloadPanel({
  fileUrl,
  title,
  buttonLabel,
  onDownload,
  isDownloaded = false,
  className = ''
}: DownloadPanelProps) {
  // Requirement 5: Only render when the publication actually has a downloadable attachment
  if (!fileUrl || !fileUrl.trim()) {
    return null;
  }

  // Requirement 2 & 3: Backward-compatible fallbacks if empty or undefined
  const displayTitle = (title && title.trim()) ? title.trim() : DEFAULT_DOWNLOAD_SECTION_TITLE;
  const displayButtonLabel = (buttonLabel && buttonLabel.trim()) ? buttonLabel.trim() : DEFAULT_DOWNLOAD_BUTTON_LABEL;

  return (
    <div className={`mt-12 pt-8 border-t border-line ${className}`}>
      <div className="bg-paper/80 border border-line p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h4 className="font-display font-bold text-base text-ink break-words leading-snug">
            {displayTitle}
          </h4>
        </div>
        
        {isDownloaded ? (
          <div className="inline-flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-brand-green text-xs font-semibold px-5 py-3 rounded-xl shrink-0 w-full sm:w-auto text-center min-h-[44px]">
            <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
            <span>Downloaded</span>
          </div>
        ) : (
          <button 
            type="button"
            onClick={onDownload}
            className="inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-sm shrink-0 w-full sm:w-auto text-center break-words max-w-full min-h-[44px]"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="text-left sm:text-center break-words">{displayButtonLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
