import { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Filter, ShieldCheck, CheckCircle2, 
  MapPin, Calendar, Users, Layers, Award, ChevronRight, ArrowRight, RotateCcw
} from 'lucide-react';
import { PartyLogo } from './PartyLogo';

export interface PastElectionItem {
  code: string;
  title: string;
  subtitle: string;
  category: 'Off-Cycle' | 'Presidential' | 'Governorship';
  date: string;
  region: string;
  status: 'Concluded';
  voters?: string;
  accreditedVoters?: string;
  validVotes?: string;
  pollingUnits?: string;
  reconciledRate: string;
  summary: string;
  winner?: {
    candidate: string;
    party: string;
  };
  topParties: {
    name: string;
    fullName: string;
    votes: string;
    percentage: number;
    color: string;
  }[];
}

export const PAST_ELECTIONS_DATA: PastElectionItem[] = [
  // --- OFF-CYCLE ---
  {
    code: 'EK',
    title: 'Ekiti State Governorship Election',
    subtitle: 'South West, Nigeria · Concluded & Verified',
    category: 'Off-Cycle',
    date: 'June 2024',
    region: 'South West',
    status: 'Concluded',
    voters: '988,923',
    accreditedVoters: '345,100',
    validVotes: '336,718',
    pollingUnits: '2,445',
    reconciledRate: '98.2%',
    summary: 'Full post-election audit completed. High IReV upload fidelity recorded with minor ad-hoc administrative delays in Ekiti East LGA.',
    winner: { candidate: 'Biodun Oyebanji', party: 'APC' },
    topParties: [
      { name: 'APC', fullName: 'All Progressives Congress', votes: '187,057 votes', percentage: 52.3, color: 'bg-emerald-600' },
      { name: 'SDP', fullName: 'Social Democratic Party', votes: '82,211 votes', percentage: 23.0, color: 'bg-amber-600' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '67,454 votes', percentage: 18.9, color: 'bg-red-600' },
      { name: 'LP', fullName: 'Labour Party', votes: '11,450 votes', percentage: 3.2, color: 'bg-rose-500' }
    ]
  },
  {
    code: 'OD',
    title: 'Ondo State Off-Cycle Governorship Election',
    subtitle: 'South West, Nigeria · Concluded & Verified',
    category: 'Off-Cycle',
    date: 'November 2024',
    region: 'South West',
    status: 'Concluded',
    voters: '2,053,061',
    accreditedVoters: '495,800',
    validVotes: '489,155',
    pollingUnits: '3,933',
    reconciledRate: '99.4%',
    summary: 'All polling unit results parsed. Forensic audit confirmed declared results match verified Form EC8A uploads.',
    winner: { candidate: 'Lucky Aiyedatiwa', party: 'APC' },
    topParties: [
      { name: 'APC', fullName: 'All Progressives Congress', votes: '366,612 votes', percentage: 74.8, color: 'bg-emerald-600' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '117,845 votes', percentage: 24.1, color: 'bg-red-600' },
      { name: 'LP', fullName: 'Labour Party', votes: '4,743 votes', percentage: 1.0, color: 'bg-rose-500' }
    ]
  },
  {
    code: 'AN',
    title: 'Anambra State Off-Cycle Governorship Election',
    subtitle: 'South East, Nigeria · Concluded & Verified',
    category: 'Off-Cycle',
    date: 'November 2025',
    region: 'South East',
    status: 'Concluded',
    voters: '2,533,722',
    accreditedVoters: '195,500',
    validVotes: '191,823',
    pollingUnits: '5,720',
    reconciledRate: '100%',
    summary: 'Comprehensive audit report published. Verified 5,720 PUs with specific legal findings on over-accreditation patterns.',
    winner: { candidate: 'Charles Soludo', party: 'APGA' },
    topParties: [
      { name: 'APGA', fullName: 'All Progressives Grand Alliance', votes: '112,229 votes', percentage: 56.7, color: 'bg-indigo-600' },
      { name: 'APC', fullName: 'All Progressives Congress', votes: '43,285 votes', percentage: 21.9, color: 'bg-emerald-600' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '33,074 votes', percentage: 16.7, color: 'bg-red-600' }
    ]
  },
  {
    code: 'ED_OFF',
    title: 'Edo State Off-Cycle Governorship Poll',
    subtitle: 'South South, Nigeria · Concluded & Verified',
    category: 'Off-Cycle',
    date: 'September 2024',
    region: 'South South',
    status: 'Concluded',
    voters: '2,629,025',
    accreditedVoters: '568,693',
    validVotes: '561,700',
    pollingUnits: '4,519',
    reconciledRate: '98.6%',
    summary: 'Rigorous forensic audit across 18 LGAs. High transmission accuracy recorded on the IReV portal.',
    winner: { candidate: 'Monday Okpebholo', party: 'APC' },
    topParties: [
      { name: 'APC', fullName: 'All Progressives Congress', votes: '291,667 votes', percentage: 51.2, color: 'bg-emerald-600' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '247,274 votes', percentage: 43.4, color: 'bg-red-600' },
      { name: 'LP', fullName: 'Labour Party', votes: '22,763 votes', percentage: 4.0, color: 'bg-rose-500' }
    ]
  },
  {
    code: 'KG_OFF',
    title: 'Kogi State Off-Cycle Governorship Poll',
    subtitle: 'North Central, Nigeria · Concluded & Audited',
    category: 'Off-Cycle',
    date: 'November 2023',
    region: 'North Central',
    status: 'Concluded',
    voters: '1,932,474',
    accreditedVoters: '784,305',
    validVotes: '776,168',
    pollingUnits: '3,508',
    reconciledRate: '97.1%',
    summary: 'Pre-filled result sheets identified in Ogori/Magongo LGA were flagged and excluded from official tallies during audit.',
    winner: { candidate: 'Ahmed Usman Ododo', party: 'APC' },
    topParties: [
      { name: 'APC', fullName: 'All Progressives Congress', votes: '426,237 votes', percentage: 55.4, color: 'bg-emerald-600' },
      { name: 'SDP', fullName: 'Social Democratic Party', votes: '259,052 votes', percentage: 33.7, color: 'bg-amber-600' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '77,882 votes', percentage: 10.1, color: 'bg-red-600' }
    ]
  },
  {
    code: 'BY_OFF',
    title: 'Bayelsa State Off-Cycle Governorship Poll',
    subtitle: 'South South, Nigeria · Concluded & Audited',
    category: 'Off-Cycle',
    date: 'November 2023',
    region: 'South South',
    status: 'Concluded',
    voters: '1,056,862',
    accreditedVoters: '328,120',
    validVotes: '323,209',
    pollingUnits: '2,242',
    reconciledRate: '96.8%',
    summary: 'Post-election forensics verified polling unit returns across riverine communities in Nembe and Southern Ijaw LGAs.',
    winner: { candidate: 'Douye Diri', party: 'PDP' },
    topParties: [
      { name: 'PDP', fullName: "People's Democratic Party", votes: '175,196 votes', percentage: 54.1, color: 'bg-red-600' },
      { name: 'APC', fullName: 'All Progressives Congress', votes: '110,108 votes', percentage: 34.0, color: 'bg-emerald-600' },
      { name: 'LP', fullName: 'Labour Party', votes: '905 votes', percentage: 0.3, color: 'bg-rose-500' }
    ]
  },
  {
    code: 'IM_OFF',
    title: 'Imo State Off-Cycle Governorship Poll',
    subtitle: 'South East, Nigeria · Concluded & Audited',
    category: 'Off-Cycle',
    date: 'November 2023',
    region: 'South East',
    status: 'Concluded',
    voters: '2,419,922',
    accreditedVoters: '694,892',
    validVotes: '685,892',
    pollingUnits: '4,758',
    reconciledRate: '95.4%',
    summary: 'Audit identified transmission delays in Orlu zone. Final dataset reconciles 27 LGAs with BVAS hardware logs.',
    winner: { candidate: 'Hope Uzodimma', party: 'APC' },
    topParties: [
      { name: 'APC', fullName: 'All Progressives Congress', votes: '540,308 votes', percentage: 78.2, color: 'bg-emerald-600' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '71,503 votes', percentage: 10.3, color: 'bg-red-600' },
      { name: 'LP', fullName: 'Labour Party', votes: '64,081 votes', percentage: 9.3, color: 'bg-rose-500' }
    ]
  },
  {
    code: 'OS_OFF',
    title: 'Osun State Off-Cycle Governorship Poll',
    subtitle: 'South West, Nigeria · Concluded & Audited',
    category: 'Off-Cycle',
    date: 'July 2022',
    region: 'South West',
    status: 'Concluded',
    voters: '1,955,657',
    accreditedVoters: '827,218',
    validVotes: '804,450',
    pollingUnits: '3,763',
    reconciledRate: '99.1%',
    summary: 'Historic early deployment of BVAS technology. Supreme Court confirmed election outcome following forensic scrutiny.',
    winner: { candidate: 'Ademola Adeleke', party: 'PDP' },
    topParties: [
      { name: 'PDP', fullName: "People's Democratic Party", votes: '403,371 votes', percentage: 50.1, color: 'bg-red-600' },
      { name: 'APC', fullName: 'All Progressives Congress', votes: '375,027 votes', percentage: 46.6, color: 'bg-emerald-600' }
    ]
  },

  // --- PRESIDENTIAL ---
  {
    code: 'NG_PRES_2023',
    title: '2023 Nigeria Presidential Election',
    subtitle: 'National (36 States & FCT) · Concluded & Audited',
    category: 'Presidential',
    date: 'February 25, 2023',
    region: 'National (Nigeria)',
    status: 'Concluded',
    voters: '93,469,008',
    accreditedVoters: '25,286,616',
    validVotes: '24,025,940',
    pollingUnits: '176,846',
    reconciledRate: '94.8%',
    summary: 'Full national forensic audit. Audited IReV portal uploads, BVAS machine logs, and state-level collation spreadsheets.',
    winner: { candidate: 'Bola Ahmed Tinubu', party: 'APC' },
    topParties: [
      { name: 'APC', fullName: 'All Progressives Congress', votes: '8,794,726 votes', percentage: 36.6, color: 'bg-emerald-600' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '6,984,520 votes', percentage: 29.1, color: 'bg-red-600' },
      { name: 'LP', fullName: 'Labour Party', votes: '6,101,533 votes', percentage: 25.4, color: 'bg-rose-500' },
      { name: 'NNPP', fullName: 'New Nigeria Peoples Party', votes: '1,496,687 votes', percentage: 6.2, color: 'bg-blue-600' }
    ]
  },
  {
    code: 'SN_PRES_2024',
    title: '2024 Senegal Presidential Election',
    subtitle: 'Republic of Senegal · Continental Reference',
    category: 'Presidential',
    date: 'March 24, 2024',
    region: 'West Africa (Senegal)',
    status: 'Concluded',
    voters: '7,371,890',
    accreditedVoters: '4,520,100',
    validVotes: '4,480,120',
    pollingUnits: '15,633',
    reconciledRate: '100%',
    summary: 'High transparency election featuring rapid digital publication of constituency tally sheets.',
    winner: { candidate: 'Bassirou Diomaye Faye', party: 'PASTEF' },
    topParties: [
      { name: 'PASTEF', fullName: 'Patriotes du Sénégal', votes: '2,434,751 votes', percentage: 54.3, color: 'bg-emerald-700' },
      { name: 'BBY', fullName: 'Benno Bokk Yakaar', votes: '1,605,086 votes', percentage: 35.8, color: 'bg-amber-600' }
    ]
  },
  {
    code: 'GH_PRES_2024',
    title: '2024 Ghana Presidential Election',
    subtitle: 'Republic of Ghana · Continental Benchmark',
    category: 'Presidential',
    date: 'December 7, 2024',
    region: 'West Africa (Ghana)',
    status: 'Concluded',
    voters: '18,774,159',
    accreditedVoters: '11,250,000',
    validVotes: '11,180,000',
    pollingUnits: '40,000',
    reconciledRate: '99.7%',
    summary: 'Peaceful political transition with verified polling station pink sheets verified across 275 constituencies.',
    winner: { candidate: 'John Dramani Mahama', party: 'NDC' },
    topParties: [
      { name: 'NDC', fullName: 'National Democratic Congress', votes: '6,321,800 votes', percentage: 56.2, color: 'bg-emerald-600' },
      { name: 'NPP', fullName: 'New Patriotic Party', votes: '4,601,200 votes', percentage: 40.9, color: 'bg-blue-600' }
    ]
  },
  {
    code: 'ZA_PRES_2024',
    title: '2024 South Africa General & Presidential Election',
    subtitle: 'Republic of South Africa · Continental Audit',
    category: 'Presidential',
    date: 'May 29, 2024',
    region: 'Southern Africa',
    status: 'Concluded',
    voters: '27,782,477',
    accreditedVoters: '16,290,000',
    validVotes: '16,080,000',
    pollingUnits: '23,296',
    reconciledRate: '99.2%',
    summary: 'Historic election leading to Government of National Unity (GNU). Audit confirmed IEC tally accuracy.',
    winner: { candidate: 'Cyril Ramaphosa', party: 'ANC' },
    topParties: [
      { name: 'ANC', fullName: 'African National Congress', votes: '6,483,093 votes', percentage: 40.2, color: 'bg-amber-600' },
      { name: 'DA', fullName: 'Democratic Alliance', votes: '3,550,448 votes', percentage: 21.8, color: 'bg-blue-600' },
      { name: 'MK', fullName: 'uMkhonto weSizwe', votes: '2,344,309 votes', percentage: 14.6, color: 'bg-emerald-800' }
    ]
  },

  // --- GOVERNORSHIP ---
  {
    code: 'LA_GOV_2023',
    title: 'Lagos State Governorship Election',
    subtitle: 'South West, Nigeria · Audited',
    category: 'Governorship',
    date: 'March 18, 2023',
    region: 'South West',
    status: 'Concluded',
    voters: '7,060,195',
    accreditedVoters: '1,182,620',
    validVotes: '1,155,123',
    pollingUnits: '13,325',
    reconciledRate: '97.8%',
    summary: 'Audited 13,325 polling units in Lagos State. Evaluated voter turnout and security incidents in key urban LGAs.',
    winner: { candidate: 'Babajide Sanwo-Olu', party: 'APC' },
    topParties: [
      { name: 'APC', fullName: 'All Progressives Congress', votes: '762,134 votes', percentage: 64.9, color: 'bg-emerald-600' },
      { name: 'LP', fullName: 'Labour Party', votes: '312,329 votes', percentage: 26.6, color: 'bg-rose-500' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '62,449 votes', percentage: 5.3, color: 'bg-red-600' }
    ]
  },
  {
    code: 'KN_GOV_2023',
    title: 'Kano State Governorship Election',
    subtitle: 'North West, Nigeria · Audited',
    category: 'Governorship',
    date: 'March 18, 2023',
    region: 'North West',
    status: 'Concluded',
    voters: '5,921,370',
    accreditedVoters: '1,780,200',
    validVotes: '1,755,531',
    pollingUnits: '1,755,531',
    reconciledRate: '98.5%',
    summary: 'Audit scrutinized 44 LGAs in Kano. Supreme Court judgment validated initial election observer findings.',
    winner: { candidate: 'Abba Kabir Yusuf', party: 'NNPP' },
    topParties: [
      { name: 'NNPP', fullName: 'New Nigeria Peoples Party', votes: '864,826 votes', percentage: 51.8, color: 'bg-blue-600' },
      { name: 'APC', fullName: 'All Progressives Congress', votes: '890,705 votes', percentage: 46.2, color: 'bg-emerald-600' }
    ]
  },
  {
    code: 'RV_GOV_2023',
    title: 'Rivers State Governorship Election',
    subtitle: 'South South, Nigeria · Audited',
    category: 'Governorship',
    date: 'March 18, 2023',
    region: 'South South',
    status: 'Concluded',
    voters: '3,537,190',
    accreditedVoters: '490,200',
    validVotes: '483,170',
    pollingUnits: '6,868',
    reconciledRate: '96.1%',
    summary: 'Detailed polling unit analysis across Obio/Akpor and Port Harcourt LGAs with observer reports.',
    winner: { candidate: 'Siminalayi Fubara', party: 'PDP' },
    topParties: [
      { name: 'PDP', fullName: "People's Democratic Party", votes: '302,614 votes', percentage: 62.5, color: 'bg-red-600' },
      { name: 'SDP', fullName: 'Social Democratic Party', votes: '95,474 votes', percentage: 19.7, color: 'bg-amber-600' },
      { name: 'APC', fullName: 'All Progressives Congress', votes: '50,082 votes', percentage: 10.3, color: 'bg-emerald-600' }
    ]
  },
  {
    code: 'KD_GOV_2023',
    title: 'Kaduna State Governorship Election',
    subtitle: 'North West, Nigeria · Audited',
    category: 'Governorship',
    date: 'March 18, 2023',
    region: 'North West',
    status: 'Concluded',
    voters: '4,335,208',
    accreditedVoters: '1,470,200',
    validVotes: '1,456,990',
    pollingUnits: '8,012',
    reconciledRate: '97.4%',
    summary: 'Audited close margin election across 23 LGAs. Reconciled BVAS logs against local collation center sheets.',
    winner: { candidate: 'Uba Sani', party: 'APC' },
    topParties: [
      { name: 'APC', fullName: 'All Progressives Congress', votes: '737,610 votes', percentage: 50.4, color: 'bg-emerald-600' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '719,380 votes', percentage: 49.1, color: 'bg-red-600' }
    ]
  },
  {
    code: 'OY_GOV_2023',
    title: 'Oyo State Governorship Election',
    subtitle: 'South West, Nigeria · Audited',
    category: 'Governorship',
    date: 'March 18, 2023',
    region: 'South West',
    status: 'Concluded',
    voters: '3,276,675',
    accreditedVoters: '890,500',
    validVotes: '882,438',
    pollingUnits: '6,390',
    reconciledRate: '98.9%',
    summary: 'Audit confirmed high electoral compliance and peaceful polling across Ibadan and Ibarapa zones.',
    winner: { candidate: 'Seyi Makinde', party: 'PDP' },
    topParties: [
      { name: 'PDP', fullName: "People's Democratic Party", votes: '563,756 votes', percentage: 63.3, color: 'bg-red-600' },
      { name: 'APC', fullName: 'All Progressives Congress', votes: '256,682 votes', percentage: 28.8, color: 'bg-emerald-600' }
    ]
  }
];

export default function PastElectionsArchive() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Off-Cycle' | 'Presidential' | 'Governorship'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const navigateTo = (to: string) => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  const filteredElections = useMemo(() => {
    return PAST_ELECTIONS_DATA.filter(item => {
      // Filter by category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(q);
        const matchesRegion = item.region.toLowerCase().includes(q);
        const matchesWinner = item.winner?.candidate.toLowerCase().includes(q);
        const matchesParty = item.topParties.some(p => p.name.toLowerCase().includes(q) || p.fullName.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSubtitle && !matchesRegion && !matchesWinner && !matchesParty) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="py-12 sm:py-16 bg-panel min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Navigation Button */}
        <div>
          <button 
            onClick={() => navigateTo('/')}
            className="inline-flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-brand-blue hover:text-brand-blue-dark transition-colors cursor-pointer uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Observatory
          </button>
        </div>

        {/* Page Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Historical Electoral Archive
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-ink leading-tight">
            All Past Elections
          </h1>
          <p className="text-ink2 text-sm sm:text-base leading-relaxed">
            A comprehensive, verified registry of concluded and audited elections across Off-Cycle gubernatorial polls, Presidential contests, and state-wide Governorship elections.
          </p>
        </div>

        {/* Search & Category Filter Section */}
        <div className="bg-white border border-line rounded-2xl p-6 shadow-custom space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* User-Requested Filters: Off-Cycle, Presidential, Governorship */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Filter by Category
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Past Elections' },
                  { id: 'Off-Cycle', label: 'Off-Cycle' },
                  { id: 'Presidential', label: 'Presidential' },
                  { id: 'Governorship', label: 'Governorship' },
                ].map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count = cat.id === 'all'
                    ? PAST_ELECTIONS_DATA.length
                    : PAST_ELECTIONS_DATA.filter(i => i.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-navy border-navy text-white shadow-xs'
                          : 'bg-paper hover:bg-slate-100 border-line text-ink2 hover:text-ink'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Oval Search Bar */}
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search past elections, candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-paper/80 border border-line rounded-full text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:border-brand-blue shadow-2xs transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
                >
                  ×
                </button>
              )}
            </div>

          </div>

          {/* Active Filter Info Counter */}
          <div className="flex items-center justify-between border-t border-line/60 pt-4 text-xs font-mono text-slate-500">
            <div>
              Showing <span className="font-bold text-ink">{filteredElections.length}</span> {selectedCategory === 'all' ? 'total' : selectedCategory} election record{filteredElections.length === 1 ? '' : 's'}
            </div>
            {(selectedCategory !== 'all' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-brand-blue hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>

        </div>

        {/* Elections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredElections.length > 0 ? (
            filteredElections.map((item) => (
              <div 
                key={item.code}
                className="bg-white border border-line rounded-2xl p-6 shadow-custom hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  
                  {/* Category Pill & Status Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-brand-blue border border-blue-100">
                      <Layers className="w-3 h-3 text-brand-blue" />
                      {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {item.status}
                    </span>
                  </div>

                  {/* Election Title & Subtitle */}
                  <div>
                    <h3 className="font-display font-bold text-xl text-ink leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-mut font-medium mt-1 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.date}</span>
                      <span>·</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.region}</span>
                    </p>
                  </div>

                  {/* Declared Winner Card if present */}
                  {item.winner && (
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          Declared Winner
                        </span>
                        <p className="text-xs font-bold text-ink">{item.winner.candidate}</p>
                      </div>
                      <PartyLogo name={item.winner.party} className="w-7 h-7" />
                    </div>
                  )}

                  {/* Summary & Reconciled Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500 font-medium">IReV Audit Reconciliation</span>
                      <span className="font-bold text-emerald-600">{item.reconciledRate}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: item.reconciledRate }}
                      ></div>
                    </div>
                    <p className="text-xs text-ink2 line-clamp-2 leading-relaxed pt-1">
                      {item.summary}
                    </p>
                  </div>

                  {/* Top Parties Breakdown */}
                  <div className="space-y-1.5 pt-2 border-t border-line/50">
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      Leading Party Votes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.topParties.map((p, idx) => (
                        <div 
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper rounded-lg border border-line text-xs font-medium text-ink"
                        >
                          <PartyLogo name={p.name} className="w-4 h-4" />
                          <span className="font-bold">{p.name}:</span>
                          <span className="font-mono text-slate-600 text-[11px]">{p.votes} ({p.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-line/60 flex justify-end">
                  <button
                    onClick={() => navigateTo(`/election/${item.code}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-navy hover:bg-navy/95 text-white text-xs font-mono font-bold rounded-xl shadow-2xs transition-all cursor-pointer uppercase tracking-wider"
                  >
                    <span>View Audit Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="col-span-full bg-white border border-line rounded-2xl p-12 text-center space-y-3">
              <Filter className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-ink">No Past Elections Found</h3>
              <p className="text-xs text-mut max-w-md mx-auto">
                No past election records matched your selected category filter or search query. Try switching categories or clearing your search term.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl shadow-xs hover:bg-brand-blue-dark transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
