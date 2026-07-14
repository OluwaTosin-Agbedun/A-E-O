import { useState } from 'react';
import { Activity, LayoutGrid, CheckCircle2, Info, ChevronRight, BarChart2 } from 'lucide-react';

export default function Flagship() {
  const [activeEhiiDimension, setActiveEhiiDimension] = useState<string | null>(null);
  const [activeDciDimension, setActiveDciDimension] = useState<string | null>(null);

  const ehiiDimensions = [
    { name: 'Voter Accreditation', score: '78.2/100', desc: 'Accuracy and speed of BVAS checks, with minimal failure rates.' },
    { name: 'Collation Transparency', score: '64.5/100', desc: 'Consistency of ward/LGA additions vs polling-unit sheets.' },
    { name: 'Technology Integrity', score: '59.0/100', desc: 'Reliability and security of IReV uploads and network uptime.' },
    { name: 'Public Confidence', score: '51.4/100', desc: 'Civic trust, safety perception, and voter turnout trends.' },
    { name: 'Procedural Compliance', score: '90.9/100', desc: 'Adherence of ad-hoc staff to specified regulatory guidelines.' }
  ];

  const dciDimensions = [
    { name: 'Party Stability', rating: '3/6', level: 'Moderate', desc: 'Frequency of internal party crises, defection patterns, and primary legal disputes.' },
    { name: 'Opposition Freedom', rating: '5/6', level: 'High', desc: 'Level of access to public squares, media visibility, and freedom from systematic state interference.' },
    { name: 'Litigation Volume', rating: '2/6', level: 'High Risk', desc: 'High pre-election courtroom actions, slowing administrative timelines.' },
    { name: 'Administrative Readiness', rating: '5/6', level: 'Adequate', desc: 'Deployment of logistics, voter education, and voter card distributions.' },
    { name: 'Competitive Balance', rating: '4/6', level: 'Healthy', desc: 'Concentration of power; no single party dominates all tiers of legislative seats.' }
  ];

  return (
    <section className="py-16 bg-white border-b border-line" id="flagship-analysis">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="eyebrow text-brand-blue font-semibold">Flagship Analysis</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2 mb-4 leading-tight">
            Two lenses on Nigeria's democracy
          </h2>
          <p className="text-ink2 text-base sm:text-lg">
            The EHII tracks the overall health of the electoral process; the Political Landscape Monitor tracks the conditions for competitive politics that surround it.
          </p>
        </div>

        {/* Two-up Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: EHII */}
          <div id="ehii" className="bg-navy text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-custom border border-navy-dark relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider">
                  Electoral Health &amp; Integrity Index (EHII)
                </span>
                <span className="text-[11px] font-mono font-bold text-green-400 bg-green-950/80 border border-green-800/40 px-2.5 py-0.5 rounded-full">
                  2027 Baseline Active
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl sm:text-6xl font-mono font-bold text-resilient tracking-tighter">68.8</span>
                <span className="text-lg sm:text-xl text-blue-300">/100</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-resilient-light/10 border border-resilient-light/20 text-resilient font-display font-bold text-xs px-3 py-1 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-resilient"></span>
                Resilient · 2027 Baseline Model
              </div>

              {/* Colorful score slider */}
              <div className="space-y-2 mb-6">
                <div className="flex h-3.5 rounded-full overflow-hidden bg-white/10 p-0.5">
                  <div className="h-full bg-rose-500 rounded-l" style={{ width: '25%' }} title="Critical (0-25)"></div>
                  <div className="h-full bg-amber-500" style={{ width: '25%' }} title="Vulnerable (26-50)"></div>
                  <div className="h-full bg-yellow-500" style={{ width: '20%' }} title="Cautionary (51-70)"></div>
                  <div className="h-full bg-resilient" style={{ width: '15%' }} title="Resilient (71-85)"></div>
                  <div className="h-full bg-emerald-600 rounded-r" style={{ width: '15%' }} title="Outstanding (86-100)"></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-blue-300">
                  <span>Critical</span>
                  <span>Cautionary</span>
                  <span className="text-white font-bold underline">▲ 68.8 (Resilient)</span>
                  <span>Outstanding</span>
                </div>
              </div>

              <p className="text-sm text-blue-200 mb-6 leading-relaxed">
                An evidence-based index weighting technical readiness, logistics distribution, result collation fidelity, and public engagement confidence. Benchmarkable over election years.
              </p>

              {/* EHII Sub-Dimensions (Interactivity) */}
              <div className="border-t border-white/10 pt-5 space-y-2">
                <span className="block text-[11px] font-mono font-bold text-blue-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Click dimensions for weights:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ehiiDimensions.map((dim) => (
                    <div 
                      key={dim.name}
                      onClick={() => setActiveEhiiDimension(activeEhiiDimension === dim.name ? null : dim.name)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        activeEhiiDimension === dim.name 
                          ? 'bg-white/10 border-brand-blue' 
                          : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">{dim.name}</span>
                        <span className="text-xs font-mono text-resilient font-bold">{dim.score}</span>
                      </div>
                      {activeEhiiDimension === dim.name && (
                        <p className="text-[11px] text-blue-200 mt-1 leading-snug animate-fade-in">
                          {dim.desc}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: PLM */}
          <div id="plm" className="bg-white border border-line rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-custom">
            <div>
              <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
                <span className="text-xs font-mono font-bold text-brand-purple uppercase tracking-wider">
                  Political Landscape Monitor
                </span>
                <span className="text-[11px] font-mono font-bold text-brand-blue bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  Monthly CADENCE
                </span>
              </div>

              <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-1">
                Democratic Competition Index (DCI)
              </h3>
              <p className="text-xs text-mut mb-6">
                Calculated monthly to track ambient competitive and regulatory conditions.
              </p>

              {/* DCI Key Stats Block */}
              <div className="grid grid-cols-3 gap-3 mb-6 bg-paper rounded-xl p-4 border border-line">
                <div className="text-center border-r border-line last:border-none">
                  <span className="block text-xl sm:text-2xl font-mono font-bold text-brand-purple">22</span>
                  <span className="block text-[10px] text-mut font-semibold uppercase tracking-wider mt-0.5">DCI Total (6-30)</span>
                </div>
                <div className="text-center border-r border-line last:border-none">
                  <span className="block text-xl sm:text-2xl font-display font-semibold text-brand-green">Adequate</span>
                  <span className="block text-[10px] text-mut font-semibold uppercase tracking-wider mt-0.5">Current Band</span>
                </div>
                <div className="text-center border-r border-line last:border-none">
                  <span className="block text-xl sm:text-2xl font-display font-semibold text-brand-blue">Monthly</span>
                  <span className="block text-[10px] text-mut font-semibold uppercase tracking-wider mt-0.5">Frequency</span>
                </div>
              </div>

              <p className="text-sm text-ink2 mb-6 leading-relaxed">
                A quantitative gauge of conditions essential for fair democratic rivalry — evaluating intra-party consolidation, judicial challenges, funding transparency, and systemic parity.
              </p>

              {/* DCI Sub-Dimensions (Interactivity) */}
              <div className="border-t border-line pt-5 space-y-2">
                <span className="block text-[11px] font-mono font-bold text-brand-purple uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" /> Click criteria for diagnostics:
                </span>
                <div className="space-y-1.5">
                  {dciDimensions.map((dim) => (
                    <div 
                      key={dim.name}
                      onClick={() => setActiveDciDimension(activeDciDimension === dim.name ? null : dim.name)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        activeDciDimension === dim.name 
                          ? 'bg-paper border-brand-purple' 
                          : 'bg-white border-line hover:bg-paper/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                          {dim.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            dim.level === 'High' ? 'bg-green-100 text-green-800' :
                            dim.level === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                            dim.level === 'Adequate' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {dim.level}
                          </span>
                          <span className="text-xs font-mono font-bold text-brand-purple">{dim.rating}</span>
                        </div>
                      </div>
                      {activeDciDimension === dim.name && (
                        <p className="text-[11px] text-ink2 mt-2 leading-relaxed animate-fade-in border-t border-line/50 pt-2">
                          {dim.desc}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
