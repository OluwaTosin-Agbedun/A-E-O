import React from 'react';
import { DcmPublication, DCM_COLORS, MONTH_NAMES, DcmClassification } from '../types/dcm';

interface DcmTimelineProps {
  stateCode: string;
  stateName: string;
  activePublication: DcmPublication;
  allPublications: DcmPublication[];
  onSelectPublication: (pub: DcmPublication) => void;
}

export const DcmTimeline: React.FC<DcmTimelineProps> = ({
  stateCode,
  stateName,
  activePublication,
  allPublications,
  onSelectPublication
}) => {
  const publishedOnly = allPublications.filter(p => p.status === 'published');
  const targetYear = activePublication.year || 2026;

  // Find publications in this year
  const yearPubs = publishedOnly.filter(p => p.year === targetYear);

  return (
    <div className="space-y-3 w-full" aria-label={`Historical classification timeline for ${stateName}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
          Classification Timeline ({targetYear})
        </span>
        <span className="text-[10px] text-mut font-mono">
          Interactive: click a period to view historical map
        </span>
      </div>

      {/* Grid of 12 Months, each with 2 periods (1st-15th, 16th-End) */}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 p-3 bg-paper rounded-xl border border-line">
        {MONTH_NAMES.map((monthName, mIdx) => {
          const monthNum = mIdx + 1; // 1-12
          const shortMonth = monthName.substring(0, 3);

          // Find publications for period 1 (1st-15th) and period 2 (16th-End)
          const p1Pub = yearPubs.find(p => p.month === monthNum && p.periodIndex === 1);
          const p2Pub = yearPubs.find(p => p.month === monthNum && p.periodIndex === 2);

          const renderPeriodBlock = (pub: DcmPublication | undefined, pIdx: number) => {
            if (!pub) {
              return (
                <div
                  title={`${monthName} (${pIdx === 1 ? '1st–15th' : '16th–End'}): No publication`}
                  className="h-7 rounded border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center cursor-default select-none"
                  aria-label={`${monthName} ${pIdx === 1 ? '1st to 15th' : '16th to end'}: Unpublished period`}
                >
                  <span className="text-[9px] text-slate-300 font-mono">·</span>
                </div>
              );
            }

            const stateRec = pub.classifications[stateCode];
            const classification: DcmClassification = stateRec?.classification || 'Insufficient evidence';
            const colorMeta = DCM_COLORS[classification];
            const isSelectedPub = pub.id === activePublication.id;

            return (
              <button
                type="button"
                onClick={() => onSelectPublication(pub)}
                title={`${pub.reportingPeriodLabel}: ${stateName} was classified as ${classification}. Click to view this map.`}
                className={`h-7 w-full rounded transition-all flex items-center justify-center cursor-pointer relative group ${
                  isSelectedPub ? 'ring-2 ring-ink ring-offset-1 scale-[1.05] z-10' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: colorMeta.fill }}
                aria-label={`${pub.reportingPeriodLabel}: ${classification} — click to view map`}
              >
                <span className="text-[8px] font-mono font-bold text-white drop-shadow-xs">
                  {pIdx === 1 ? 'P1' : 'P2'}
                </span>

                {/* Micro active dot */}
                {isSelectedPub && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-ink border border-white" />
                )}
              </button>
            );
          };

          return (
            <div key={monthName} className="flex flex-col gap-1 text-center">
              <span className="text-[10px] font-mono text-ink2 font-semibold">
                {shortMonth}
              </span>
              <div className="flex flex-col gap-1">
                {renderPeriodBlock(p1Pub, 1)}
                {renderPeriodBlock(p2Pub, 2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend footnote */}
      <div className="flex flex-wrap items-center justify-between text-[10px] text-mut font-mono pt-1">
        <div className="flex items-center gap-3">
          <span>P1 = 1st–15th</span>
          <span>P2 = 16th–Month end</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 rounded border border-dashed border-slate-300 bg-slate-50 inline-block" />
            <span>Unpublished</span>
          </span>
        </div>
        <span>Select any colored period to travel back in time</span>
      </div>
    </div>
  );
};

export default DcmTimeline;
