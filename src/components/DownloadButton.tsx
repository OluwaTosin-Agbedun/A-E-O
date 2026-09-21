import React from 'react';
import { Download, CheckCircle2 } from 'lucide-react';

export interface DownloadButtonProps {
  fileUrl?: string;
  buttonLabel?: string;
  onDownload?: () => void;
  isDownloaded?: boolean;
  className?: string;
  fullWidthOnMobile?: boolean;
}

export const DEFAULT_DOWNLOAD_BUTTON_LABEL = 'Download Report';

/**
 * Reusable Publication Download Button
 * 
 * Renders ONLY when a downloadable document (fileUrl) is attached.
 * Configurable per publication through CMS (downloadButtonLabel / buttonLabel)
 * with backward-compatible defaults.
 */
export default function DownloadButton({
  fileUrl,
  buttonLabel,
  onDownload,
  isDownloaded = false,
  className = '',
  fullWidthOnMobile = false
}: DownloadButtonProps) {
  if (!fileUrl || !fileUrl.trim()) {
    return null;
  }

  const displayLabel = (buttonLabel && buttonLabel.trim()) ? buttonLabel.trim() : DEFAULT_DOWNLOAD_BUTTON_LABEL;

  if (isDownloaded) {
    return (
      <div 
        className={`inline-flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-brand-green text-xs font-semibold px-5 py-3 rounded-xl shrink-0 min-h-[44px] transition-all shadow-xs ${fullWidthOnMobile ? 'w-full sm:w-auto' : ''} ${className}`}
      >
        <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
        <span className="break-words font-sans">{displayLabel} (Downloaded)</span>
      </div>
    );
  }

  return (
    <button 
      type="button"
      onClick={onDownload}
      className={`inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-sm shrink-0 text-center break-words max-w-full min-h-[44px] ${fullWidthOnMobile ? 'w-full sm:w-auto' : ''} ${className}`}
    >
      <Download className="w-4 h-4 shrink-0" />
      <span className="text-left sm:text-center break-words font-sans">{displayLabel}</span>
    </button>
  );
}
