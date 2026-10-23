import React, { useState } from 'react';
import { DcmPublication, DCM_COLORS, DcmClassification } from '../types/dcm';
import { 
  NIGERIA_ACCURATE_STATE_PATHS, 
  NIGERIA_MAP_VIEWBOX, 
  NigeriaStatePathData 
} from '../data/nigeriaSvgPaths';

interface DcmMapProps {
  publication: DcmPublication;
  selectedStateCode: string | null;
  onSelectState: (code: string | null) => void;
  highlightChanges: boolean;
  changedStateCodes: Set<string>;
}

export const DcmMap: React.FC<DcmMapProps> = ({
  publication,
  selectedStateCode,
  onSelectState,
  highlightChanges,
  changedStateCodes
}) => {
  const [hoveredState, setHoveredState] = useState<NigeriaStatePathData | null>(null);

  const isAllStatesActive = selectedStateCode === null;

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none" id="dcm-nigeria-map">
      {/* SVG Map Container: Preserves 800:660 aspect ratio and scales responsively */}
      <div className="relative w-full max-w-[850px] aspect-[800/660]">
        <svg
          viewBox={NIGERIA_MAP_VIEWBOX}
          className="w-full h-full drop-shadow-sm select-none"
          role="region"
          aria-label={`Nigeria Democratic Competitiveness Map for ${publication.reportingPeriodLabel}`}
        >
          {/* Subtle geographic graticule backdrop */}
          <g className="opacity-15 stroke-slate-300 stroke-[0.5] fill-none" aria-hidden="true">
            <line x1="80" y1="0" x2="80" y2="660" />
            <line x1="200" y1="0" x2="200" y2="660" />
            <line x1="320" y1="0" x2="320" y2="660" />
            <line x1="440" y1="0" x2="440" y2="660" />
            <line x1="560" y1="0" x2="560" y2="660" />
            <line x1="680" y1="0" x2="680" y2="660" />
            <line x1="0" y1="120" x2="800" y2="120" />
            <line x1="0" y1="240" x2="800" y2="240" />
            <line x1="0" y1="360" x2="800" y2="360" />
            <line x1="0" y1="480" x2="800" y2="480" />
            <line x1="0" y1="600" x2="800" y2="600" />
          </g>

          {/* Map State Paths for All 36 States and FCT */}
          {NIGERIA_ACCURATE_STATE_PATHS.map((st) => {
            const stateRecord = publication.classifications[st.code];
            const classification: DcmClassification = stateRecord?.classification || 'Insufficient evidence';
            const colorMeta = DCM_COLORS[classification] || DCM_COLORS['Insufficient evidence'];
            
            const isSelected = selectedStateCode === st.code;
            const isHovered = hoveredState?.code === st.code;
            const isChanged = highlightChanges && changedStateCodes.has(st.code);

            // Determine opacity:
            // In "All States" mode -> all states are 1.0 (normal opacity)
            // When a single state is selected -> selected is 1.0, others are 0.40
            const stateOpacity = isAllStatesActive ? 1.0 : isSelected ? 1.0 : 0.40;

            // Small states font size tweak
            const isCompactState = ['LA', 'FC', 'EK', 'OS', 'IM', 'AB', 'AN', 'EB'].includes(st.code);
            const fontSize = isCompactState ? '8.5px' : '10.5px';

            return (
              <g
                key={st.code}
                onClick={() => onSelectState(isSelected ? null : st.code)}
                onMouseEnter={() => setHoveredState(st)}
                onMouseLeave={() => setHoveredState(null)}
                className="cursor-pointer transition-all duration-200 outline-none group"
                tabIndex={0}
                role="button"
                aria-label={`${st.name} — ${classification} — Reporting period ${publication.reportingPeriodLabel}`}
                aria-pressed={isSelected}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectState(isSelected ? null : st.code);
                  }
                }}
              >
                {/* Real Geographic State Boundary Path */}
                <path
                  d={st.path}
                  fill={colorMeta.fill}
                  opacity={stateOpacity}
                  stroke={isSelected ? '#0F172A' : isChanged ? '#1E3A5F' : '#FFFFFF'}
                  strokeWidth={isSelected ? 3.5 : isChanged ? 2.5 : 1.2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={isChanged && !isSelected ? '5,2.5' : undefined}
                  className="transition-all duration-200 hover:brightness-105"
                  style={{
                    filter: isSelected 
                      ? 'drop-shadow(0 4px 8px rgba(15, 23, 42, 0.4))' 
                      : isHovered 
                        ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' 
                        : undefined
                  }}
                />

                {/* State Label with halo outline for maximum legibility */}
                <text
                  x={st.labelX}
                  y={st.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  opacity={isAllStatesActive ? 0.95 : isSelected ? 1.0 : 0.45}
                  className="pointer-events-none font-sans font-bold select-none transition-opacity tracking-tight"
                  style={{
                    fontSize,
                    stroke: '#FFFFFF',
                    strokeWidth: 2.5,
                    paintOrder: 'stroke fill',
                    fill: '#1E293B'
                  }}
                >
                  {st.name}
                </text>

                {/* Changed Indicator Icon Badge on map if highlightChanges is enabled */}
                {isChanged && (
                  <circle
                    cx={st.labelX + 12}
                    cy={st.labelY - 8}
                    r={4}
                    fill="#1E3A5F"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    className="pointer-events-none animate-pulse"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Hover Tooltip showing full state name and classification */}
        {hoveredState && (
          <div
            className="absolute pointer-events-none bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-mono shadow-2xl border border-white/15 z-20 transition-all max-w-xs"
            style={{
              left: `${(hoveredState.labelX / 800) * 100}%`,
              top: `${(hoveredState.labelY / 660) * 100}%`,
              transform: 'translate(-50%, -125%)'
            }}
          >
            <div className="font-bold text-white text-sm flex items-center justify-between gap-3">
              <span>{hoveredState.name}</span>
              <span className="text-[10px] text-slate-300 font-normal">
                {hoveredState.code}
              </span>
              {highlightChanges && changedStateCodes.has(hoveredState.code) && (
                <span className="text-[9px] bg-blue-500/40 text-blue-200 px-1.5 py-0.5 rounded font-sans uppercase font-bold">
                  Changed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-white/10">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                style={{
                  backgroundColor:
                    DCM_COLORS[publication.classifications[hoveredState.code]?.classification || 'Insufficient evidence']?.fill
                }}
              />
              <span className="text-slate-100 font-semibold font-sans">
                {publication.classifications[hoveredState.code]?.classification || 'Insufficient evidence'}
              </span>
            </div>
            {publication.classifications[hoveredState.code]?.classificationRationale && (
              <p className="text-[11px] text-slate-300 mt-1 font-sans line-clamp-2 leading-relaxed">
                {publication.classifications[hoveredState.code]?.classificationRationale}
              </p>
            )}
            <div className="text-[10px] text-slate-400 mt-1 font-sans">
              Click to select state & view timeline
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DcmMap;
