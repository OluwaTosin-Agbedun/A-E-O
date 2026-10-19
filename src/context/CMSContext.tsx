import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
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
import { sanitizeAndSyncItems, loadAssetFromFirestore, removeUndefined } from '../lib/firebaseAssets';
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
  
  heroBgColor: "#1E3A5F",
  titleFontSize: "text-4xl sm:text-5xl lg:text-6xl",
  titleFontFamily: "font-display",
  titleColor: "#FFFFFF",
  titleHighlightFrom: "#93C5FD",
  titleHighlightTo: "#86EFAC",
  descriptionFontSize: "text-base sm:text-lg",
  descriptionFontFamily: "font-sans",
  descriptionColor: "#DBEAFE"
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
  dataLoaded: boolean;
  
  // Update/Add/Delete handlers
  saveReport: (report: Report) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  
  saveDiaryItem: (category: 'national' | 'local' | 'africa' | 'other', item: DiaryItem) => Promise<void>;
  deleteDiaryItem: (category: 'national' | 'local' | 'africa' | 'other', id: string) => Promise<void>;
  
  saveEvent: (event: EventItem) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  saveAnnouncement: (announcement: AnnouncementItem) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  
  saveTeamMember: (member: TeamMember) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  
  saveWeeklyIssue: (issue: WeeklyIssue) => Promise<void>;
  deleteWeeklyIssue: (id: string) => Promise<void>;
  
  saveHeroConfig: (config: HeroConfig) => Promise<void>;
  saveStatsConfig: (config: StatItemConfig[]) => Promise<void>;

  incrementPublicationStat: (type: 'report' | 'weekly' | 'announcement', id: string, statType: 'reads' | 'downloads') => Promise<void>;
  resetAllData: () => Promise<void>;
  restorePublicationsBackup: () => Promise<{ success: boolean; count: number }>;
  refreshData: () => Promise<void>;
  exportAllDataJson: () => string;
  importDataJson: (jsonStr: string) => Promise<{ success: boolean; message: string }>;
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

    if (itemCopy.pdfUrl && itemCopy.pdfUrl.startsWith('ref:')) {
      if (localMatch && localMatch.pdfUrl && !localMatch.pdfUrl.startsWith('ref:')) {
        itemCopy.pdfUrl = localMatch.pdfUrl;
      }
    }

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
    const cleaned = removeUndefined(data);
    if (cleaned && Array.isArray(cleaned.items)) {
      await sanitizeAndSyncItems(docName, cleaned.items);
    } else {
      await setDoc(doc(db, 'cms', docName), cleaned);
    }
  } catch (err) {
    console.error(`Error syncing ${docName} to Firestore:`, err);
  }
};

// Automatic multi-layer backup to protect against data wipe
const saveBackupSnapshot = async (
  currentReports: Report[],
  currentWeekly: WeeklyIssue[],
  currentAnnouncements: AnnouncementItem[]
) => {
  try {
    const payload = {
      reports: currentReports.map(r => ({
        ...r,
        pdfUrl: r.pdfUrl?.startsWith('data:') ? `ref:pdf_${r.id}` : r.pdfUrl,
        image: r.image?.startsWith('data:') ? `ref:img_${r.id}` : r.image
      })),
      weekly: currentWeekly.map(w => ({
        ...w,
        pdfUrl: w.pdfUrl?.startsWith('data:') ? `ref:pdf_${w.id}` : w.pdfUrl,
        image: w.image?.startsWith('data:') ? `ref:img_${w.id}` : w.image
      })),
      announcements: currentAnnouncements,
      backedUpAt: Date.now()
    };

    // 1. Cloud Firestore backup document
    await setDoc(doc(db, 'cms', 'publications_backup'), removeUndefined(payload));

    // 2. Browser LocalStorage backup
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('aeo_publications_backup', JSON.stringify(payload));
      } catch (e) {
        // LocalStorage quota might be small, ignore
      }
    }
  } catch (err) {
    console.warn('Backup snapshot error:', err);
  }
};

export function CMSProvider({ children }: { children: ReactNode }) {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [diaryNat, setDiaryNat] = useState<DiaryItem[]>(initialDiaryNat);
  const [diaryLoc, setDiaryLoc] = useState<DiaryItem[]>(initialDiaryLoc);
  const [diaryAfr, setDiaryAfr] = useState<DiaryItem[]>(initialDiaryAfr);
  const [diaryOth, setDiaryOth] = useState<DiaryItem[]>(initialDiaryOth);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [weekly, setWeekly] = useState<WeeklyIssue[]>(initialWeekly);
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(INITIAL_HERO_CONFIG);
  const [statsConfig, setStatsConfig] = useState<StatItemConfig[]>(INITIAL_STATS_CONFIG);

  // Subscribe to Firestore in Real-Time for global site sync with safe non-destructive read
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];
    let loadedCount = 0;
    const totalDocs = 11;

    const subscribeSafe = <T,>(
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
              raw = raw.filter((item: any) => item && item.id);
            }

            const finalVal = transform ? transform(raw as T) : (raw as T);
            if (Array.isArray(finalVal)) {
              setter(localVal => {
                // If remote has data, apply it. If remote has 0 items but local has items,
                // do not wipe unless explicitly confirmed.
                if (finalVal.length === 0 && Array.isArray(localVal) && localVal.length > 0) {
                  return localVal;
                }
                return applyRemoteCollection(localVal as any, finalVal as any) as unknown as T;
              });
            } else {
              setter(finalVal);
            }
          }
        } else {
          // Document does NOT exist in Firestore:
          // CRITICAL BUG FIX: NEVER write destructive empty defaults to Firestore during reads!
          setter(fallbackVal);
          // Only seed illustrative non-publication documents if completely missing
          if (docName !== 'reports' && docName !== 'weekly' && docName !== 'announcements') {
            syncToFirestore(docName, docName === 'hero' ? { config: fallbackVal } : { items: fallbackVal });
          }
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
        if (isFirst) {
          isFirst = false;
          loadedCount++;
          if (loadedCount >= totalDocs) {
            setDataLoaded(true);
          }
        }
      });
    };

    unsubscribes.push(subscribeSafe('reports', setReports, initialReports));
    unsubscribes.push(subscribeSafe('diary_nat', setDiaryNat, initialDiaryNat));
    unsubscribes.push(subscribeSafe('diary_loc', setDiaryLoc, initialDiaryLoc));
    unsubscribes.push(subscribeSafe('diary_afr', setDiaryAfr, initialDiaryAfr));
    unsubscribes.push(subscribeSafe('diary_oth', setDiaryOth, initialDiaryOth));
    unsubscribes.push(subscribeSafe('events', setEvents, initialEvents));
    unsubscribes.push(subscribeSafe('announcements', setAnnouncements, initialAnnouncements));
    unsubscribes.push(subscribeSafe('team', setTeam, initialTeam));
    unsubscribes.push(subscribeSafe('weekly', setWeekly, initialWeekly));
    unsubscribes.push(subscribeSafe('hero', setHeroConfig, INITIAL_HERO_CONFIG, (cfg: HeroConfig) => {
      if (cfg.spotlightStatusText === 'Off-Cycle') cfg.spotlightStatusText = 'IREV Data';
      if (cfg.registeredVoters === '1,955,657 voters' || cfg.registeredVoters === '1,955,657') {
        cfg.registeredVoters = '2,339,233 voters';
      }
      return cfg;
    }));
    unsubscribes.push(subscribeSafe('stats', setStatsConfig, INITIAL_STATS_CONFIG));

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Sync individual PDF and Image documents from Firestore if main array included reference placeholders
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

  // SAFE MUTATION HANDLERS: Always fetch authoritative cloud items first to prevent race-condition wipeouts

  const saveReport = async (report: Report) => {
    try {
      const docRef = doc(db, 'cms', 'reports');
      const docSnap = await getDoc(docRef);
      let currentItems: Report[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        currentItems = docSnap.data().items;
      } else {
        currentItems = reports;
      }

      const reportWithSlug: Report = {
        ...report,
        slug: report.slug ? generateSlug(report.slug) : generateSlug(report.title),
        createdAt: report.createdAt || Date.now()
      };

      const existsIndex = currentItems.findIndex(r => r.id === report.id);
      let updatedItems: Report[];
      if (existsIndex > -1) {
        updatedItems = [...currentItems];
        updatedItems[existsIndex] = reportWithSlug;
      } else {
        updatedItems = [reportWithSlug, ...currentItems];
      }

      const sorted = sortItemsByDate(updatedItems, 'date', 'desc');
      setReports(sorted);
      await syncToFirestore('reports', { items: sorted });
      await saveBackupSnapshot(sorted, weekly, announcements);
    } catch (err) {
      console.error('Error saving report:', err);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const docRef = doc(db, 'cms', 'reports');
      const docSnap = await getDoc(docRef);
      let currentItems: Report[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        currentItems = docSnap.data().items;
      } else {
        currentItems = reports;
      }

      const next = currentItems.filter(r => r.id !== id);
      setReports(next);
      await syncToFirestore('reports', { items: next });
      await saveBackupSnapshot(next, weekly, announcements);
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const saveWeeklyIssue = async (issue: WeeklyIssue) => {
    try {
      const docRef = doc(db, 'cms', 'weekly');
      const docSnap = await getDoc(docRef);
      let currentItems: WeeklyIssue[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        currentItems = docSnap.data().items;
      } else {
        currentItems = weekly;
      }

      const issueWithSlug: WeeklyIssue = {
        ...issue,
        slug: issue.slug ? generateSlug(issue.slug) : generateSlug(issue.title),
        createdAt: issue.createdAt || Date.now()
      };

      const existsIndex = currentItems.findIndex(w => w.id === issue.id);
      let updatedItems: WeeklyIssue[];
      if (existsIndex > -1) {
        updatedItems = [...currentItems];
        updatedItems[existsIndex] = issueWithSlug;
      } else {
        updatedItems = [issueWithSlug, ...currentItems];
      }

      const sorted = sortItemsByDate(updatedItems, 'date', 'desc');
      setWeekly(sorted);
      await syncToFirestore('weekly', { items: sorted });
      await saveBackupSnapshot(reports, sorted, announcements);
    } catch (err) {
      console.error('Error saving weekly issue:', err);
    }
  };

  const deleteWeeklyIssue = async (id: string) => {
    try {
      const docRef = doc(db, 'cms', 'weekly');
      const docSnap = await getDoc(docRef);
      let currentItems: WeeklyIssue[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        currentItems = docSnap.data().items;
      } else {
        currentItems = weekly;
      }

      const next = currentItems.filter(w => w.id !== id);
      setWeekly(next);
      await syncToFirestore('weekly', { items: next });
      await saveBackupSnapshot(reports, next, announcements);
    } catch (err) {
      console.error('Error deleting weekly issue:', err);
    }
  };

  const saveAnnouncement = async (announcement: AnnouncementItem) => {
    try {
      const docRef = doc(db, 'cms', 'announcements');
      const docSnap = await getDoc(docRef);
      let currentItems: AnnouncementItem[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        currentItems = docSnap.data().items;
      } else {
        currentItems = announcements;
      }

      const annWithSlug: AnnouncementItem = {
        ...announcement,
        slug: announcement.slug ? generateSlug(announcement.slug) : generateSlug(announcement.title),
        createdAt: announcement.createdAt || Date.now()
      };

      const existsIndex = currentItems.findIndex(a => a.id === announcement.id);
      let updatedItems: AnnouncementItem[];
      if (existsIndex > -1) {
        updatedItems = [...currentItems];
        updatedItems[existsIndex] = annWithSlug;
      } else {
        updatedItems = [annWithSlug, ...currentItems];
      }

      const sorted = sortItemsByDate(updatedItems, 'date', 'desc');
      setAnnouncements(sorted);
      await syncToFirestore('announcements', { items: sorted });
      await saveBackupSnapshot(reports, weekly, sorted);
    } catch (err) {
      console.error('Error saving announcement:', err);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const docRef = doc(db, 'cms', 'announcements');
      const docSnap = await getDoc(docRef);
      let currentItems: AnnouncementItem[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        currentItems = docSnap.data().items;
      } else {
        currentItems = announcements;
      }

      const next = currentItems.filter(a => a.id !== id);
      setAnnouncements(next);
      await syncToFirestore('announcements', { items: next });
      await saveBackupSnapshot(reports, weekly, next);
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  const saveDiaryItem = async (category: 'national' | 'local' | 'africa' | 'other', item: DiaryItem) => {
    const docKey = category === 'national' ? 'diary_nat' : category === 'local' ? 'diary_loc' : category === 'africa' ? 'diary_afr' : 'diary_oth';
    try {
      const docRef = doc(db, 'cms', docKey);
      const docSnap = await getDoc(docRef);
      let current: DiaryItem[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        current = docSnap.data().items;
      } else {
        current = category === 'national' ? diaryNat : category === 'local' ? diaryLoc : category === 'africa' ? diaryAfr : diaryOth;
      }

      const exists = current.some(d => d.id === item.id);
      const unsorted = exists ? current.map(d => d.id === item.id ? item : d) : [...current, item];
      const next = sortItemsByDate(unsorted, 'date', 'asc');

      if (category === 'national') setDiaryNat(next);
      else if (category === 'local') setDiaryLoc(next);
      else if (category === 'africa') setDiaryAfr(next);
      else if (category === 'other') setDiaryOth(next);

      await syncToFirestore(docKey, { items: next });
    } catch (err) {
      console.error(`Error saving diary ${category}:`, err);
    }
  };

  const deleteDiaryItem = async (category: 'national' | 'local' | 'africa' | 'other', id: string) => {
    const docKey = category === 'national' ? 'diary_nat' : category === 'local' ? 'diary_loc' : category === 'africa' ? 'diary_afr' : 'diary_oth';
    try {
      const docRef = doc(db, 'cms', docKey);
      const docSnap = await getDoc(docRef);
      let current: DiaryItem[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        current = docSnap.data().items;
      } else {
        current = category === 'national' ? diaryNat : category === 'local' ? diaryLoc : category === 'africa' ? diaryAfr : diaryOth;
      }

      const next = current.filter(d => d.id !== id);
      if (category === 'national') setDiaryNat(next);
      else if (category === 'local') setDiaryLoc(next);
      else if (category === 'africa') setDiaryAfr(next);
      else if (category === 'other') setDiaryOth(next);

      await syncToFirestore(docKey, { items: next });
    } catch (err) {
      console.error(`Error deleting diary ${category}:`, err);
    }
  };

  const saveEvent = async (event: EventItem) => {
    try {
      const docRef = doc(db, 'cms', 'events');
      const docSnap = await getDoc(docRef);
      let current: EventItem[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        current = docSnap.data().items;
      } else {
        current = events;
      }

      const exists = current.some(e => e.id === event.id);
      const next = exists ? current.map(e => e.id === event.id ? event : e) : [...current, event];
      setEvents(next);
      await syncToFirestore('events', { items: next });
    } catch (err) {
      console.error('Error saving event:', err);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const docRef = doc(db, 'cms', 'events');
      const docSnap = await getDoc(docRef);
      let current: EventItem[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        current = docSnap.data().items;
      } else {
        current = events;
      }

      const next = current.filter(e => e.id !== id);
      setEvents(next);
      await syncToFirestore('events', { items: next });
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const saveTeamMember = async (member: TeamMember) => {
    try {
      const docRef = doc(db, 'cms', 'team');
      const docSnap = await getDoc(docRef);
      let current: TeamMember[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        current = docSnap.data().items;
      } else {
        current = team;
      }

      const exists = current.some(t => t.id === member.id);
      const next = exists ? current.map(t => t.id === member.id ? member : t) : [...current, member];
      setTeam(next);
      await syncToFirestore('team', { items: next });
    } catch (err) {
      console.error('Error saving team member:', err);
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      const docRef = doc(db, 'cms', 'team');
      const docSnap = await getDoc(docRef);
      let current: TeamMember[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        current = docSnap.data().items;
      } else {
        current = team;
      }

      const next = current.filter(t => t.id !== id);
      setTeam(next);
      await syncToFirestore('team', { items: next });
    } catch (err) {
      console.error('Error deleting team member:', err);
    }
  };

  const saveHeroConfig = async (config: HeroConfig) => {
    setHeroConfig(config);
    await syncToFirestore('hero', { config });
  };

  const saveStatsConfig = async (config: StatItemConfig[]) => {
    setStatsConfig(config);
    await syncToFirestore('stats', { items: config });
  };

  // Safe stat incrementation: targeted write with merge: true to avoid rewriting assets or racing with admin saves
  const incrementPublicationStat = async (type: 'report' | 'weekly' | 'announcement', id: string, statType: 'reads' | 'downloads') => {
    try {
      const collectionKey = type === 'report' ? 'reports' : type === 'weekly' ? 'weekly' : 'announcements';
      const docRef = doc(db, 'cms', collectionKey);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const items = data.items || [];
        const itemIndex = items.findIndex((item: any) => item.id === id);
        
        if (itemIndex > -1) {
          const item = items[itemIndex];
          const currentValue = item[statType] || 0;
          items[itemIndex] = {
            ...item,
            [statType]: currentValue + 1
          };
          
          await setDoc(docRef, { ...data, items }, { merge: true });
        }
      }
    } catch (error) {
      console.error(`Failed to increment ${statType} for ${type} ${id}:`, error);
    }
  };

  // Reset function that PRESERVES publications and never destroys them!
  const resetAllData = async () => {
    // Only resets non-publication templates. Publications are NEVER wiped by resetAllData!
    setDiaryNat(initialDiaryNat);
    setDiaryLoc(initialDiaryLoc);
    setDiaryAfr(initialDiaryAfr);
    setDiaryOth(initialDiaryOth);
    setEvents(initialEvents);
    setTeam(initialTeam);
    setHeroConfig(INITIAL_HERO_CONFIG);
    setStatsConfig(INITIAL_STATS_CONFIG);

    await syncToFirestore('diary_nat', { items: initialDiaryNat });
    await syncToFirestore('diary_loc', { items: initialDiaryLoc });
    await syncToFirestore('diary_afr', { items: initialDiaryAfr });
    await syncToFirestore('diary_oth', { items: initialDiaryOth });
    await syncToFirestore('events', { items: initialEvents });
    await syncToFirestore('team', { items: initialTeam });
    await syncToFirestore('hero', { config: INITIAL_HERO_CONFIG });
    await syncToFirestore('stats', { items: INITIAL_STATS_CONFIG });
  };

  // Restore publications from cloud backup or local storage
  const restorePublicationsBackup = async (): Promise<{ success: boolean; count: number }> => {
    try {
      // 1. Try cloud backup
      const backupSnap = await getDoc(doc(db, 'cms', 'publications_backup'));
      let backupData = backupSnap.exists() ? backupSnap.data() : null;

      // 2. Fall back to local storage
      if (!backupData && typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('aeo_publications_backup');
        if (stored) {
          try {
            backupData = JSON.parse(stored);
          } catch {}
        }
      }

      // 3. Fall back to initial hardcoded restored dataset
      const restoredReports = backupData?.reports || initialReports;
      const restoredWeekly = backupData?.weekly || initialWeekly;
      const restoredAnnouncements = backupData?.announcements || initialAnnouncements;

      if (restoredReports && restoredReports.length > 0) {
        setReports(restoredReports);
        await syncToFirestore('reports', { items: restoredReports });
      }
      if (restoredWeekly && restoredWeekly.length > 0) {
        setWeekly(restoredWeekly);
        await syncToFirestore('weekly', { items: restoredWeekly });
      }
      if (restoredAnnouncements && restoredAnnouncements.length > 0) {
        setAnnouncements(restoredAnnouncements);
        await syncToFirestore('announcements', { items: restoredAnnouncements });
      }

      const total = (restoredReports?.length || 0) + (restoredWeekly?.length || 0) + (restoredAnnouncements?.length || 0);
      return { success: true, count: total };
    } catch (err) {
      console.error('Error restoring publications backup:', err);
      return { success: false, count: 0 };
    }
  };

  // Explicit refresh from cloud without destroying any data
  const refreshData = async () => {
    try {
      const repSnap = await getDoc(doc(db, 'cms', 'reports'));
      if (repSnap.exists() && Array.isArray(repSnap.data()?.items)) {
        setReports(repSnap.data()?.items);
      }
      const weekSnap = await getDoc(doc(db, 'cms', 'weekly'));
      if (weekSnap.exists() && Array.isArray(weekSnap.data()?.items)) {
        setWeekly(weekSnap.data()?.items);
      }
      const annSnap = await getDoc(doc(db, 'cms', 'announcements'));
      if (annSnap.exists() && Array.isArray(annSnap.data()?.items)) {
        setAnnouncements(annSnap.data()?.items);
      }
      const dNatSnap = await getDoc(doc(db, 'cms', 'diary_nat'));
      if (dNatSnap.exists() && Array.isArray(dNatSnap.data()?.items)) {
        setDiaryNat(dNatSnap.data()?.items);
      }
      const dLocSnap = await getDoc(doc(db, 'cms', 'diary_loc'));
      if (dLocSnap.exists() && Array.isArray(dLocSnap.data()?.items)) {
        setDiaryLoc(dLocSnap.data()?.items);
      }
      const dAfrSnap = await getDoc(doc(db, 'cms', 'diary_afr'));
      if (dAfrSnap.exists() && Array.isArray(dAfrSnap.data()?.items)) {
        setDiaryAfr(dAfrSnap.data()?.items);
      }
      const dOthSnap = await getDoc(doc(db, 'cms', 'diary_oth'));
      if (dOthSnap.exists() && Array.isArray(dOthSnap.data()?.items)) {
        setDiaryOth(dOthSnap.data()?.items);
      }
      const evtSnap = await getDoc(doc(db, 'cms', 'events'));
      if (evtSnap.exists() && Array.isArray(evtSnap.data()?.items)) {
        setEvents(evtSnap.data()?.items);
      }
      const teamSnap = await getDoc(doc(db, 'cms', 'team'));
      if (teamSnap.exists() && Array.isArray(teamSnap.data()?.items)) {
        setTeam(teamSnap.data()?.items);
      }
    } catch (e) {
      console.warn('Error refreshing cloud data:', e);
    }
  };

  // Export entire CMS data as formatted JSON string
  const exportAllDataJson = useCallback(() => {
    const backupObj = {
      version: 1,
      exportedAt: new Date().toISOString(),
      reports,
      weekly,
      announcements,
      diaryNat,
      diaryLoc,
      diaryAfr,
      diaryOth,
      events,
      team,
      heroConfig,
      statsConfig
    };
    return JSON.stringify(backupObj, null, 2);
  }, [reports, weekly, announcements, diaryNat, diaryLoc, diaryAfr, diaryOth, events, team, heroConfig, statsConfig]);

  // Import entire CMS data from JSON string
  const importDataJson = async (jsonStr: string): Promise<{ success: boolean; message: string }> => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Invalid JSON file format.' };
      }

      let count = 0;
      if (Array.isArray(parsed.reports) && parsed.reports.length > 0) {
        setReports(parsed.reports);
        await syncToFirestore('reports', { items: parsed.reports });
        count += parsed.reports.length;
      }
      if (Array.isArray(parsed.weekly) && parsed.weekly.length > 0) {
        setWeekly(parsed.weekly);
        await syncToFirestore('weekly', { items: parsed.weekly });
        count += parsed.weekly.length;
      }
      if (Array.isArray(parsed.announcements) && parsed.announcements.length > 0) {
        setAnnouncements(parsed.announcements);
        await syncToFirestore('announcements', { items: parsed.announcements });
        count += parsed.announcements.length;
      }
      if (Array.isArray(parsed.diaryNat)) {
        setDiaryNat(parsed.diaryNat);
        await syncToFirestore('diary_nat', { items: parsed.diaryNat });
      }
      if (Array.isArray(parsed.diaryLoc)) {
        setDiaryLoc(parsed.diaryLoc);
        await syncToFirestore('diary_loc', { items: parsed.diaryLoc });
      }
      if (Array.isArray(parsed.diaryAfr)) {
        setDiaryAfr(parsed.diaryAfr);
        await syncToFirestore('diary_afr', { items: parsed.diaryAfr });
      }
      if (Array.isArray(parsed.diaryOth)) {
        setDiaryOth(parsed.diaryOth);
        await syncToFirestore('diary_oth', { items: parsed.diaryOth });
      }
      if (Array.isArray(parsed.events)) {
        setEvents(parsed.events);
        await syncToFirestore('events', { items: parsed.events });
      }
      if (Array.isArray(parsed.team)) {
        setTeam(parsed.team);
        await syncToFirestore('team', { items: parsed.team });
      }
      if (parsed.heroConfig) {
        setHeroConfig(parsed.heroConfig);
        await syncToFirestore('hero', { config: parsed.heroConfig });
      }
      if (Array.isArray(parsed.statsConfig)) {
        setStatsConfig(parsed.statsConfig);
        await syncToFirestore('stats', { items: parsed.statsConfig });
      }

      await saveBackupSnapshot(
        parsed.reports || reports,
        parsed.weekly || weekly,
        parsed.announcements || announcements
      );

      return { success: true, message: `Successfully restored ${count} publications and all associated CMS data.` };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to parse JSON backup file.' };
    }
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
      dataLoaded,
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
      incrementPublicationStat,
      resetAllData,
      restorePublicationsBackup,
      refreshData,
      exportAllDataJson,
      importDataJson
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
