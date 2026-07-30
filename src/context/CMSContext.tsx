import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
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
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { sanitizeAndSyncItems, loadAssetFromFirestore, saveAssetToFirestore } from '../lib/firebaseAssets';

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

// Helper to merge local items and remote items so user uploads (PDFs, images, synopses) are never wiped or overwritten
function mergeCollection<T extends { id: string; pdfUrl?: string; image?: string; summary?: string; title?: string; sections?: any }>(
  localItems: T[],
  remoteItems: T[]
): T[] {
  if (!remoteItems || !Array.isArray(remoteItems)) return localItems || [];
  if (!localItems || !Array.isArray(localItems) || localItems.length === 0) return remoteItems;

  const remoteMap = new Map(remoteItems.map(item => [item.id, item]));
  const merged: T[] = [];

  for (const remoteItem of remoteItems) {
    const localMatch = localItems.find(l => l.id === remoteItem.id);
    if (localMatch) {
      // Determine effective PDF URL (prefer actual base64 or HTTP URL over reference placeholders)
      const effectivePdfUrl = (localMatch.pdfUrl && localMatch.pdfUrl.length > 20 && !localMatch.pdfUrl.startsWith('ref:'))
        ? localMatch.pdfUrl
        : ((remoteItem.pdfUrl && !remoteItem.pdfUrl.startsWith('ref:')) ? remoteItem.pdfUrl : (localMatch.pdfUrl || ''));

      // Determine effective Image
      const effectiveImage = (localMatch.image && localMatch.image.length > 20 && !localMatch.image.startsWith('ref:'))
        ? localMatch.image
        : ((remoteItem.image && !remoteItem.image.startsWith('ref:')) ? remoteItem.image : (localMatch.image || ''));

      // Determine effective Summary / Synopsis (keep local if non-empty and at least as long as remote)
      const localSum = (localMatch.summary || '').trim();
      const remoteSum = (remoteItem.summary || '').trim();
      const effectiveSummary = (localSum.length >= remoteSum.length && localSum.length > 0)
        ? localMatch.summary
        : (remoteItem.summary || '');

      const effectiveTitle = (localMatch.title && localMatch.title.trim() !== '')
        ? localMatch.title
        : (remoteItem.title || '');

      const effectiveSections = (localMatch.sections && Array.isArray(localMatch.sections) && localMatch.sections.length > 0)
        ? localMatch.sections
        : (remoteItem.sections || []);

      merged.push({
        ...remoteItem,
        ...localMatch,
        title: effectiveTitle,
        summary: effectiveSummary,
        pdfUrl: effectivePdfUrl,
        image: effectiveImage,
        sections: effectiveSections,
      });
    } else {
      merged.push(remoteItem);
    }
  }

  // Include any local items that don't exist in remote at all (e.g. newly created user documents)
  for (const localItem of localItems) {
    if (!remoteMap.has(localItem.id)) {
      merged.push(localItem);
    }
  }

  return merged;
}

// Helper to save Firestore document cleanly with asset chunking
const syncToFirestore = async (docName: string, data: any) => {
  try {
    if (data && Array.isArray(data.items)) {
      await sanitizeAndSyncItems(docName, data.items);
    } else {
      await setDoc(doc(db, 'cms', docName), data);
    }
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

  // 0. Load data asynchronously from IndexedDB on mount if available
  useEffect(() => {
    const loadIndexedDBData = async () => {
      try {
        const savedReports = await getItem<Report[]>('aeo_reports');
        if (savedReports && savedReports.length > 0) {
          setReports(prev => mergeCollection(prev, savedReports));
        }

        const savedDiaryNat = await getItem<DiaryItem[]>('aeo_diary_nat');
        if (savedDiaryNat && savedDiaryNat.length > 0) {
          setDiaryNat(prev => mergeCollection(prev, savedDiaryNat));
        }

        const savedDiaryLoc = await getItem<DiaryItem[]>('aeo_diary_loc');
        if (savedDiaryLoc && savedDiaryLoc.length > 0) {
          setDiaryLoc(prev => mergeCollection(prev, savedDiaryLoc));
        }

        const savedDiaryAfr = await getItem<DiaryItem[]>('aeo_diary_afr');
        if (savedDiaryAfr && savedDiaryAfr.length > 0) {
          setDiaryAfr(prev => mergeCollection(prev, savedDiaryAfr));
        }

        const savedDiaryOth = await getItem<DiaryItem[]>('aeo_diary_oth');
        if (savedDiaryOth && savedDiaryOth.length > 0) {
          setDiaryOth(prev => mergeCollection(prev, savedDiaryOth));
        }

        const savedEvents = await getItem<EventItem[]>('aeo_events');
        if (savedEvents && savedEvents.length > 0) {
          setEvents(prev => mergeCollection(prev, savedEvents));
        }

        const savedAnnouncements = await getItem<AnnouncementItem[]>('aeo_announcements');
        if (savedAnnouncements && savedAnnouncements.length > 0) {
          setAnnouncements(prev => mergeCollection(prev, savedAnnouncements));
        }

        const savedTeam = await getItem<TeamMember[]>('aeo_team');
        if (savedTeam && savedTeam.length > 0) {
          setTeam(prev => mergeCollection(prev, savedTeam));
        }

        const savedWeekly = await getItem<WeeklyIssue[]>('aeo_weekly');
        if (savedWeekly && savedWeekly.length > 0) {
          setWeekly(prev => mergeCollection(prev, savedWeekly));
        }

        const savedHero = await getItem<HeroConfig>('aeo_hero');
        if (savedHero) setHeroConfig(savedHero);

        const savedStats = await getItem<StatItemConfig[]>('aeo_stats');
        if (savedStats && savedStats.length > 0) setStatsConfig(savedStats);
      } catch (err) {
        console.warn('IndexedDB load error:', err);
      }
    };
    loadIndexedDBData();
  }, []);

  // 1. Subscribe to Firestore in Real-Time for global site sync with auto-seeding
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    const subscribeAndSeed = <T,>(
      docName: string, 
      setter: Dispatch<SetStateAction<T>>, 
      transform?: (data: T) => T
    ) => {
      const docRef = doc(db, 'cms', docName);
      return onSnapshot(docRef, snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && (data.items !== undefined || data.config !== undefined)) {
            const raw = data.items !== undefined ? data.items : data.config;
            const finalVal = transform ? transform(raw as T) : (raw as T);
            if (Array.isArray(finalVal)) {
              setter(localVal => mergeCollection(localVal as any, finalVal as any) as unknown as T);
            } else {
              setter(finalVal);
            }
          }
        } else {
          // Document doesn't exist in Firestore yet -> seed Firestore with current local state (from localStorage/IndexedDB)!
          setter(currentState => {
            const payload = docName === 'hero' ? { config: currentState } : { items: currentState };
            setDoc(docRef, payload).catch(err => console.error(`Error seeding ${docName} to Firestore:`, err));
            return currentState;
          });
        }
      }, err => {
        console.warn(`Firestore snapshot error for ${docName}:`, err);
      });
    };

    unsubscribes.push(subscribeAndSeed('reports', setReports));
    unsubscribes.push(subscribeAndSeed('diary_nat', setDiaryNat));
    unsubscribes.push(subscribeAndSeed('diary_loc', setDiaryLoc));
    unsubscribes.push(subscribeAndSeed('diary_afr', setDiaryAfr));
    unsubscribes.push(subscribeAndSeed('diary_oth', setDiaryOth));
    unsubscribes.push(subscribeAndSeed('events', setEvents));
    unsubscribes.push(subscribeAndSeed('announcements', setAnnouncements));
    unsubscribes.push(subscribeAndSeed('team', setTeam));
    unsubscribes.push(subscribeAndSeed('weekly', setWeekly));
    unsubscribes.push(subscribeAndSeed('hero', setHeroConfig, (cfg: HeroConfig) => {
      if (cfg.spotlightStatusText === 'Off-Cycle') cfg.spotlightStatusText = 'IREV Data';
      if (cfg.registeredVoters === '1,955,657 voters' || cfg.registeredVoters === '1,955,657') {
        cfg.registeredVoters = '2,339,233 voters';
      }
      return cfg;
    }));
    unsubscribes.push(subscribeAndSeed('stats', setStatsConfig));

    setDataLoaded(true);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
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

  // Auto-sync current local state to Firestore on boot to ensure remote database has latest sanitized content
  useEffect(() => {
    if (!dataLoaded) return;
    if (reports.length > 0) syncToFirestore('reports', { items: reports });
    if (weekly.length > 0) syncToFirestore('weekly', { items: weekly });
    if (announcements.length > 0) syncToFirestore('announcements', { items: announcements });
    if (events.length > 0) syncToFirestore('events', { items: events });
    if (team.length > 0) syncToFirestore('team', { items: team });
  }, [dataLoaded]);

  // Sync individual PDF and Image documents from Firestore if main array included reference placeholders or empty asset fields
  useEffect(() => {
    let cancelled = false;

    const hydrateAssets = async () => {
      // Hydrate Reports
      for (const r of reports) {
        if (cancelled) return;
        if (r.id && (!r.pdfUrl || r.pdfUrl.startsWith('ref:'))) {
          const fullPdf = await loadAssetFromFirestore('pdf', r.id);
          if (fullPdf && !cancelled) {
            setReports(prev => prev.map(item => item.id === r.id ? { ...item, pdfUrl: fullPdf } : item));
          }
        }
        if (r.id && (!r.image || r.image.startsWith('ref:'))) {
          const fullImg = await loadAssetFromFirestore('img', r.id);
          if (fullImg && !cancelled) {
            setReports(prev => prev.map(item => item.id === r.id ? { ...item, image: fullImg } : item));
          }
        }
      }

      // Hydrate Weekly Issues
      for (const w of weekly) {
        if (cancelled) return;
        if (w.id && (!w.pdfUrl || w.pdfUrl.startsWith('ref:'))) {
          const fullPdf = await loadAssetFromFirestore('pdf', w.id);
          if (fullPdf && !cancelled) {
            setWeekly(prev => prev.map(item => item.id === w.id ? { ...item, pdfUrl: fullPdf } : item));
          }
        }
        if (w.id && (!w.image || w.image.startsWith('ref:'))) {
          const fullImg = await loadAssetFromFirestore('img', w.id);
          if (fullImg && !cancelled) {
            setWeekly(prev => prev.map(item => item.id === w.id ? { ...item, image: fullImg } : item));
          }
        }
      }

      // Hydrate Announcements
      for (const a of announcements) {
        if (cancelled) return;
        if (a.id && (!a.pdfUrl || a.pdfUrl.startsWith('ref:'))) {
          const fullPdf = await loadAssetFromFirestore('pdf', a.id);
          if (fullPdf && !cancelled) {
            setAnnouncements(prev => prev.map(item => item.id === a.id ? { ...item, pdfUrl: fullPdf } : item));
          }
        }
        if (a.id && (!a.image || a.image.startsWith('ref:'))) {
          const fullImg = await loadAssetFromFirestore('img', a.id);
          if (fullImg && !cancelled) {
            setAnnouncements(prev => prev.map(item => item.id === a.id ? { ...item, image: fullImg } : item));
          }
        }
      }
    };

    hydrateAssets();

    return () => {
      cancelled = true;
    };
  }, [
    reports.map(r => r.id + (r.pdfUrl ? r.pdfUrl.substring(0, 8) : '') + (r.image ? r.image.substring(0, 8) : '')).join(','),
    weekly.map(w => w.id + (w.pdfUrl ? w.pdfUrl.substring(0, 8) : '') + (w.image ? w.image.substring(0, 8) : '')).join(','),
    announcements.map(a => a.id + (a.pdfUrl ? a.pdfUrl.substring(0, 8) : '') + (a.image ? a.image.substring(0, 8) : '')).join(',')
  ]);

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
