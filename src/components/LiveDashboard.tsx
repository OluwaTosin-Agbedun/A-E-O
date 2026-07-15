import { useState, useEffect, FormEvent } from 'react';
import { 
  MapPin, Info, ArrowRight, Activity, Users, AlertCircle, 
  Map, Upload, Trash2, Image as ImageIcon, Save, Check 
} from 'lucide-react';
import NigeriaMap from './NigeriaMap';

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
  const [activeMode, setActiveMode] = useState<'map' | 'upload'>('map');
  const [isDragging, setIsDragging] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const curState = states[selectedStateIndex] || states[0];

  // Local form states for the currently selected state
  const [formData, setFormData] = useState<Partial<StateMonitor>>({});

  // Sync form data whenever the selected state or activeMode changes
  useEffect(() => {
    if (curState) {
      setFormData({
        status: curState.status,
        date: curState.date,
        voters: curState.voters,
        pollingUnits: curState.pollingUnits,
        reconciledRate: curState.reconciledRate,
        summary: curState.summary,
        customImage: curState.customImage
      });
    }
  }, [selectedStateIndex, curState]);

  // Persist states array to localStorage
  useEffect(() => {
    localStorage.setItem('aeo_monitored_states_list', JSON.stringify(states));
  }, [states]);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormData(prev => ({
          ...prev,
          customImage: e.target?.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    setStates(prevStates => {
      return prevStates.map((st, idx) => {
        if (idx === selectedStateIndex) {
          const colorClass = formData.status === 'Upcoming' 
            ? 'text-amber-500 border-amber-500 bg-amber-50' 
            : 'text-green-600 border-green-600 bg-green-50';

          const bgGradient = formData.status === 'Upcoming'
            ? 'from-amber-100 to-amber-200/50 border-amber-200'
            : 'from-emerald-50 to-emerald-100/50 border-emerald-200';

          return {
            ...st,
            status: formData.status || st.status,
            date: formData.date || st.date,
            voters: formData.voters || st.voters,
            pollingUnits: formData.pollingUnits || st.pollingUnits,
            reconciledRate: formData.reconciledRate || st.reconciledRate,
            summary: formData.summary || st.summary,
            customImage: formData.customImage,
            colorClass,
            bgGradient
          };
        }
        return st;
      });
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <section className="py-16 bg-paper border-b border-line" id="monitoring">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="eyebrow text-brand-green font-semibold">Live Dashboard</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2 mb-4 leading-tight">
            What we are monitoring now
          </h2>
          <p className="text-ink2 text-base sm:text-lg">
            Real-time observation, coverage tracking, and forensic auditing across critical Nigerian states with detailed sub-regional analysis.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Panel: Map or Upload Mode Container */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-line rounded-2xl p-6 shadow-custom relative overflow-hidden">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveMode('map')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-sans transition-all cursor-pointer ${
                      activeMode === 'map'
                        ? 'bg-white text-navy shadow-sm border border-slate-200/50'
                        : 'text-mut hover:text-ink'
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                    Interactive Map
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-sans transition-all cursor-pointer ${
                      activeMode === 'upload'
                        ? 'bg-white text-navy shadow-sm border border-slate-200/50'
                        : 'text-mut hover:text-ink'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload &amp; Edit Data
                  </button>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-brand-blue font-bold shrink-0">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  Live Feedback
                </span>
              </div>

              {activeMode === 'map' ? (
                /* State SVG Map Display */
                <div className="w-full rounded-2xl border border-line p-1 flex flex-col justify-between relative bg-gradient-to-b from-slate-50/50 to-white/30 transition-all duration-300">
                  <NigeriaMap 
                    selectedStateCode={curState.code}
                    onSelectState={(code) => {
                      const idx = states.findIndex(s => s.code === code);
                      if (idx !== -1) setSelectedStateIndex(idx);
                    }}
                    statesMeta={states.map(s => ({
                      code: s.code,
                      name: s.name,
                      status: s.status,
                      voters: s.voters,
                      pollingUnits: s.pollingUnits,
                      reconciledRate: s.reconciledRate
                    }))}
                  />
                </div>
              ) : (
                /* Edit State Data and Upload Image Form */
                <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-line pb-2 mb-2">
                    <span className="text-sm font-bold text-ink">
                      Editing {curState.name} State ({curState.code})
                    </span>
                    <span className="text-[10px] font-mono text-mut uppercase">
                      Region: {curState.region}
                    </span>
                  </div>

                  {/* Drag-and-drop Image Upload Zone */}
                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] uppercase font-bold text-mut">
                      State Overview / Map Image
                    </label>
                    
                    {formData.customImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-line h-32 bg-slate-50 flex items-center justify-center">
                        <img 
                          src={formData.customImage} 
                          alt="Uploaded state overview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, customImage: undefined }))}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-rose-600 shadow-md transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleImageFile(file);
                        }}
                        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                          isDragging 
                            ? 'border-brand-blue bg-blue-50/50' 
                            : 'border-line hover:border-slate-400 bg-slate-50'
                        }`}
                      >
                        <input
                          type="file"
                          id="state-image-file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageFile(file);
                          }}
                        />
                        <label htmlFor="state-image-file" className="cursor-pointer flex flex-col items-center w-full">
                          <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="font-semibold text-slate-600 hover:text-brand-blue transition-colors">
                            Click to upload state image
                          </span>
                          <span className="text-[10px] text-mut mt-0.5">
                            or drag &amp; drop PNG, JPG, SVG
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Form fields row 1 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-mut mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full p-2 border border-line rounded-lg bg-white text-ink font-semibold focus:outline-none focus:border-brand-blue"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Concluded">Concluded</option>
                        <option value="Audit phase">Audit phase</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-mut mb-1">
                        Election Date
                      </label>
                      <input
                        type="text"
                        value={formData.date || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full p-2 border border-line rounded-lg bg-white text-ink font-semibold focus:outline-none focus:border-brand-blue"
                        placeholder="e.g. Saturday, 15 August 2026"
                      />
                    </div>
                  </div>

                  {/* Form fields row 2 */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-mut mb-1">
                        Voters
                      </label>
                      <input
                        type="text"
                        value={formData.voters || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, voters: e.target.value }))}
                        className="w-full p-2 border border-line rounded-lg bg-white text-ink font-mono font-bold focus:outline-none focus:border-brand-blue"
                        placeholder="e.g. 1,955,657"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-mut mb-1">
                        Polling Units
                      </label>
                      <input
                        type="text"
                        value={formData.pollingUnits || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, pollingUnits: e.target.value }))}
                        className="w-full p-2 border border-line rounded-lg bg-white text-ink font-mono font-bold focus:outline-none focus:border-brand-blue"
                        placeholder="e.g. 3,763"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-mut mb-1">
                        Reconciliation Rate
                      </label>
                      <input
                        type="text"
                        value={formData.reconciledRate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, reconciledRate: e.target.value }))}
                        className="w-full p-2 border border-line rounded-lg bg-white text-ink font-mono font-bold focus:outline-none focus:border-brand-blue"
                        placeholder="e.g. 95%"
                      />
                    </div>
                  </div>

                  {/* Summary / Observatory Briefing */}
                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-mut mb-1">
                      Observatory Briefing / Summary
                    </label>
                    <textarea
                      value={formData.summary || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                      rows={2}
                      className="w-full p-2 border border-line rounded-lg bg-white text-ink leading-normal focus:outline-none focus:border-brand-blue resize-none"
                      placeholder="Enter a brief summary statement about the election / audit..."
                    />
                  </div>

                  {/* Save button and status feedback */}
                  <div className="flex items-center gap-2 justify-between pt-1">
                    {saveSuccess ? (
                      <span className="text-[10px] font-semibold text-brand-green flex items-center gap-1 animate-pulse">
                        <Check className="w-3.5 h-3.5" /> Saved Successfully!
                      </span>
                    ) : (
                      <span className="text-[9px] text-mut">
                        *Changes persist in your local browser session.
                      </span>
                    )}
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-dark transition-all cursor-pointer shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save State Data
                    </button>
                  </div>
                </form>
              )}
            </div>
            
          </div>

          {/* Interactive State Control Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between">
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
