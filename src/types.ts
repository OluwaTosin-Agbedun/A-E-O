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

export interface WeeklyIssue {
  id: string;
  tag: string;
  date: string;
  title: string;
  summary: string;
  linkText: string;
}
