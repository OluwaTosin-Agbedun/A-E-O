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
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { sanitizeAndSyncItems, loadAssetFromFirestore, saveAssetToFirestore } from '../lib/firebaseAssets';
import { sortItemsByDate } from '../utils/date';
import { generateSlug } from '../utils/url';

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

// Helper to apply remote collection updates from Firestore as authoritative source of truth,
// while preserving in-memory base64 PDF/image data for items referencing asset docs until hydration completes.
function applyRemoteCollection<T extends { id: string; pdfUrl?: string; image?: string; date?: string; title?: string }>(
  localItems: T[],
  remoteItems: T[]
): T[] {
  if (!remoteItems || !Array.isArray(remoteItems)) return localItems || [];

  const localMap = new Map((localItems || []).map(item => [item.id, item]));

  const merged = remoteItems.map(remoteItem => {
    const localMatch = localMap.get(remoteItem.id);
    const itemCopy = { ...remoteItem } as any;

    if (itemCopy.title && !itemCopy.slug) {
      itemCopy.slug = generateSlug(itemCopy.title);
    }

    // If remote has a reference string like ref:pdf_123, check if local state already has the resolved Base64/URL
    if (itemCopy.pdfUrl && itemCopy.pdfUrl.startsWith('ref:')) {
      if (localMatch && localMatch.pdfUrl && !localMatch.pdfUrl.startsWith('ref:')) {
        itemCopy.pdfUrl = localMatch.pdfUrl;
      }
    }

    // If remote has a reference string like ref:img_123, check if local state already has the resolved Base64/URL
    if (itemCopy.image && itemCopy.image.startsWith('ref:')) {
      if (localMatch && localMatch.image && !localMatch.image.startsWith('ref:')) {
        itemCopy.image = localMatch.image;
      }
    }

    return itemCopy as T;
  });

  return sortItemsByDate(merged, 'date', 'desc');
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
  const [reports, setReports] = useState<Report[]>([]);
  const [diaryNat, setDiaryNat] = useState<DiaryItem[]>([]);
  const [diaryLoc, setDiaryLoc] = useState<DiaryItem[]>([]);
  const [diaryAfr, setDiaryAfr] = useState<DiaryItem[]>([]);
  const [diaryOth, setDiaryOth] = useState<DiaryItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [weekly, setWeekly] = useState<WeeklyIssue[]>([]);
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(INITIAL_HERO_CONFIG);
  const [statsConfig, setStatsConfig] = useState<StatItemConfig[]>(INITIAL_STATS_CONFIG);

  // Subscribe to Firestore in Real-Time for global site sync without automatic default seeding
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];
    let loadedCount = 0;
    const totalDocs = 11;

    const MOCK_IDS = new Set([
      'anambra', 'imo', 'tech', 'kaduna-security', 'hospitals-reform',
      'wk-1', 'wk-2', 'wk-3',
      'ann-1', 'ann-2',
      'w-1', 'w-2', 'w-3',
      'a-1', 'a-2',
      'nasarawa-governance', 'plat-security', 'kano-security', 'benue-security', 'adamawa-security', 'taraba-security'
    ]);

    const subscribeAndSeed = <T,>(
      docName: string, 
      setter: Dispatch<SetStateAction<T>>, 
      fallbackVal: T,
      transform?: (data: T) => T
    ) => {
      const docRef = doc(db, 'cms', docName);
      let isFirst = true;
      return onSnapshot(docRef, snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && (data.items !== undefined || data.config !== undefined)) {
            let raw = data.items !== undefined ? data.items : data.config;

            if (Array.isArray(raw)) {
              raw = raw.filter((item: any) => item && item.id && !MOCK_IDS.has(item.id));
            }

            const finalVal = transform ? transform(raw as T) : (raw as T);
            if (Array.isArray(finalVal)) {
              setter(localVal => applyRemoteCollection(localVal as any, finalVal as any) as unknown as T);
            } else {
              setter(finalVal);
            }
          } else {
            setter(fallbackVal);
          }
        } else {
          // Document doesn't exist in Firestore -> default to fallback locally
          setter(fallbackVal);
        }
        
        if (isFirst) {
          isFirst = false;
          loadedCount++;
          if (loadedCount >= totalDocs) {
            setDataLoaded(true);
          }
        }
      }, err => {
        console.warn(`Firestore snapshot error for ${docName}:`, err);
        setter(fallbackVal);
        if (isFirst) {
          isFirst = false;
          loadedCount++;
          if (loadedCount >= totalDocs) {
            setDataLoaded(true);
          }
        }
      });
    };

    unsubscribes.push(subscribeAndSeed('reports', setReports, []));
    unsubscribes.push(subscribeAndSeed('diary_nat', setDiaryNat, initialDiaryNat));
    unsubscribes.push(subscribeAndSeed('diary_loc', setDiaryLoc, initialDiaryLoc));
    unsubscribes.push(subscribeAndSeed('diary_afr', setDiaryAfr, initialDiaryAfr));
    unsubscribes.push(subscribeAndSeed('diary_oth', setDiaryOth, initialDiaryOth));
    unsubscribes.push(subscribeAndSeed('events', setEvents, []));
    unsubscribes.push(subscribeAndSeed('announcements', setAnnouncements, []));
    unsubscribes.push(subscribeAndSeed('team', setTeam, []));
    unsubscribes.push(subscribeAndSeed('weekly', setWeekly, []));
    unsubscribes.push(subscribeAndSeed('hero', setHeroConfig, INITIAL_HERO_CONFIG, (cfg: HeroConfig) => {
      if (cfg.spotlightStatusText === 'Off-Cycle') cfg.spotlightStatusText = 'IREV Data';
      if (cfg.registeredVoters === '1,955,657 voters' || cfg.registeredVoters === '1,955,657') {
        cfg.registeredVoters = '2,339,233 voters';
      }
      return cfg;
    }));
    unsubscribes.push(subscribeAndSeed('stats', setStatsConfig, INITIAL_STATS_CONFIG));

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

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
      const reportWithSlug: Report = {
        ...report,
        slug: report.slug ? generateSlug(report.slug) : generateSlug(report.title),
        createdAt: report.createdAt || Date.now()
      };
      const unsorted = exists 
        ? prev.map(r => r.id === report.id ? reportWithSlug : r) 
        : [reportWithSlug, ...prev];
      const next = sortItemsByDate(unsorted, 'date', 'desc');
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
      const unsorted = exists ? prev.map(d => d.id === item.id ? item : d) : [...prev, item];
      const next = sortItemsByDate(unsorted, 'date', 'asc');
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

    setDiaryNat(prev => filterAndSync(prev, 'diary_nat'));
    setDiaryLoc(prev => filterAndSync(prev, 'diary_loc'));
    setDiaryAfr(prev => filterAndSync(prev, 'diary_afr'));
    setDiaryOth(prev => filterAndSync(prev, 'diary_oth'));
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
      const annWithSlug: AnnouncementItem = {
        ...announcement,
        slug: announcement.slug ? generateSlug(announcement.slug) : generateSlug(announcement.title),
        createdAt: announcement.createdAt || Date.now()
      };
      const unsorted = exists 
        ? prev.map(a => a.id === announcement.id ? annWithSlug : a) 
        : [annWithSlug, ...prev];
      const next = sortItemsByDate(unsorted, 'date', 'desc');
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
      const issueWithSlug: WeeklyIssue = {
        ...issue,
        slug: issue.slug ? generateSlug(issue.slug) : generateSlug(issue.title),
        createdAt: issue.createdAt || Date.now()
      };
      const unsorted = exists 
        ? prev.map(w => w.id === issue.id ? issueWithSlug : w) 
        : [issueWithSlug, ...prev];
      const next = sortItemsByDate(unsorted, 'date', 'desc');
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

  const resetAllData = async () => {
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

    await syncToFirestore('reports', { items: initialReports });
    await syncToFirestore('diary_nat', { items: initialDiaryNat });
    await syncToFirestore('diary_loc', { items: initialDiaryLoc });
    await syncToFirestore('diary_afr', { items: initialDiaryAfr });
    await syncToFirestore('diary_oth', { items: initialDiaryOth });
    await syncToFirestore('events', { items: initialEvents });
    await syncToFirestore('announcements', { items: initialAnnouncements });
    await syncToFirestore('team', { items: initialTeam });
    await syncToFirestore('weekly', { items: initialWeekly });
    await syncToFirestore('hero', { config: INITIAL_HERO_CONFIG });
    await syncToFirestore('stats', { items: INITIAL_STATS_CONFIG });
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
