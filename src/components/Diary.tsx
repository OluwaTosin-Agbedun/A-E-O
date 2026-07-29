import { useState, useMemo } from 'react';
import { 
  Calendar, Layers, Landmark, MapPin, Globe, Filter, X, 
  ChevronRight, ArrowRight, ShieldCheck, Search, Users, ChevronDown 
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { DiaryItem } from '../types';
import DiaryElectionDetail from './DiaryElectionDetail';

export default function Diary() {
  const { diaryNat, diaryLoc, diaryAfr, diaryOth } = useCMS();

  // Selected Diary Item for Full Detail View
  const [selectedItem, setSelectedItem] = useState<DiaryItem | null>(null);

  // Filter States
  const [regionFilter, setRegionFilter] = useState<'all' | 'nigeria' | 'africa' | 'other'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'presidential' | 'governorship' | 'local_government'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Combine all items and auto-assign region/type if missing
  const allDiaryItems = useMemo(() => {
    const nat = diaryNat.map(item => ({
      ...item,
      region: item.region || 'nigeria' as const,
      type: item.type || (item.title.toLowerCase().includes('presidential') ? 'presidential' as const : 'governorship' as const)
    }));

    const loc = diaryLoc.map(item => ({
      ...item,
      region: item.region || 'nigeria' as const,
      type: item.type || 'local_government' as const
    }));

    const afr = diaryAfr.map(item => ({
      ...item,
      region: item.region || 'africa' as const,
      type: item.type || 'presidential' as const
    }));

    const oth = diaryOth.map(item => ({
      ...item,
      region: item.region || 'other' as const,
      type: item.type || 'presidential' as const
    }));

    return [...nat, ...loc, ...afr, ...oth];
  }, [diaryNat, diaryLoc, diaryAfr, diaryOth]);

  // Filtered List based on criteria
  const filteredData = useMemo(() => {
    return allDiaryItems.filter(item => {
      // 1. Region filter
      if (regionFilter !== 'all' && item.region !== regionFilter) {
        return false;
      }

      // 2. Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }

      // 3. Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(q);
        const matchesCountry = item.country?.toLowerCase().includes(q);
        const matchesExec = item.sittingExecutive?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubtitle && !matchesCountry && !matchesExec) {
          return false;
        }
      }

      return true;
    });
  }, [allDiaryItems, regionFilter, typeFilter, statusFilter, searchQuery]);

  const getStatusColor = (status: DiaryItem['status']) => {
    switch (status) {
      case 'In view':
        return 'bg-amber-500/10 text-amber-700 border-amber-300';
      case 'Scheduled':
        return 'bg-blue-500/10 text-blue-700 border-blue-300';
      case 'Provisional':
        return 'bg-purple-500/10 text-brand-purple border-purple-300';
      case 'Tracking':
        return 'bg-slate-500/10 text-slate-700 border-slate-300';
      case 'Concluded':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
    }
  };

  const resetFilters = () => {
    setRegionFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  const activeFiltersCount = 
    (regionFilter !== 'all' ? 1 : 0) + 
    (typeFilter !== 'all' ? 1 : 0) + 
    (statusFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const handleSelectQuickFilter = (region: 'all' | 'nigeria' | 'africa' | 'other', type: 'all' | 'presidential' | 'governorship' | 'local_government' = 'all') => {
    setRegionFilter(region);
    setTypeFilter(type);
  };

  const handleNavigateToElection = (code: string) => {
    window.history.pushState({}, '', `/election/${code}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // If an election is selected, show full election detail view
  if (selectedItem) {
    return (
      <section className="py-8 sm:py-12 bg-panel min-h-screen" id="diary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DiaryElectionDetail 
            item={selectedItem} 
            onBack={() => setSelectedItem(null)}
            onNavigateToElection={handleNavigateToElection}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-panel border-b border-line" id="diary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <Calendar className="w-3.5 h-3.5 text-brand-blue" />
            Electoral Timelines & Intelligence
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-ink leading-tight">
            Diary of Election
          </h2>
          <p className="text-ink2 text-sm sm:text-base leading-relaxed">
            Comprehensive electoral tracking across Nigerian elections (Presidential, Governorship, Local Government), African nations, and international benchmarks. Click any election to view complete candidate lists and sitting executive data.
          </p>
        </div>

        {/* Quick Filter Bar Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
          <button
            onClick={() => handleSelectQuickFilter('all', 'all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              regionFilter === 'all' && typeFilter === 'all'
                ? 'bg-navy border-navy text-white shadow-sm'
                : 'bg-white hover:bg-paper border-line text-ink2'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Elections
          </button>

          <button
            onClick={() => handleSelectQuickFilter('nigeria', 'presidential')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              regionFilter === 'nigeria' && typeFilter === 'presidential'
                ? 'bg-navy border-navy text-white shadow-sm'
                : 'bg-white hover:bg-paper border-line text-ink2'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-amber-500" />
            Nigeria: Presidential
          </button>

          <button
            onClick={() => handleSelectQuickFilter('nigeria', 'governorship')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              regionFilter === 'nigeria' && typeFilter === 'governorship'
                ? 'bg-navy border-navy text-white shadow-sm'
                : 'bg-white hover:bg-paper border-line text-ink2'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-brand-blue" />
            Nigeria: Governorship
          </button>

          <button
            onClick={() => handleSelectQuickFilter('nigeria', 'local_government')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              regionFilter === 'nigeria' && typeFilter === 'local_government'
                ? 'bg-navy border-navy text-white shadow-sm'
                : 'bg-white hover:bg-paper border-line text-ink2'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-emerald-500" />
            Nigeria: Local Government
          </button>

          <button
            onClick={() => handleSelectQuickFilter('africa', 'all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              regionFilter === 'africa'
                ? 'bg-navy border-navy text-white shadow-sm'
                : 'bg-white hover:bg-paper border-line text-ink2'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-purple-500" />
            Africa
          </button>

          <button
            onClick={() => handleSelectQuickFilter('other', 'all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              regionFilter === 'other'
                ? 'bg-navy border-navy text-white shadow-sm'
                : 'bg-white hover:bg-paper border-line text-ink2'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            Other Continents
          </button>
        </div>

        {/* Main Grid: Filters Card (Sidebar) + Elections List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: FILTERS Card (Styled exactly as requested) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-line p-5 shadow-custom space-y-5 sticky top-6">
              
              {/* Card Title Header */}
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="font-mono text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                  <Filter className="w-4 h-4 text-brand-blue" />
                  FILTERS
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-mono text-brand-blue hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Reset ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search election, country, executive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-paper/80 border border-line rounded-xl text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:border-brand-blue"
                />
              </div>

              {/* Filter by Region (Fully Visible Options) */}
              <div className="space-y-2">
                <label className="text-xs font-bold font-mono text-ink uppercase tracking-wider block">
                  Region / Scope
                </label>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'All Regions & Continents', icon: Layers, color: 'text-slate-500' },
                    { id: 'nigeria', label: 'Nigeria (National & State)', icon: Landmark, color: 'text-amber-500' },
                    { id: 'africa', label: 'Africa (Continental)', icon: MapPin, color: 'text-purple-500' },
                    { id: 'other', label: 'Other Continents (Global)', icon: Globe, color: 'text-blue-500' },
                  ].map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = regionFilter === opt.id;
                    const count = opt.id === 'all' 
                      ? allDiaryItems.length 
                      : allDiaryItems.filter(i => i.region === opt.id).length;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => setRegionFilter(opt.id as any)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-navy text-white shadow-xs font-semibold'
                            : 'bg-paper/60 hover:bg-paper text-ink2 hover:text-ink border border-line/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : opt.color}`} />
                          <span>{opt.label}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter by Type (Fully Visible Options) */}
              <div className="space-y-2 pt-2 border-t border-line/60">
                <label className="text-xs font-bold font-mono text-ink uppercase tracking-wider block">
                  Election Category
                </label>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'All Election Types' },
                    { id: 'presidential', label: 'Presidential Polls' },
                    { id: 'governorship', label: 'Governorship Polls' },
                    { id: 'local_government', label: 'Local Government Polls' },
                  ].map((opt) => {
                    const isSelected = typeFilter === opt.id;
                    const count = opt.id === 'all'
                      ? allDiaryItems.length
                      : allDiaryItems.filter(i => i.type === opt.id).length;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => setTypeFilter(opt.id as any)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-blue text-white shadow-xs font-semibold'
                            : 'bg-paper/60 hover:bg-paper text-ink2 hover:text-ink border border-line/60'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter by Status (Fully Visible Badges) */}
              <div className="space-y-2 pt-2 border-t border-line/60">
                <label className="text-xs font-bold font-mono text-ink uppercase tracking-wider block">
                  Electoral Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'In view', label: 'In View' },
                    { id: 'Scheduled', label: 'Scheduled' },
                    { id: 'Provisional', label: 'Provisional' },
                    { id: 'Tracking', label: 'Tracking' },
                    { id: 'Concluded', label: 'Concluded' },
                  ].map((opt) => {
                    const isSelected = statusFilter === opt.id;
                    const count = opt.id === 'all'
                      ? allDiaryItems.length
                      : allDiaryItems.filter(i => i.status === opt.id).length;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => setStatusFilter(opt.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-navy border-navy text-white shadow-xs font-bold'
                            : 'bg-white hover:bg-paper border-line text-slate-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Filter Counter Footer */}
              <div className="pt-2 border-t border-line text-[11px] font-mono text-mut flex justify-between items-center">
                <span>Showing {filteredData.length} of {allDiaryItems.length} polls</span>
                {activeFiltersCount > 0 && (
                  <span className="text-brand-blue font-bold">Filtered View</span>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Elections List Container */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-mut">
                Electoral Calendar List ({filteredData.length})
              </span>
              <span className="text-[11px] text-brand-blue font-mono">
                Click any row to open full election page
              </span>
            </div>

            {filteredData.length > 0 ? (
              <div className="bg-white border border-line rounded-3xl overflow-hidden shadow-custom divide-y divide-line">
                {filteredData.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-5 sm:p-6 hover:bg-blue-50/40 transition-all cursor-pointer group relative"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      {/* Date Badge */}
                      <div className="md:col-span-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-blue uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 group-hover:bg-blue-100 transition-colors">
                          <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                          {item.date}
                        </span>
                      </div>

                      {/* Title & Metadata */}
                      <div className="md:col-span-6 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-base sm:text-lg text-ink group-hover:text-brand-blue transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-xs text-mut font-medium uppercase tracking-wider flex items-center gap-2">
                          <span>{item.subtitle}</span>
                          {item.country && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 font-bold">{item.country}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Status & Arrow Action */}
                      <div className="md:col-span-3 flex items-center md:justify-end justify-between gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {item.status}
                        </span>

                        <div className="w-8 h-8 rounded-full bg-paper border border-line flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white group-hover:border-brand-blue transition-all shrink-0">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>

                    </div>

                    {/* Sitting Executive preview bar if present */}
                    {item.sittingExecutive && (
                      <div className="mt-3 pt-3 border-t border-line/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-mut">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>Incumbent Executive: <strong className="text-ink">{item.sittingExecutive.name}</strong> ({item.sittingExecutive.party})</span>
                        </div>
                        <span className="text-brand-blue font-mono font-bold text-[10px] group-hover:underline flex items-center gap-1">
                          View Participants & Details <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-line p-12 text-center space-y-4 shadow-custom">
                <Filter className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-display font-bold text-lg text-ink">No elections match selected filter</h3>
                <p className="text-xs text-mut max-w-sm mx-auto">
                  Try adjusting region, type, or status filters to view upcoming and tracked polls.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-brand-blue text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-brand-blue-dark transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
