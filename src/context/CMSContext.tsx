import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Report, DiaryItem, EventItem, TeamMember, WeeklyIssue, HeroConfig, StatItemConfig } from '../types';
import { 
  REPORTS as initialReports, 
  DIARY_NATIONAL as initialDiaryNat, 
  DIARY_LOCAL as initialDiaryLoc, 
  DIARY_AFRICA as initialDiaryAfr, 
  DIARY_OTHER as initialDiaryOth, 
  EVENTS as initialEvents, 
  TEAM as initialTeam, 
  WEEKLY_ISSUES as initialWeekly 
} from '../data';

const INITIAL_HERO_CONFIG: HeroConfig = {
  badgeText: "Independent · Non-partisan · Evidence-based",
  title: "Monitoring election integrity across {Nigeria & Africa}.",
  description: "We observe, audit and report on electoral processes — anchored to primary documents and verifiable data, never to rumour. From live monitoring to forensic post-election analysis.",
  exploreButtonText: "Explore the EHII Index",
  auditButtonText: "Audit Reports",
  spotlightBadgeText: "Next election in view",
  spotlightStatusText: "Off-Cycle",
  spotlightTitle: "Osun State Governorship",
  spotlightDateText: "Saturday, 15 August 2026 · INEC Monitored",
  spotlightTargetDate: "2026-08-15T08:00:00+01:00",
  lgasCount: "30 LGAs + Area Office",
  registeredVoters: "1,955,657 voters",
  pollingUnits: "3,763 PUs",
  spotlightBottomText: "Athena is deploying 1,200 trained field observers to map BVAS compliance and upload forms EC8A to our independent verification pipeline.",
  diaryLinkText: "Open the Diary of Election",
  
  // Custom styling settings default
  heroBgColor: "#1E3A5F", // default bg-navy hex color
  titleFontSize: "text-4xl sm:text-5xl lg:text-6xl",
  titleFontFamily: "font-display", // Space Grotesk
  titleColor: "#FFFFFF",
  titleHighlightFrom: "#93C5FD", // blue-300
  titleHighlightTo: "#86EFAC", // green-300
  descriptionFontSize: "text-base sm:text-lg",
  descriptionFontFamily: "font-sans", // Inter
  descriptionColor: "#DBEAFE" // text-blue-100
};

const INITIAL_STATS_CONFIG: StatItemConfig[] = [
  {
    id: 1,
    title: 'States Monitored',
    value: '4+',
    sub: 'Anambra · Ondo · Ekiti · Osun',
    color: 'bg-gradient-to-br from-blue-600 to-navy-dark',
    iconName: 'Shield',
    detail: 'Our state-by-state deployment maps regional irregularities, accreditation compliance, and local collation workflows.',
    cardBgType: 'gradient',
    cardBgSolid: '#1E3A5F',
    cardBgGradFrom: '#2563EB',
    cardBgGradTo: '#15304F',
    titleFontSize: 'text-xs',
    titleFontFamily: 'font-mono',
    titleColor: '#E2E8F0',
    valueFontSize: 'text-3xl sm:text-4xl',
    valueFontFamily: 'font-display',
    valueColor: '#FFFFFF'
  },
  {
    id: 2,
    title: 'Polling Units Audited',
    value: '12,000+',
    sub: 'Across recent off-cycle polls',
    color: 'bg-gradient-to-br from-green-600 to-green-950',
    iconName: 'Database',
    detail: 'Every single audited unit has its Form EC8A manually cross-checked with BVAS machine registers for discrepancy metrics.',
    cardBgType: 'gradient',
    cardBgSolid: '#166534',
    cardBgGradFrom: '#16A34A',
    cardBgGradTo: '#14532D',
    titleFontSize: 'text-xs',
    titleFontFamily: 'font-mono',
    titleColor: '#DCFCE7',
    valueFontSize: 'text-3xl sm:text-4xl',
    valueFontFamily: 'font-display',
    valueColor: '#FFFFFF'
  },
  {
    id: 3,
    title: 'Reports Published',
    value: '10+',
    sub: 'Forensic & analytical',
    color: 'bg-gradient-to-br from-brand-purple to-purple-950',
    iconName: 'FileSpreadsheet',
    detail: 'Includes peer-reviewed technology security whitepapers, post-election litigation reports, and procedural recommendations.',
    cardBgType: 'gradient',
    cardBgSolid: '#6B21A8',
    cardBgGradFrom: '#7C3AED',
    cardBgGradTo: '#3B0764',
    titleFontSize: 'text-xs',
    titleFontFamily: 'font-mono',
    titleColor: '#F3E8FF',
    valueFontSize: 'text-3xl sm:text-4xl',
    valueFontFamily: 'font-display',
    valueColor: '#FFFFFF'
  },
  {
    id: 4,
    title: 'Countries Tracked',
    value: '15',
    sub: 'Nigeria, Africa & beyond',
    color: 'bg-gradient-to-br from-slate-700 to-ink',
    iconName: 'Globe',
    detail: 'We track macro-democratic trends, regional election tribunals, and comparative electoral administration across West Africa.',
    cardBgType: 'gradient',
    cardBgSolid: '#374151',
    cardBgGradFrom: '#4B5563',
    cardBgGradTo: '#111827',
    titleFontSize: 'text-xs',
    titleFontFamily: 'font-mono',
    titleColor: '#F3F4F6',
    valueFontSize: 'text-3xl sm:text-4xl',
    valueFontFamily: 'font-display',
    valueColor: '#FFFFFF'
  }
];

interface CMSContextType {
  reports: Report[];
  diaryNat: DiaryItem[];
  diaryLoc: DiaryItem[];
  diaryAfr: DiaryItem[];
  diaryOth: DiaryItem[];
  events: EventItem[];
  team: TeamMember[];
  weekly: WeeklyIssue[];
  heroConfig: HeroConfig;
  statsConfig: StatItemConfig[];
  
  // Update/Add/Delete handlers
  saveReport: (report: Report) => void;
  deleteReport: (id: string) => void;
  
  saveDiaryItem: (category: 'national' | 'local' | 'africa' | 'other', item: DiaryItem) => void;
  deleteDiaryItem: (category: 'national' | 'local' | 'africa' | 'other', id: string) => void;
  
  saveEvent: (event: EventItem) => void;
  deleteEvent: (id: string) => void;
  
  saveTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (id: string) => void;
  
  saveWeeklyIssue: (issue: WeeklyIssue) => void;
  deleteWeeklyIssue: (id: string) => void;
  
  saveHeroConfig: (config: HeroConfig) => void;
  saveStatsConfig: (config: StatItemConfig[]) => void;

  resetAllData: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('aeo_reports');
    return saved ? JSON.parse(saved) : initialReports;
  });

  const [diaryNat, setDiaryNat] = useState<DiaryItem[]>(() => {
    const saved = localStorage.getItem('aeo_diary_nat');
    return saved ? JSON.parse(saved) : initialDiaryNat;
  });

  const [diaryLoc, setDiaryLoc] = useState<DiaryItem[]>(() => {
    const saved = localStorage.getItem('aeo_diary_loc');
    return saved ? JSON.parse(saved) : initialDiaryLoc;
  });

  const [diaryAfr, setDiaryAfr] = useState<DiaryItem[]>(() => {
    const saved = localStorage.getItem('aeo_diary_afr');
    return saved ? JSON.parse(saved) : initialDiaryAfr;
  });

  const [diaryOth, setDiaryOth] = useState<DiaryItem[]>(() => {
    const saved = localStorage.getItem('aeo_diary_oth');
    return saved ? JSON.parse(saved) : initialDiaryOth;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('aeo_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('aeo_team');
    return saved ? JSON.parse(saved) : initialTeam;
  });

  const [weekly, setWeekly] = useState<WeeklyIssue[]>(() => {
    const saved = localStorage.getItem('aeo_weekly');
    return saved ? JSON.parse(saved) : initialWeekly;
  });

  const [heroConfig, setHeroConfig] = useState<HeroConfig>(() => {
    const saved = localStorage.getItem('aeo_hero');
    return saved ? JSON.parse(saved) : INITIAL_HERO_CONFIG;
  });

  const [statsConfig, setStatsConfig] = useState<StatItemConfig[]>(() => {
    const saved = localStorage.getItem('aeo_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS_CONFIG;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('aeo_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('aeo_hero', JSON.stringify(heroConfig));
  }, [heroConfig]);

  useEffect(() => {
    localStorage.setItem('aeo_stats', JSON.stringify(statsConfig));
  }, [statsConfig]);

  useEffect(() => {
    localStorage.setItem('aeo_diary_nat', JSON.stringify(diaryNat));
  }, [diaryNat]);

  useEffect(() => {
    localStorage.setItem('aeo_diary_loc', JSON.stringify(diaryLoc));
  }, [diaryLoc]);

  useEffect(() => {
    localStorage.setItem('aeo_diary_afr', JSON.stringify(diaryAfr));
  }, [diaryAfr]);

  useEffect(() => {
    localStorage.setItem('aeo_diary_oth', JSON.stringify(diaryOth));
  }, [diaryOth]);

  useEffect(() => {
    localStorage.setItem('aeo_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('aeo_team', JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem('aeo_weekly', JSON.stringify(weekly));
  }, [weekly]);

  // Handler Actions
  const saveReport = (report: Report) => {
    setReports(prev => {
      const exists = prev.some(r => r.id === report.id);
      if (exists) {
        return prev.map(r => r.id === report.id ? report : r);
      }
      return [...prev, report];
    });
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const saveDiaryItem = (category: 'national' | 'local' | 'africa' | 'other', item: DiaryItem) => {
    const setter = (prev: DiaryItem[]) => {
      const exists = prev.some(d => d.id === item.id);
      if (exists) {
        return prev.map(d => d.id === item.id ? item : d);
      }
      return [...prev, item];
    };

    if (category === 'national') setDiaryNat(setter);
    else if (category === 'local') setDiaryLoc(setter);
    else if (category === 'africa') setDiaryAfr(setter);
    else if (category === 'other') setDiaryOth(setter);
  };

  const deleteDiaryItem = (category: 'national' | 'local' | 'africa' | 'other', id: string) => {
    const filterFn = (prev: DiaryItem[]) => prev.filter(d => d.id !== id);
    if (category === 'national') setDiaryNat(filterFn);
    else if (category === 'local') setDiaryLoc(filterFn);
    else if (category === 'africa') setDiaryAfr(filterFn);
    else if (category === 'other') setDiaryOth(filterFn);
  };

  const saveEvent = (event: EventItem) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === event.id);
      if (exists) {
        return prev.map(e => e.id === event.id ? event : e);
      }
      return [...prev, event];
    });
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const saveTeamMember = (member: TeamMember) => {
    setTeam(prev => {
      const exists = prev.some(t => t.id === member.id);
      if (exists) {
        return prev.map(t => t.id === member.id ? member : t);
      }
      return [...prev, member];
    });
  };

  const deleteTeamMember = (id: string) => {
    setTeam(prev => prev.filter(t => t.id !== id));
  };

  const saveWeeklyIssue = (issue: WeeklyIssue) => {
    setWeekly(prev => {
      const exists = prev.some(w => w.id === issue.id);
      if (exists) {
        return prev.map(w => w.id === issue.id ? issue : w);
      }
      return [...prev, issue];
    });
  };

  const deleteWeeklyIssue = (id: string) => {
    setWeekly(prev => prev.filter(w => w.id !== id));
  };

  const saveHeroConfig = (config: HeroConfig) => {
    setHeroConfig(config);
  };

  const saveStatsConfig = (config: StatItemConfig[]) => {
    setStatsConfig(config);
  };

  const resetAllData = () => {
    localStorage.removeItem('aeo_reports');
    localStorage.removeItem('aeo_diary_nat');
    localStorage.removeItem('aeo_diary_loc');
    localStorage.removeItem('aeo_diary_afr');
    localStorage.removeItem('aeo_diary_oth');
    localStorage.removeItem('aeo_events');
    localStorage.removeItem('aeo_team');
    localStorage.removeItem('aeo_weekly');
    localStorage.removeItem('aeo_hero');
    localStorage.removeItem('aeo_stats');
    
    setReports(initialReports);
    setDiaryNat(initialDiaryNat);
    setDiaryLoc(initialDiaryLoc);
    setDiaryAfr(initialDiaryAfr);
    setDiaryOth(initialDiaryOth);
    setEvents(initialEvents);
    setTeam(initialTeam);
    setWeekly(initialWeekly);
    setHeroConfig(INITIAL_HERO_CONFIG);
    setStatsConfig(INITIAL_STATS_CONFIG);
  };

  return (
    <CMSContext.Provider value={{
      reports,
      diaryNat,
      diaryLoc,
      diaryAfr,
      diaryOth,
      events,
      team,
      weekly,
      heroConfig,
      statsConfig,
      saveReport,
      deleteReport,
      saveDiaryItem,
      deleteDiaryItem,
      saveEvent,
      deleteEvent,
      saveTeamMember,
      deleteTeamMember,
      saveWeeklyIssue,
      deleteWeeklyIssue,
      saveHeroConfig,
      saveStatsConfig,
      resetAllData
    }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
