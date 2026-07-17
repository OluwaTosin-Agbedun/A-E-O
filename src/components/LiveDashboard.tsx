import { useState, useEffect } from 'react';
import { 
  ArrowRight, Users, AlertCircle 
} from 'lucide-react';

interface StateMonitor {
  code: string;
  name: string;
  region: string;
  election: string;
  status: 'Upcoming' | 'Concluded' | 'Audit phase';
  date: string;
  voters: string;
  pollingUnits: string;
  reconciledRate: string;
  summary: string;
  colorClass: string;
  bgGradient: string;
  customImage?: string; // Base64 data URL
}

const INITIAL_STATES: StateMonitor[] = [
  {
    code: 'OS',
    name: 'Osun',
    region: 'South West',
    election: 'Governorship',
    status: 'Upcoming',
    date: 'Saturday, 15 August 2026',
    voters: '1,955,657',
    pollingUnits: '3,763',
    reconciledRate: '0%',
    summary: 'Preparing 1,200 ad-hoc observers. Observer accreditation and mapping of local collation center routes are underway.',
    colorClass: 'text-amber-500 border-amber-500 bg-amber-50',
    bgGradient: 'from-amber-100 to-amber-200/50 border-amber-200'
  },
  {
    code: 'EK',
    name: 'Ekiti',
    region: 'South West',
    election: 'Governorship',
    status: 'Concluded',
    date: 'June 2024',
    voters: '988,923',
    pollingUnits: '2,445',
    reconciledRate: '98.2%',
    summary: 'Full audits concluded. High IReV upload fidelity recorded with minor ad-hoc administrative delays in Ekiti East LGA.',
    colorClass: 'text-green-600 border-green-600 bg-green-50',
    bgGradient: 'from-emerald-50 to-emerald-100/50 border-emerald-200'
  },
  {
    code: 'AN',
    name: 'Anambra',
    region: 'South East',
    election: 'Governorship',
    status: 'Concluded',
    date: 'November 2025',
    voters: '2,533,722',
    pollingUnits: '5,720',
    reconciledRate: '100%',
    summary: 'Comprehensive audit report published. Verified 5,720 PUs with specific legal findings on over-accreditation patterns.',
    colorClass: 'text-green-600 border-green-600 bg-green-50',
    bgGradient: 'from-blue-50 to-blue-100/50 border-blue-200'
  },
  {
    code: 'OD',
    name: 'Ondo',
    region: 'South West',
    election: 'Off-cycle Gov.',
    status: 'Concluded',
    date: 'November 2024',
    voters: '2,053,061',
    pollingUnits: '3,933',
    reconciledRate: '99.4%',
    summary: 'All polling unit results parsed. Concluded that results declared reflect the true distribution of primary ballots.',
    colorClass: 'text-green-600 border-green-600 bg-green-50',
    bgGradient: 'from-indigo-50 to-indigo-100/50 border-indigo-200'
  }
];

export default function LiveDashboard() {
  const [states, setStates] = useState<StateMonitor[]>(() => {
    const saved = localStorage.getItem('aeo_monitored_states_list');
    return saved ? JSON.parse(saved) : INITIAL_STATES;
  });

  const [selectedStateIndex, setSelectedStateIndex] = useState(0);

  const curState = states[selectedStateIndex] || states[0];

  // Persist states array to localStorage
  useEffect(() => {
    localStorage.setItem('aeo_monitored_states_list', JSON.stringify(states));
  }, [states]);

  return (
    <section className="py-16 bg-paper border-b border-line" id="monitoring">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2 mb-4 leading-tight">
            Live Election
          </h2>
        </div>

        {/* State Selection & Control Panel */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* State Pills Selection List */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {states.map((st, idx) => (
                  <button
                    key={st.code}
                    onClick={() => setSelectedStateIndex(idx)}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer focus:outline-none ${
                      selectedStateIndex === idx 
                        ? 'border-navy bg-navy text-white shadow-md' 
                        : 'border-line bg-white hover:bg-paper text-ink'
                    }`}
                  >
                    <span className="block font-display font-bold text-base">{st.name}</span>
                    <span className="block text-[10px] opacity-75 truncate">{st.status}</span>
                  </button>
                ))}
              </div>

              {/* State Details Panel */}
              <div className="bg-white border border-line rounded-2xl p-6 sm:p-8 shadow-custom space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-ink">
                      {curState.name} State
                    </h3>
                    <p className="text-xs text-mut font-medium">
                      {curState.region} Region · Electoral Diagnostics
                    </p>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
                    curState.status === 'Upcoming' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-green-50 text-green-800 border-green-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${curState.status === 'Upcoming' ? 'bg-amber-400' : 'bg-green-500'}`}></span>
                    {curState.status}
                  </div>
                </div>

                {/* Custom Uploaded Image Display */}
                {curState.customImage && (
                  <div className="relative rounded-xl overflow-hidden border border-line max-h-56 bg-slate-50 flex items-center justify-center">
                    <img 
                      src={curState.customImage} 
                      alt={`${curState.name} State custom upload`} 
                      className="w-full h-auto max-h-56 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Meta details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Election date</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5">{curState.date}</span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Registered Voters</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5 flex items-center gap-1">
                      <Users className="w-4 h-4 text-brand-blue" /> {curState.voters}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Polling Units</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5">{curState.pollingUnits} units</span>
                  </div>
                </div>

                {/* Audit Reconciliation Meter */}
                <div className="p-4 bg-navy text-white rounded-xl border border-navy-dark">
                  <div className="flex items-center justify-between mb-2 text-xs font-mono font-semibold">
                    <span className="text-blue-200 uppercase tracking-wider">Form EC8A Upload Audit Rate:</span>
                    <span className="text-resilient font-bold">{curState.reconciledRate} Reconciled</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-resilient h-full rounded-full transition-all duration-1000" style={{ width: curState.reconciledRate }}></div>
                  </div>
                </div>

                {/* Summary / Analysis statement */}
                <div className="flex gap-3 items-start bg-blue-50/50 border border-blue-100/70 p-4 rounded-xl text-xs leading-relaxed text-ink2">
                  <AlertCircle className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-ink block mb-0.5">Observatory Briefing:</span>
                    {curState.summary}
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
              <span className="text-xs text-mut font-medium">
                *Data updated on standard off-cycle release cycles from primary INEC uploads.
              </span>
              <button 
                type="button"
                onClick={() => {
                  const element = document.getElementById('reports');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs text-brand-blue font-bold hover:underline cursor-pointer"
              >
                Inspect Associated Audit Reports
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
