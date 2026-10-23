import React, { useState, useMemo, useEffect } from 'react';
import { 
  Award, Calendar, Filter, RotateCcw, AlertTriangle, ShieldCheck, 
  ArrowRight, Info, ChevronRight, FileText, CheckCircle2, AlertCircle, Eye,
  Sparkles, Layers, Download, Check
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { 
  DcmPublication, 
  DcmClassification, 
  DCM_COLORS, 
  NIGERIA_37_JURISDICTIONS,
  MONTH_NAMES 
} from '../types/dcm';
import { compareDcmPublications, sortDcmChronologically } from '../utils/dcmComparison';
import { DcmMap } from './DcmMap';
import { DcmTimeline } from './DcmTimeline';
import { DcmBriefRequestModal } from './DcmBriefRequestModal';
import { INITIAL_DCM_PUBLICATIONS } from '../data/dcmInitialData';

export const DemocraticCompetitivenessMapNative: React.FC = () => {
  const { dcmPublications } = useCMS();

  // Use CMS publications if available, otherwise fallback to initial seed
  const publications: DcmPublication[] = useMemo(() => {
    if (dcmPublications && dcmPublications.length > 0) {
      return dcmPublications.filter(p => p.status === 'published');
    }
    return INITIAL_DCM_PUBLICATIONS.filter(p => p.status === 'published');
  }, [dcmPublications]);

  // Chronologically sorted (descending for latest-first selection)
  const sortedDesc = useMemo(() => {
    return [...publications].sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime());
  }, [publications]);

  // Default publication: latest published
  const [selectedPubId, setSelectedPubId] = useState<string>(() => {
    const latest = sortedDesc.find(p => p.isLatest) || sortedDesc[0];
    return latest?.id || INITIAL_DCM_PUBLICATIONS[0].id;
  });

  // Selected state on map (null = "All States")
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(null);

  // Toggle for change highlighting
  const [highlightChanges, setHighlightChanges] = useState<boolean>(false);

  // Modal for Request DCM Brief
  const [isBriefModalOpen, setIsBriefModalOpen] = useState<boolean>(false);

  // Active publication object
  const activePublication = useMemo(() => {
    return publications.find(p => p.id === selectedPubId) || sortedDesc[0] || INITIAL_DCM_PUBLICATIONS[0];
  }, [publications, selectedPubId, sortedDesc]);

  // When publications load or change, ensure valid selection
  useEffect(() => {
    if (!publications.some(p => p.id === selectedPubId) && sortedDesc.length > 0) {
      setSelectedPubId(sortedDesc[0].id);
    }
  }, [publications, selectedPubId, sortedDesc]);

  // Comparison against immediately preceding publication
  const comparison = useMemo(() => {
    return compareDcmPublications(activePublication, publications);
  }, [activePublication, publications]);

  // Set of changed state codes for fast lookup & map rendering
  const changedStateCodes = useMemo(() => {
    return new Set(comparison.changedStates.map(s => s.stateCode));
  }, [comparison]);

  // Available Years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(publications.map(p => p.year)));
    return years.sort((a, b) => b - a);
  }, [publications]);

  // Available Months for selected Year
  const availableMonths = useMemo(() => {
    const months = Array.from(
      new Set(
        publications
          .filter(p => p.year === activePublication.year)
          .map(p => p.month)
      )
    );
    return months.sort((a, b) => a - b);
  }, [publications, activePublication.year]);

  // Available Periods for selected Year & Month
  const availablePeriods = useMemo(() => {
    return publications
      .filter(p => p.year === activePublication.year && p.month === activePublication.month)
      .sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime());
  }, [publications, activePublication.year, activePublication.month]);

  // Handlers for selectors
  const handleYearChange = (year: number) => {
    const pubInYear = publications.find(p => p.year === year);
    if (pubInYear) {
      setSelectedPubId(pubInYear.id);
    }
  };

  const handleMonthChange = (month: number) => {
    const pubInMonth = publications.find(p => p.year === activePublication.year && p.month === month);
    if (pubInMonth) {
      setSelectedPubId(pubInMonth.id);
    }
  };

  const handlePeriodChange = (pubId: string) => {
    setSelectedPubId(pubId);
  };

  // State counts summary for active publication
  const stateCounts = useMemo(() => {
    const counts: Record<DcmClassification, number> = {
      'Open': 0,
      'Emerging concern': 0,
      'Constrained': 0,
      'Severely constrained': 0,
      'Insufficient evidence': 0
    };
    for (const j of NIGERIA_37_JURISDICTIONS) {
      const rec = activePublication.classifications[j.code];
      const cls = rec?.classification || 'Insufficient evidence';
      counts[cls] = (counts[cls] || 0) + 1;
    }
    return counts;
  }, [activePublication]);

  // Selected state details
  const selectedStateRecord = selectedStateCode ? activePublication.classifications[selectedStateCode] : null;
  const selectedStateMeta = selectedStateCode ? NIGERIA_37_JURISDICTIONS.find(j => j.code === selectedStateCode) : null;

  const scrollToMap = () => {
    const mapEl = document.getElementById('dcm-map-section');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Hidden Internal Implementation Badge */}
        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono border border-slate-700">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-slate-200">
              <strong className="text-white">Internal Implementation:</strong> Native SVG 37-Jurisdiction Map Engine with Cascading Selectors &amp; History
            </span>
          </div>
          <a
            href="/democratic-competitiveness-map"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/democratic-competitiveness-map');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="text-brand-blue hover:text-white underline font-bold shrink-0 cursor-pointer"
          >
            Switch to Public Embed Map →
          </a>
        </div>

        {/* 1. Header / Intro Block with Official Approved Content */}
        <div className="border-b border-line pb-8 space-y-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-brand-blue shrink-0" />
            <span className="text-xs font-mono font-bold tracking-widest text-brand-blue uppercase">
              Athena Election Observatory (AEO)
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-ink leading-tight">
            Democratic Competitiveness Map (DCM)
          </h1>

          <div className="bg-white border border-line rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">
              What is DCM?
            </h2>
            <p className="text-ink2 text-base leading-relaxed">
              The Democratic Competitiveness Map (DCM) is AEO’s state-by-state outlook of the conditions under which political competition occurs in Nigeria. It uses verified evidence to show the extent to which Nigeria’s political and institutional environment allows political actors to freely organise, campaign, and compete for public offices under fair, lawful, and reasonably equal conditions.
            </p>
            <p className="text-ink2 text-base leading-relaxed">
              The documented conditions in a particular state and during a defined reporting period are summarised and represented in a colour map.
            </p>
            <p className="text-ink2 text-base leading-relaxed">
              The DCM does not score or rank the states. Therefore, the colour map is not a numerical score, a political label, or a permanent judgment on a state.
            </p>

            {/* MANDATORY HIGH-VISIBILITY DISCLAIMER BANNER */}
            <div className="p-4 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-xl flex items-center gap-3 text-amber-950 font-display font-bold text-base sm:text-lg">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
              <span>The DCM does not score or rank states.</span>
            </div>
          </div>
        </div>

        {/* 2. Interactive Navigation Controls (Year -> Month -> Publication Period -> State) */}
        <div className="bg-white border border-line rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand-blue">
                Publication Archive Navigator
              </div>
              <h2 className="text-lg font-bold text-ink">
                Active Publication: {activePublication.title}
              </h2>
            </div>

            {/* Highlight Changes Toggle & Clear Selection */}
            <div className="flex items-center gap-3 flex-wrap">
              {comparison.isBaseline ? (
                <span className="text-xs font-mono text-slate-400 italic bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  Baseline publication — no earlier publication for comparison
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setHighlightChanges(!highlightChanges)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                    highlightChanges
                      ? 'bg-blue-50 text-brand-blue border-blue-300 ring-2 ring-brand-blue/20'
                      : 'bg-white text-ink2 border-line hover:border-slate-400'
                  }`}
                  aria-pressed={highlightChanges}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${highlightChanges ? 'bg-brand-blue animate-pulse' : 'bg-slate-300'}`} />
                  <span>Highlight changes since previous publication</span>
                  {comparison.totalChanged > 0 && (
                    <span className="px-1.5 py-0.2 bg-brand-blue text-white rounded-full text-[10px]">
                      {comparison.totalChanged}
                    </span>
                  )}
                </button>
              )}

              {selectedStateCode && (
                <button
                  type="button"
                  onClick={() => setSelectedStateCode(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear selection (All States)</span>
                </button>
              )}
            </div>
          </div>

          {/* Cascading Filter Selectors: Year | Month | Period | State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Year Selector */}
            <div className="space-y-1.5">
              <label htmlFor="dcm-year-select" className="text-xs font-mono font-bold text-ink2 uppercase tracking-wider block">
                1. Year
              </label>
              <select
                id="dcm-year-select"
                value={activePublication.year}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-ink font-medium"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="space-y-1.5">
              <label htmlFor="dcm-month-select" className="text-xs font-mono font-bold text-ink2 uppercase tracking-wider block">
                2. Month
              </label>
              <select
                id="dcm-month-select"
                value={activePublication.month}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-ink font-medium"
              >
                {availableMonths.map(m => (
                  <option key={m} value={m}>{MONTH_NAMES[m - 1]}</option>
                ))}
              </select>
            </div>

            {/* Publication Period Selector */}
            <div className="space-y-1.5">
              <label htmlFor="dcm-period-select" className="text-xs font-mono font-bold text-ink2 uppercase tracking-wider block">
                3. Publication Period
              </label>
              <select
                id="dcm-period-select"
                value={activePublication.id}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-ink font-semibold"
              >
                {availablePeriods.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.reportingPeriodLabel} {p.isLatest ? '★ (Latest)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* State Selector */}
            <div className="space-y-1.5">
              <label htmlFor="dcm-state-select" className="text-xs font-mono font-bold text-ink2 uppercase tracking-wider block">
                4. Focus State
              </label>
              <select
                id="dcm-state-select"
                value={selectedStateCode || ''}
                onChange={(e) => setSelectedStateCode(e.target.value ? e.target.value : null)}
                className="w-full px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-ink font-medium"
              >
                <option value="">All States (Full National View)</option>
                {NIGERIA_37_JURISDICTIONS.map(j => {
                  const stateRec = activePublication.classifications[j.code];
                  return (
                    <option key={j.code} value={j.code}>
                      {j.name} ({stateRec?.classification || 'Insufficient evidence'})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Main Map Section & Selected State Panel */}
        <div id="dcm-map-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Map Display & Legend Container (8 Cols on Desktop) */}
          <div className="lg:col-span-8 bg-white border border-line rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-blue">
                  State-by-State Overview
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-ink">
                  {selectedStateCode ? `${selectedStateMeta?.name} State Selected` : 'National DCM Classification'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-ink2 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                  Period: <strong className="text-ink">{activePublication.reportingPeriodLabel}</strong>
                </span>
              </div>
            </div>

            {/* Interactive SVG Map */}
            <div className="w-full bg-paper rounded-2xl border border-line p-4 flex items-center justify-center">
              <DcmMap
                publication={activePublication}
                selectedStateCode={selectedStateCode}
                onSelectState={(code) => setSelectedStateCode(code)}
                highlightChanges={highlightChanges}
                changedStateCodes={changedStateCodes}
              />
            </div>

            {/* Controlled Classification Legend */}
            <div className="space-y-3 pt-2 border-t border-line">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                  DCM Classification Legend
                </span>
                <span className="text-[11px] text-mut font-mono">
                  37 jurisdictions audited
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(Object.keys(DCM_COLORS) as DcmClassification[]).map((cls) => {
                  const meta = DCM_COLORS[cls];
                  const count = stateCounts[cls] || 0;
                  return (
                    <div 
                      key={cls}
                      className="p-2.5 rounded-xl border border-line bg-paper/60 space-y-1 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                            style={{ backgroundColor: meta.fill }}
                          />
                          <span className="text-xs font-bold text-ink">{cls}</span>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                          {count}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink2 leading-tight pl-5">
                        {meta.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-mut italic pt-1 leading-relaxed">
                Colours represent documented political and institutional conditions during a specific reporting period. They are not scores, rankings, ratings, or permanent political labels.
              </p>
            </div>
          </div>

          {/* Right Column: Selected State Info & Timeline (4 Cols on Desktop) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Selected State Detail Card */}
            {selectedStateRecord && selectedStateMeta ? (
              <div className="bg-white border-2 border-brand-blue/30 rounded-2xl p-6 shadow-md space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-blue uppercase font-bold">
                      {selectedStateMeta.zone} Region
                    </span>
                    <h3 className="font-display font-bold text-2xl text-ink">
                      {selectedStateMeta.name} State
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedStateCode(null)}
                    className="text-xs font-mono text-mut hover:text-ink underline cursor-pointer"
                  >
                    Clear selection
                  </button>
                </div>

                {/* State Classification Badge */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-mut uppercase">
                    Assigned Classification ({activePublication.reportingPeriodLabel})
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: DCM_COLORS[selectedStateRecord.classification]?.fill }}
                    />
                    <span className="font-display font-bold text-lg text-ink">
                      {selectedStateRecord.classification}
                    </span>
                  </div>
                </div>

                {/* Classification Rationale */}
                {selectedStateRecord.classificationRationale && (
                  <div className="space-y-1.5 p-3.5 bg-paper rounded-xl border border-line">
                    <span className="text-xs font-mono font-bold text-ink block">
                      Decision Rationale
                    </span>
                    <p className="text-xs text-ink2 leading-relaxed">
                      {selectedStateRecord.classificationRationale}
                    </p>
                  </div>
                )}

                {/* Evidence Summary */}
                {selectedStateRecord.evidenceSummary && (
                  <div className="space-y-1.5 p-3.5 bg-paper rounded-xl border border-line">
                    <span className="text-xs font-mono font-bold text-ink block">
                      Evidence Summary
                    </span>
                    <p className="text-xs text-ink2 leading-relaxed">
                      {selectedStateRecord.evidenceSummary}
                    </p>
                  </div>
                )}

                {/* Right of Response Status (only if meaningful) */}
                {selectedStateRecord.rightOfResponseStatus && selectedStateRecord.rightOfResponseStatus !== 'Not required' && (
                  <div className="flex items-center justify-between text-xs font-mono bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-slate-600">Right of Response:</span>
                    <span className="font-bold text-brand-blue">
                      {selectedStateRecord.rightOfResponseStatus}
                    </span>
                  </div>
                )}

                {/* Interactive January - December Historical Timeline for this State */}
                <div className="pt-2 border-t border-line">
                  <DcmTimeline
                    stateCode={selectedStateMeta.code}
                    stateName={selectedStateMeta.name}
                    activePublication={activePublication}
                    allPublications={publications}
                    onSelectPublication={(pub) => setSelectedPubId(pub.id)}
                  />
                </div>
              </div>
            ) : (
              /* All States Overview Summary Card */
              <div className="bg-white border border-line rounded-2xl p-6 shadow-sm space-y-5">
                <div className="border-b border-line pb-3">
                  <span className="text-[10px] font-mono text-brand-blue uppercase font-bold">
                    National Distribution
                  </span>
                  <h3 className="font-display font-bold text-xl text-ink">
                    All States Overview
                  </h3>
                  <p className="text-xs text-ink2 mt-1">
                    Click any state on the map or choose a state from the dropdown above to inspect detailed classifications and historical timeline.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-950 text-xs">
                    <span className="font-bold">Constrained (Orange)</span>
                    <span className="font-mono font-bold text-sm">{stateCounts['Constrained']} states</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs">
                    <span className="font-bold">Emerging concern (Amber)</span>
                    <span className="font-mono font-bold text-sm">{stateCounts['Emerging concern']} states</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 text-xs">
                    <span className="font-bold">Insufficient evidence (Grey)</span>
                    <span className="font-mono font-bold text-sm">{stateCounts['Insufficient evidence']} units</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
                    <span className="font-bold">Open (Green)</span>
                    <span className="font-mono font-bold text-sm">{stateCounts['Open']} states</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-950 text-xs">
                    <span className="font-bold">Severely constrained (Red)</span>
                    <span className="font-mono font-bold text-sm">{stateCounts['Severely constrained']} states</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                  <strong>Notice:</strong> The DCM examines the environment in which political actors compete — assessing whether parties and candidates have fair opportunity to organise, communicate, assemble and campaign.
                </div>
              </div>
            )}

            {/* Quick Actions Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-brand-blue text-xs font-mono font-bold uppercase tracking-widest">
                <FileText className="w-4 h-4" />
                <span>Full Analytical Brief</span>
              </div>
              <h4 className="font-display font-bold text-lg text-white">
                Request Complete DCM Brief &amp; Evidence Records
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Receive the primary evidentiary citations, police investigation logs, and full 37-jurisdiction analytical matrix directly from our research desk.
              </p>
              <button
                type="button"
                onClick={() => setIsBriefModalOpen(true)}
                className="w-full py-2.5 px-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request DCM Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. "What changed in this publication?" Section */}
        <div className="bg-white border border-line rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-line pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-blue">
                Comparative Forensics
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-ink">
                What changed in this publication?
              </h3>
            </div>

            {comparison.hasPrevious && (
              <span className="text-xs font-mono text-mut">
                Compared against: <strong>{comparison.previousPublication?.reportingPeriodLabel}</strong>
              </span>
            )}
          </div>

          {comparison.isBaseline ? (
            <div className="p-6 bg-paper rounded-xl border border-dashed border-line text-center space-y-2">
              <Info className="w-6 h-6 text-brand-blue mx-auto" />
              <p className="text-sm font-semibold text-ink">
                Baseline Publication
              </p>
              <p className="text-xs text-mut max-w-lg mx-auto leading-relaxed">
                This is the initial baseline publication establishing the comparative benchmark for all 36 states and the FCT. No earlier publication exists for historical comparison.
              </p>
            </div>
          ) : comparison.totalChanged === 0 ? (
            <div className="p-6 bg-paper rounded-xl border border-line text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-ink">
                No Classification Changes in This Window
              </p>
              <p className="text-xs text-mut max-w-lg mx-auto">
                All 37 jurisdictions maintained the classifications assigned in the preceding review cycle ({comparison.previousPublication?.reportingPeriodLabel}).
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-mono text-ink2">
                <strong>{comparison.totalChanged} jurisdiction{comparison.totalChanged > 1 ? 's' : ''}</strong> changed classification between <span className="font-bold text-ink">{comparison.previousPublication?.reportingPeriodLabel}</span> and <span className="font-bold text-ink">{activePublication.reportingPeriodLabel}</span>:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparison.changedStates.map((change) => {
                  const prevMeta = DCM_COLORS[change.previousClassification];
                  const newMeta = DCM_COLORS[change.newClassification];
                  const isCurrentSelected = selectedStateCode === change.stateCode;

                  return (
                    <div
                      key={change.stateCode}
                      onClick={() => {
                        setSelectedStateCode(change.stateCode);
                        scrollToMap();
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                        isCurrentSelected 
                          ? 'border-brand-blue bg-blue-50/40 shadow-sm ring-1 ring-brand-blue'
                          : 'border-line bg-paper hover:border-slate-300 hover:bg-white'
                      }`}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${change.stateName} changes`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-base text-ink">
                          {change.stateName}
                        </span>
                        <span className="text-[10px] font-mono text-brand-blue font-bold uppercase hover:underline">
                          Inspect on Map →
                        </span>
                      </div>

                      {/* Transition Badge: Prev -> Next */}
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span 
                          className="px-2 py-0.5 rounded border text-[11px] font-bold"
                          style={{ 
                            backgroundColor: `${prevMeta.fill}18`, 
                            color: prevMeta.text,
                            borderColor: `${prevMeta.fill}40`
                          }}
                        >
                          {change.previousClassification}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span 
                          className="px-2 py-0.5 rounded border text-[11px] font-bold"
                          style={{ 
                            backgroundColor: `${newMeta.fill}18`, 
                            color: newMeta.text,
                            borderColor: `${newMeta.fill}40`
                          }}
                        >
                          {change.newClassification}
                        </span>
                      </div>

                      {/* Decision Rationale */}
                      {change.rationale && (
                        <p className="text-xs text-ink2 leading-relaxed border-t border-line/60 pt-2 line-clamp-3">
                          {change.rationale}
                        </p>
                      )}

                      {/* Right of response if provided */}
                      {change.rightOfResponseStatus && change.rightOfResponseStatus !== 'Not required' && (
                        <div className="text-[10px] font-mono text-slate-500">
                          Right of response: <span className="font-bold text-ink">{change.rightOfResponseStatus}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. "About this publication" Card */}
        <div className="bg-white border border-line rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-line pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-blue">
                Publication Metadata &amp; Methodology
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-ink">
                About this publication
              </h3>
            </div>

            {activePublication.isLatest && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 self-start">
                <Check className="w-3.5 h-3.5" />
                <span>Current / Latest Published DCM</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-paper rounded-xl border border-line space-y-1">
              <span className="text-mut block">Reporting Period</span>
              <span className="font-bold text-ink text-sm font-sans block">{activePublication.reportingPeriodLabel}</span>
            </div>

            <div className="p-3.5 bg-paper rounded-xl border border-line space-y-1">
              <span className="text-mut block">Publication Date</span>
              <span className="font-bold text-ink text-sm font-sans block">{activePublication.publicationDate}</span>
            </div>

            <div className="p-3.5 bg-paper rounded-xl border border-line space-y-1">
              <span className="text-mut block">Evidence Cut-off Date</span>
              <span className="font-bold text-ink text-sm font-sans block">{activePublication.evidenceCutoffDate}</span>
            </div>

            <div className="p-3.5 bg-paper rounded-xl border border-line space-y-1">
              <span className="text-mut block">Methodology Version</span>
              <span className="font-bold text-ink text-sm font-sans flex items-center justify-between">
                <span>{activePublication.methodologyVersion}</span>
                {comparison.methodologyChanged && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                    Revised
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Revision Note */}
          {activePublication.revisionNote && (
            <div className="p-4 bg-slate-50 border border-line rounded-xl text-xs space-y-1">
              <span className="font-mono font-bold text-ink uppercase tracking-wider block">
                Revision &amp; Audit Note
              </span>
              <p className="text-ink2 leading-relaxed font-sans">
                {activePublication.revisionNote}
              </p>
            </div>
          )}

          {/* Publication Summary */}
          {activePublication.summary && (
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-ink uppercase tracking-wider block">
                Executive Assessment
              </span>
              <p className="text-sm text-ink2 leading-relaxed">
                {activePublication.summary}
              </p>
            </div>
          )}

          {/* Request Brief CTA banner */}
          <div className="p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-brand-blue uppercase">
                Official Access Pipeline
              </span>
              <h4 className="font-display font-bold text-base text-white">
                Need the comprehensive evidentiary record and verified incident logs?
              </h4>
              <p className="text-xs text-blue-200">
                Submit an institutional brief request to receive primary source transcripts and forensic data.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsBriefModalOpen(true)}
              className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
            >
              Request Full DCM Brief
            </button>
          </div>
        </div>

      </div>

      {/* DCM Brief Request Modal */}
      <DcmBriefRequestModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        publicationTitle={activePublication.title}
        reportingPeriod={activePublication.reportingPeriodLabel}
      />
    </div>
  );
};

export default DemocraticCompetitivenessMapNative;
