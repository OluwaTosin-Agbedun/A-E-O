export interface ReportSection {
  title: string;
  content: string;
}

export type TagType = 'analysis' | 'tech' | 'announcement' | 'newsletter';

export interface Report {
  id: string;
  tag: string;
  tagType: TagType;
  date: string;
  size: string;
  title: string;
  summary: string;
  sections: ReportSection[];
}

export interface DiaryItem {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  status: 'In view' | 'Scheduled' | 'Provisional' | 'Tracking' | 'Concluded';
}

export interface EventItem {
  id: string;
  month: string;
  day: string;
  title: string;
  description: string;
  location: string;
  type: string;
}

export interface TeamMember {
  id: string;
  initials: string;
  name: string;
  role: string;
}

export interface WeeklySection {
  title: string;
  text: string;
}

export interface WeeklyIssue {
  id: string;
  tag: string;
  date: string;
  title: string;
  summary: string;
  linkText: string;
  author?: string;
  readingTime?: string;
  sections?: WeeklySection[];
}

export interface HeroConfig {
  badgeText: string;
  title: string;
  description: string;
  exploreButtonText: string;
  auditButtonText: string;
  
  // Spotlight
  spotlightBadgeText: string;
  spotlightStatusText: string;
  spotlightTitle: string;
  spotlightDateText: string;
  spotlightTargetDate: string;
  
  // Spotlight specs
  lgasCount: string;
  registeredVoters: string;
  pollingUnits: string;
  spotlightBottomText: string;
  diaryLinkText: string;

  // Custom styling settings for colors, font size, and font type
  heroBgColor?: string; // background color or hex (e.g. bg-navy, bg-slate-900, or hex #123456)
  titleFontSize?: string; // e.g. "text-4xl sm:text-5xl lg:text-6xl"
  titleFontFamily?: string; // e.g. "font-sans", "font-display", "font-mono"
  titleColor?: string; // e.g. "text-white" or custom Hex
  titleHighlightFrom?: string; // e.g. "#93C5FD" (blue-300)
  titleHighlightTo?: string; // e.g. "#86EFAC" (green-300)
  descriptionFontSize?: string; // e.g. "text-base sm:text-lg"
  descriptionFontFamily?: string; // e.g. "font-sans", "font-display", "font-mono"
  descriptionColor?: string; // e.g. "text-blue-100" or hex
}

export interface StatItemConfig {
  id: number;
  title: string;
  value: string;
  sub: string;
  detail: string;
  color: string; // fallback background gradient class
  iconName: 'Shield' | 'Database' | 'FileSpreadsheet' | 'Globe';

  // Custom styling settings
  cardBgType?: 'gradient' | 'solid';
  cardBgSolid?: string; // Hex color
  cardBgGradFrom?: string; // Hex or tailwind class
  cardBgGradTo?: string; // Hex or tailwind class
  titleFontSize?: string; // e.g. "text-xs"
  titleFontFamily?: string; // e.g. "font-sans", "font-display", "font-mono"
  titleColor?: string; // e.g. "text-white/80" or custom hex
  valueFontSize?: string; // e.g. "text-3xl sm:text-4xl"
  valueFontFamily?: string; // e.g. "font-sans", "font-display", "font-mono"
  valueColor?: string; // e.g. "text-white" or custom hex
}

