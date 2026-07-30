import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Report, DiaryItem, EventItem, TeamMember, WeeklyIssue, HeroConfig, StatItemConfig, AnnouncementItem } from '../types';
import { 
  REPORTS as initialReports, 
  DIARY_NATIONAL as initialDiaryNat, 
  DIARY_LOCAL as initialDiaryLoc, 
  DIARY_AFRICA as initialDiaryAfr, 
  DIARY_OTHER as initialDiaryOth, 
  EVENTS as initialEvents, 
  TEAM as initialTeam, 
  WEEKLY_ISSUES as initialWeekly,
  ANNOUNCEMENTS as initialAnnouncements
} from '../data';
import { getItem, setItem, clearDB } from '../utils/db';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const INITIAL_HERO_CONFIG: HeroConfig = {
  badgeText: "Independent · Non-partisan · Evidence-based",
  title: "Monitoring election integrity across {Nigeria & Africa}.",
  description: "We observe, audit and report on electoral processes — anchored to primary documents and verifiable data, never to rumour. From live monitoring to forensic post-election analysis.",
  exploreButtonText: "Explore the EHII Index",
  auditButtonText: "Audit Reports",
  spotlightBadgeText: "Next election in view",
  spotlightStatusText: "IREV Data",
  spotlightTitle: "Osun State Governorship",
  spotlightDateText: "Saturday, 15 August 2026 · INEC Monitored",
  spotlightTargetDate: "2026-08-15T08:00:00+01:00",
  lgasCount: "30 LGAs + Area Office",
  registeredVoters: "2,339,233 voters",
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
  announcements: AnnouncementItem[];
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

  saveAnnouncement: (announcement: AnnouncementItem) => void;
  deleteAnnouncement: (id: string) => void;
  
  saveTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (id: string) => void;
  
  saveWeeklyIssue: (issue: WeeklyIssue) => void;
  deleteWeeklyIssue: (id: string) => void;
  
  saveHeroConfig: (config: HeroConfig) => void;
  saveStatsConfig: (config: StatItemConfig[]) => void;

  resetAllData: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

// Helper to save Firestore document
const syncToFirestore = async (docName: string, data: any) => {
  try {
    await setDoc(doc(db, 'cms', docName), data);
  } catch (err) {
    console.error(`Error syncing ${docName} to Firestore:`, err);
  }
};

export function CMSProvider({ children }: { children: ReactNode }) {
  const [dataLoaded, setDataLoaded] = useState(false);
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

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    const saved = localStorage.getItem('aeo_announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
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
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.spotlightStatusText === 'Off-Cycle') {
        parsed.spotlightStatusText = 'IREV Data';
      }
      if (parsed.registeredVoters === '1,955,657 voters' || parsed.registeredVoters === '1,955,657') {
        parsed.registeredVoters = '2,339,233 voters';
      }
      return parsed;
    }
    return INITIAL_HERO_CONFIG;
  });

  const [statsConfig, setStatsConfig] = useState<StatItemConfig[]>(() => {
    const saved = localStorage.getItem('aeo_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS_CONFIG;
  });

  // 1. Subscribe to Firestore in Real-Time for global site sync
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    // Reports
    unsubscribes.push(onSnapshot(doc(db, 'cms', 'reports'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items) setReports(data.items);
      }
    }));

    // Diary National
    unsubscribes.push(onSnapshot(doc(db, 'cms', 'diary_nat'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items) setDiaryNat(data.items);
      }
    }));

    // Diary Local
    unsubscribes.push(onSnapshot(doc(db, 'cms', 'diary_loc'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items) setDiaryLoc(data.items);
      }
    }));

    // Diary Africa
    unsubscribes.push(onSnapshot(doc(db, 'cms', 'diary_afr'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items) setDiaryAfr(data.items);
      }
    }));

    // Diary Other
    unsubscribes.push(onSnapshot(doc(db, 'cms', 'diary_oth'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items) setDiaryOth(data.items);
      }
    }));

    // Events
    unsubscribes.push(onSnapshot(doc(db, 'cms', 'events'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items) setEvents(data.items);
      }
    }));

    // Announcements
    unsubscribes.push(onSnapshot(doc(db, 'cms', 'announcements'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items) setAnnouncements(data.items);
      }
    }));

    // Team
    unsubscribes.push(onSnapshot(doc(db, 'cms', 'team'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items) setTeam(data.items);
      }
    }));

    // Weekly
    unsubscribes.push(onSnapshot(doc(db, 'cms', 'weekly'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items) setWeekly(data.items);
      }
    }));

    // Hero
    unsubscribes.push(onSnapshot(doc(db, 'cms', 'hero'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.config) setHeroConfig(data.config);
      }
    }));

    // Stats
    unsubscribes.push(onSnapshot(doc(db, 'cms', 'stats'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items) setStatsConfig(data.items);
      }
    }));

    setDataLoaded(true);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Load data asynchronously from IndexedDB on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const savedReports = await getItem<Report[]>('aeo_reports');
        if (savedReports) setReports(savedReports);

        const savedDiaryNat = await getItem<DiaryItem[]>('aeo_diary_nat');
        if (savedDiaryNat) setDiaryNat(savedDiaryNat);

        const savedDiaryLoc = await getItem<DiaryItem[]>('aeo_diary_loc');
        if (savedDiaryLoc) setDiaryLoc(savedDiaryLoc);

        const savedDiaryAfr = await getItem<DiaryItem[]>('aeo_diary_afr');
        if (savedDiaryAfr) setDiaryAfr(savedDiaryAfr);

        const savedDiaryOth = await getItem<DiaryItem[]>('aeo_diary_oth');
        if (savedDiaryOth) setDiaryOth(savedDiaryOth);

        const savedEvents = await getItem<EventItem[]>('aeo_events');
        if (savedEvents) setEvents(savedEvents);

        const savedAnnouncements = await getItem<AnnouncementItem[]>('aeo_announcements');
        if (savedAnnouncements) setAnnouncements(savedAnnouncements);

        const savedTeam = await getItem<TeamMember[]>('aeo_team');
        if (savedTeam) setTeam(savedTeam);

        const savedWeekly = await getItem<WeeklyIssue[]>('aeo_weekly');
        if (savedWeekly) setWeekly(savedWeekly);

        const savedHero = await getItem<HeroConfig>('aeo_hero');
        if (savedHero) {
          if (savedHero.spotlightStatusText === 'Off-Cycle') {
            savedHero.spotlightStatusText = 'IREV Data';
          }
          if (savedHero.registeredVoters === '1,955,657 voters' || savedHero.registeredVoters === '1,955,657') {
            savedHero.registeredVoters = '2,339,233 voters';
          }
          setHeroConfig(savedHero);
        }

        const savedStats = await getItem<StatItemConfig[]>('aeo_stats');
        if (savedStats) setStatsConfig(savedStats);
      } catch (err) {
        console.error('Error loading initial data from IndexedDB:', err);
      } finally {
        setDataLoaded(true);
      }
    };
    loadAllData();
  }, []);

  // Sync to Storage (IndexedDB + fallback to localStorage)
  useEffect(() => {
    if (!dataLoaded) return;
    setItem('aeo_reports', reports).catch(e => console.error('IndexedDB reports error:', e));
    try {
      localStorage.setItem('aeo_reports', JSON.stringify(reports));
    } catch (e) {
      console.warn('aeo_reports localStorage failed (relying on IndexedDB):', e);
    }
  }, [reports, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    setItem('aeo_hero', heroConfig).catch(e => console.error('IndexedDB hero error:', e));
    try {
      localStorage.setItem('aeo_hero', JSON.stringify(heroConfig));
    } catch (e) {
      console.warn('aeo_hero localStorage failed:', e);
    }
  }, [heroConfig, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    setItem('aeo_stats', statsConfig).catch(e => console.error('IndexedDB stats error:', e));
    try {
      localStorage.setItem('aeo_stats', JSON.stringify(statsConfig));
    } catch (e) {
      console.warn('aeo_stats localStorage failed:', e);
    }
  }, [statsConfig, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    setItem('aeo_diary_nat', diaryNat).catch(e => console.error('IndexedDB diary_nat error:', e));
    try {
      localStorage.setItem('aeo_diary_nat', JSON.stringify(diaryNat));
    } catch (e) {
      console.warn('aeo_diary_nat localStorage failed:', e);
    }
  }, [diaryNat, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    setItem('aeo_diary_loc', diaryLoc).catch(e => console.error('IndexedDB diary_loc error:', e));
    try {
      localStorage.setItem('aeo_diary_loc', JSON.stringify(diaryLoc));
    } catch (e) {
      console.warn('aeo_diary_loc localStorage failed:', e);
    }
  }, [diaryLoc, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    setItem('aeo_diary_afr', diaryAfr).catch(e => console.error('IndexedDB diary_afr error:', e));
    try {
      localStorage.setItem('aeo_diary_afr', JSON.stringify(diaryAfr));
    } catch (e) {
      console.warn('aeo_diary_afr localStorage failed:', e);
    }
  }, [diaryAfr, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    setItem('aeo_diary_oth', diaryOth).catch(e => console.error('IndexedDB diary_oth error:', e));
    try {
      localStorage.setItem('aeo_diary_oth', JSON.stringify(diaryOth));
    } catch (e) {
      console.warn('aeo_diary_oth localStorage failed:', e);
    }
  }, [diaryOth, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    setItem('aeo_events', events).catch(e => console.error('IndexedDB events error:', e));
    try {
      localStorage.setItem('aeo_events', JSON.stringify(events));
    } catch (e) {
      console.warn('aeo_events localStorage failed:', e);
    }
  }, [events, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    setItem('aeo_announcements', announcements).catch(e => console.error('IndexedDB announcements error:', e));
    try {
      localStorage.setItem('aeo_announcements', JSON.stringify(announcements));
    } catch (e) {
      console.warn('aeo_announcements localStorage failed (relying on IndexedDB):', e);
    }
  }, [announcements, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    setItem('aeo_team', team).catch(e => console.error('IndexedDB team error:', e));
    try {
      localStorage.setItem('aeo_team', JSON.stringify(team));
    } catch (e) {
      console.warn('aeo_team localStorage failed:', e);
    }
  }, [team, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    setItem('aeo_weekly', weekly).catch(e => console.error('IndexedDB weekly error:', e));
    try {
      localStorage.setItem('aeo_weekly', JSON.stringify(weekly));
    } catch (e) {
      console.warn('aeo_weekly localStorage failed (relying on IndexedDB):', e);
    }
  }, [weekly, dataLoaded]);

  // Handler Actions
  const saveReport = (report: Report) => {
    setReports(prev => {
      const exists = prev.some(r => r.id === report.id);
      const next = exists ? prev.map(r => r.id === report.id ? report : r) : [...prev, report];
      syncToFirestore('reports', { items: next });
      return next;
    });
  };

  const deleteReport = (id: string) => {
    setReports(prev => {
      const next = prev.filter(r => r.id !== id);
      syncToFirestore('reports', { items: next });
      return next;
    });
  };

  const saveDiaryItem = (category: 'national' | 'local' | 'africa' | 'other', item: DiaryItem) => {
    const updateAndSync = (prev: DiaryItem[], docKey: string) => {
      const exists = prev.some(d => d.id === item.id);
      const next = exists ? prev.map(d => d.id === item.id ? item : d) : [...prev, item];
      syncToFirestore(docKey, { items: next });
      return next;
    };

    if (category === 'national') setDiaryNat(prev => updateAndSync(prev, 'diary_nat'));
    else if (category === 'local') setDiaryLoc(prev => updateAndSync(prev, 'diary_loc'));
    else if (category === 'africa') setDiaryAfr(prev => updateAndSync(prev, 'diary_afr'));
    else if (category === 'other') setDiaryOth(prev => updateAndSync(prev, 'diary_oth'));
  };

  const deleteDiaryItem = (category: 'national' | 'local' | 'africa' | 'other', id: string) => {
    const filterAndSync = (prev: DiaryItem[], docKey: string) => {
      const next = prev.filter(d => d.id !== id);
      syncToFirestore(docKey, { items: next });
      return next;
    };

    if (category === 'national') setDiaryNat(prev => filterAndSync(prev, 'diary_nat'));
    else if (category === 'local') setDiaryLoc(prev => filterAndSync(prev, 'diary_loc'));
    else if (category === 'africa') setDiaryAfr(prev => filterAndSync(prev, 'diary_afr'));
    else if (category === 'other') setDiaryOth(prev => filterAndSync(prev, 'diary_oth'));
  };

  const saveEvent = (event: EventItem) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === event.id);
      const next = exists ? prev.map(e => e.id === event.id ? event : e) : [...prev, event];
      syncToFirestore('events', { items: next });
      return next;
    });
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => {
      const next = prev.filter(e => e.id !== id);
      syncToFirestore('events', { items: next });
      return next;
    });
  };

  const saveAnnouncement = (announcement: AnnouncementItem) => {
    setAnnouncements(prev => {
      const exists = prev.some(a => a.id === announcement.id);
      const next = exists ? prev.map(a => a.id === announcement.id ? announcement : a) : [...prev, announcement];
      syncToFirestore('announcements', { items: next });
      return next;
    });
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => {
      const next = prev.filter(a => a.id !== id);
      syncToFirestore('announcements', { items: next });
      return next;
    });
  };

  const saveTeamMember = (member: TeamMember) => {
    setTeam(prev => {
      const exists = prev.some(t => t.id === member.id);
      const next = exists ? prev.map(t => t.id === member.id ? member : t) : [...prev, member];
      syncToFirestore('team', { items: next });
      return next;
    });
  };

  const deleteTeamMember = (id: string) => {
    setTeam(prev => {
      const next = prev.filter(t => t.id !== id);
      syncToFirestore('team', { items: next });
      return next;
    });
  };

  const saveWeeklyIssue = (issue: WeeklyIssue) => {
    setWeekly(prev => {
      const exists = prev.some(w => w.id === issue.id);
      const next = exists ? prev.map(w => w.id === issue.id ? issue : w) : [...prev, issue];
      syncToFirestore('weekly', { items: next });
      return next;
    });
  };

  const deleteWeeklyIssue = (id: string) => {
    setWeekly(prev => {
      const next = prev.filter(w => w.id !== id);
      syncToFirestore('weekly', { items: next });
      return next;
    });
  };

  const saveHeroConfig = (config: HeroConfig) => {
    setHeroConfig(config);
    syncToFirestore('hero', { config });
  };

  const saveStatsConfig = (config: StatItemConfig[]) => {
    setStatsConfig(config);
    syncToFirestore('stats', { items: config });
  };

  const resetAllData = () => {
    clearDB().catch(e => console.error('Failed to clear IndexedDB:', e));
    localStorage.removeItem('aeo_reports');
    localStorage.removeItem('aeo_diary_nat');
    localStorage.removeItem('aeo_diary_loc');
    localStorage.removeItem('aeo_diary_afr');
    localStorage.removeItem('aeo_diary_oth');
    localStorage.removeItem('aeo_events');
    localStorage.removeItem('aeo_announcements');
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
    setAnnouncements(initialAnnouncements);
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
      announcements,
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
      saveAnnouncement,
      deleteAnnouncement,
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
