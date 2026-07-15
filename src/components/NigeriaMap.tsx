import { useState } from 'react';
import { MapPin, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export interface StateGeo {
  code: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
}

interface NigeriaMapProps {
  selectedStateCode: string;
  onSelectState: (code: string) => void;
  statesMeta: Array<{
    code: string;
    name: string;
    status: string;
    voters: string;
    pollingUnits: string;
    reconciledRate: string;
  }>;
}

export default function NigeriaMap({ selectedStateCode, onSelectState, statesMeta }: NigeriaMapProps) {
  const [hoveredState, setHoveredState] = useState<StateGeo | null>(null);

  // High-fidelity simplified SVG paths for all 36 states and FCT
  const nigeriaStates: StateGeo[] = [
    { code: 'SO', name: 'Sokoto', path: 'M 30,30 L 100,30 L 100,80 L 50,80 L 30,60 Z', labelX: 65, labelY: 55 },
    { code: 'KE', name: 'Kebbi', path: 'M 15,60 L 50,80 L 50,140 L 15,140 Z', labelX: 30, labelY: 100 },
    { code: 'ZA', name: 'Zamfara', path: 'M 100,30 L 150,30 L 150,90 L 100,80 Z', labelX: 125, labelY: 60 },
    { code: 'KT', name: 'Katsina', path: 'M 150,20 L 200,20 L 200,80 L 150,90 Z', labelX: 175, labelY: 55 },
    { code: 'KN', name: 'Kano', path: 'M 200,30 L 260,30 L 260,90 L 200,80 Z', labelX: 230, labelY: 60 },
    { code: 'JI', name: 'Jigawa', path: 'M 260,20 L 320,20 L 300,70 L 260,90 Z', labelX: 285, labelY: 50 },
    { code: 'YO', name: 'Yobe', path: 'M 320,20 L 380,35 L 360,100 L 300,70 Z', labelX: 345, labelY: 60 },
    { code: 'BO', name: 'Borno', path: 'M 380,35 L 450,50 L 440,130 L 360,100 Z', labelX: 410, labelY: 80 },
    { code: 'GO', name: 'Gombe', path: 'M 330,100 L 390,110 L 380,160 L 330,150 Z', labelX: 360, labelY: 130 },
    { code: 'BA', name: 'Bauchi', path: 'M 240,90 L 330,100 L 330,150 L 240,140 Z', labelX: 285, labelY: 120 },
    { code: 'KD', name: 'Kaduna', path: 'M 140,90 L 240,95 L 210,150 L 140,140 Z', labelX: 185, labelY: 120 },
    { code: 'NI', name: 'Niger', path: 'M 50,140 L 140,140 L 140,210 L 50,200 Z', labelX: 95, labelY: 170 },
    { code: 'KW', name: 'Kwara', path: 'M 35,190 L 110,210 L 110,250 L 35,230 Z', labelX: 70, labelY: 220 },
    { code: 'OY', name: 'Oyo', path: 'M 30,230 L 100,240 L 95,285 L 30,270 Z', labelX: 65, labelY: 255 },
    { code: 'OS', name: 'Osun', path: 'M 100,240 L 140,245 L 135,275 L 100,270 Z', labelX: 118, labelY: 258 },
    { code: 'EK', name: 'Ekiti', path: 'M 140,245 L 175,245 L 170,270 L 135,275 Z', labelX: 158, labelY: 258 },
    { code: 'OD', name: 'Ondo', path: 'M 115,270 L 170,270 L 160,310 L 115,310 Z', labelX: 140, labelY: 290 },
    { code: 'OG', name: 'Ogun', path: 'M 30,270 L 95,285 L 90,310 L 30,305 Z', labelX: 60, labelY: 290 },
    { code: 'LA', name: 'Lagos', path: 'M 30,305 L 90,310 L 90,325 L 30,320 Z', labelX: 55, labelY: 315 },
    { code: 'KO', name: 'Kogi', path: 'M 110,210 L 195,215 L 180,260 L 110,250 Z', labelX: 150, labelY: 235 },
    { code: 'FC', name: 'FCT', path: 'M 140,170 L 195,170 L 195,210 L 140,210 Z', labelX: 168, labelY: 190 },
    { code: 'NA', name: 'Nasarawa', path: 'M 195,170 L 260,180 L 250,225 L 195,215 Z', labelX: 225, labelY: 200 },
    { code: 'PL', name: 'Plateau', path: 'M 240,140 L 310,145 L 290,200 L 210,195 Z', labelX: 260, labelY: 170 },
    { code: 'TA', name: 'Taraba', path: 'M 290,200 L 370,185 L 340,260 L 260,250 Z', labelX: 315, labelY: 225 },
    { code: 'AD', name: 'Adamawa', path: 'M 390,110 L 440,130 L 410,200 L 370,185 Z', labelX: 405, labelY: 160 },
    { code: 'BE', name: 'Benue', path: 'M 195,215 L 280,225 L 270,275 L 180,260 Z', labelX: 235, labelY: 245 },
    { code: 'EN', name: 'Enugu', path: 'M 180,260 L 220,265 L 215,295 L 180,290 Z', labelX: 200, labelY: 278 },
    { code: 'AN', name: 'Anambra', path: 'M 145,280 L 180,285 L 175,310 L 145,305 Z', labelX: 162, labelY: 295 },
    { code: 'IM', name: 'Imo', path: 'M 180,285 L 210,290 L 205,315 L 180,310 Z', labelX: 195, labelY: 300 },
    { code: 'AB', name: 'Abia', path: 'M 210,290 L 240,295 L 235,320 L 210,315 Z', labelX: 225, labelY: 305 },
    { code: 'EB', name: 'Ebonyi', path: 'M 220,265 L 255,270 L 250,295 L 215,295 Z', labelX: 238, labelY: 280 },
    { code: 'ED', name: 'Edo', path: 'M 110,250 L 145,255 L 140,295 L 110,290 Z', labelX: 128, labelY: 272 },
    { code: 'DE', name: 'Delta', path: 'M 100,290 L 140,295 L 135,325 L 100,320 Z', labelX: 120, labelY: 308 },
    { code: 'BY', name: 'Bayelsa', path: 'M 105,320 L 145,325 L 140,345 L 105,340 Z', labelX: 125, labelY: 335 },
    { code: 'RI', name: 'Rivers', path: 'M 145,325 L 185,330 L 180,345 L 140,345 Z', labelX: 162, labelY: 338 },
    { code: 'AK', name: 'Akwa Ibom', path: 'M 185,330 L 220,335 L 215,350 L 180,345 Z', labelX: 202, labelY: 342 },
    { code: 'CR', name: 'Cross River', path: 'M 255,270 L 285,275 L 275,340 L 240,335 Z', labelX: 265, labelY: 305 }
  ];

  // Helper to check if a state is actively monitored
  const getActiveMeta = (code: string) => {
    return statesMeta.find((s) => s.code === code);
  };

  return (
    <div className="space-y-4 w-full h-full flex flex-col justify-between" id="nigerian-reconciliation-map-container">
      
      {/* Dynamic Map SVG */}
      <div className="relative flex-grow flex items-center justify-center min-h-[260px] bg-slate-50/50 rounded-2xl p-2 border border-slate-100 overflow-hidden">
        <svg
          viewBox="0 0 480 370"
          className="w-full max-w-[420px] h-auto drop-shadow-md select-none transition-all duration-300"
          id="real-nigeria-svg"
        >
          {/* Subtle grid backdrop */}
          <g className="opacity-15 stroke-slate-200 stroke-[0.5] fill-none">
            <line x1="40" y1="0" x2="40" y2="370" />
            <line x1="120" y1="0" x2="120" y2="370" />
            <line x1="200" y1="0" x2="200" y2="370" />
            <line x1="280" y1="0" x2="280" y2="370" />
            <line x1="360" y1="0" x2="360" y2="370" />
            <line x1="440" y1="0" x2="440" y2="370" />
            
            <line x1="0" y1="60" x2="480" y2="60" />
            <line x1="0" y1="130" x2="480" y2="130" />
            <line x1="0" y1="200" x2="480" y2="200" />
            <line x1="0" y1="270" x2="480" y2="270" />
            <line x1="0" y1="340" x2="480" y2="340" />
          </g>

          {/* Map States Paths */}
          <g>
            {nigeriaStates.map((st) => {
              const isSelected = selectedStateCode === st.code;
              const activeMeta = getActiveMeta(st.code);
              const isMonitored = !!activeMeta;
              
              // Base colors
              let fillClass = 'fill-slate-100 stroke-slate-300 hover:fill-slate-200';
              
              if (isMonitored) {
                if (isSelected) {
                  fillClass = activeMeta.status === 'Upcoming'
                    ? 'fill-amber-500/80 stroke-amber-600 hover:fill-amber-500 shadow-lg'
                    : 'fill-brand-green/80 stroke-brand-green-hover hover:fill-brand-green shadow-lg';
                } else {
                  fillClass = activeMeta.status === 'Upcoming'
                    ? 'fill-amber-50 hover:fill-amber-100/70 stroke-amber-300'
                    : 'fill-emerald-50 hover:fill-emerald-100/70 stroke-emerald-300';
                }
              }

              return (
                <g key={st.code} className={isMonitored ? "cursor-pointer" : "cursor-default"}>
                  <path
                    d={st.path}
                    className={`${fillClass} stroke-1.5 transition-all duration-300`}
                    onClick={() => isMonitored && onSelectState(st.code)}
                    onMouseEnter={() => setHoveredState(st)}
                    onMouseLeave={() => setHoveredState(null)}
                    style={{
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      transformOrigin: `${st.labelX}px ${st.labelY}px`,
                      filter: isSelected ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))' : 'none'
                    }}
                  />
                  
                  {/* Subtle pulsing indicator ring for active selected/monitored states */}
                  {isMonitored && !isSelected && (
                    <circle
                      cx={st.labelX}
                      cy={st.labelY}
                      r="4"
                      className={`animate-ping absolute pointer-events-none fill-none stroke-2 ${
                        activeMeta.status === 'Upcoming' ? 'stroke-amber-400' : 'stroke-brand-green'
                      }`}
                      style={{ opacity: 0.6 }}
                    />
                  )}

                  {/* Tiny text label for state code */}
                  <text
                    x={st.labelX}
                    y={st.labelY + 3}
                    textAnchor="middle"
                    className={`pointer-events-none text-[8px] font-mono font-black ${
                      isSelected 
                        ? 'fill-white' 
                        : isMonitored 
                          ? activeMeta.status === 'Upcoming' ? 'fill-amber-700' : 'fill-brand-green-hover'
                          : 'fill-slate-400'
                    }`}
                  >
                    {st.code}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating current selection context overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-line px-3 py-1.5 rounded-lg shadow-sm pointer-events-none z-10">
          <span className="text-[10px] font-mono font-bold text-mut uppercase tracking-wider block">
            Selected State
          </span>
          <span className="font-display font-black text-navy text-sm flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-brand-blue" />
            {nigeriaStates.find(s => s.code === selectedStateCode)?.name || selectedStateCode}
          </span>
        </div>

        {/* Legend */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-white/95 backdrop-blur-sm border border-line p-2 rounded-lg shadow-sm text-[9px] font-mono font-bold text-ink z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-brand-green rounded-full border border-brand-green-hover"></span>
            <span>Audited (Concluded)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full border border-amber-600"></span>
            <span>Active monitoring</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-slate-100 rounded-full border border-slate-300"></span>
            <span>Other States</span>
          </div>
        </div>
      </div>

      {/* Dynamic hover metadata panel removed */}

    </div>
  );
}
