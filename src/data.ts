import { Report, DiaryItem, EventItem, TeamMember, WeeklyIssue } from './types';

export const REPORTS: Report[] = [
  {
    id: 'anambra',
    tag: 'Election Analysis',
    tagType: 'analysis',
    date: 'Nov 2025',
    size: '3.6 MB',
    title: 'Do Votes Count? Anambra 2025',
    summary: 'Full four-form audit across 5,720 polling units, with party vote-journey analysis and compliance classification.',
    sections: [
      {
        title: 'Executive summary',
        content: "This report presents a forensic audit of the 2025 Anambra State governorship election, reconciling INEC's own result forms against BVAS accreditation data across all 5,720 polling units in 21 local government areas. The analysis scores only what falls within INEC's documented responsibility and is verifiable from primary sources."
      },
      {
        title: 'Methodology',
        content: "Every polling unit was assessed against a ±5-vote tolerance. Results on Form EC8A were reconciled with BVAS accreditation figures; ward (EC8B), LGA (EC8C) and state (EC8D) collations were checked for arithmetic consistency. Polling units with null or missing BVAS values were flagged and excluded from compliance scoring rather than assumed compliant."
      },
      {
        title: 'Key findings',
        content: "The majority of polling units reconciled within tolerance. A defined subset showed vote totals exceeding accreditation beyond the tolerance band, and a smaller set showed collation figures that did not match the sum of their constituent units. Each exception is documented at the polling-unit level with its supporting form reference."
      },
      {
        title: 'Compliance classification',
        content: "Units were classified as compliant, excluded (insufficient primary data), or flagged (reconciliation exceeded tolerance). Inter-party vote movements were tested for inflation, reduction and swaps using absolute thresholds to filter noise. Significance testing distinguished patterned discrepancies from chance variation."
      },
      {
        title: 'Conclusion',
        content: "The documentary record supports a broadly credible process with identifiable, localised exceptions. The burden of proof throughout is documentary: where primary evidence was absent, no adverse inference was drawn. Full polling-unit tables are included in the downloadable PDF."
      }
    ]
  },
  {
    id: 'imo',
    tag: 'Election Analysis',
    tagType: 'analysis',
    date: 'Jan 2024',
    size: '3.2 MB',
    title: 'Do Votes Count? Imo 2023',
    summary: 'Finds widespread non-compliance; nearly a quarter of declared results conflicted with accreditation data.',
    sections: [
      {
        title: 'Executive summary',
        content: "This audit examines the 2023 Imo State governorship election and finds widespread non-compliance between declared results and accreditation data. Nearly a quarter of declared polling-unit results conflicted with BVAS figures beyond tolerance, raising documented questions of legitimacy."
      },
      {
        title: 'Methodology',
        content: "Declared EC8A results were reconciled against BVAS accreditation across the state, applying the standard ±5-vote tolerance and excluding units lacking primary data from scoring."
      },
      {
        title: 'Key findings',
        content: "A substantial share of units recorded votes materially exceeding accreditation. The discrepancies were not uniformly distributed; geographic concentration was assessed by pivot analysis rather than assumed."
      },
      {
        title: 'Conclusion',
        content: "The scale of unreconciled results is documented in full in the downloadable PDF, with every flagged unit traceable to its source form."
      }
    ]
  },
  {
    id: 'tech',
    tag: 'Technology Assessment',
    tagType: 'tech',
    date: 'Feb 2024',
    size: '4.1 MB',
    title: 'Compromised by Design',
    summary: "Vulnerabilities in INEC's technology (BVAS, IReV) — manipulation risks and transparency gaps.",
    sections: [
      {
        title: 'Overview',
        content: "This assessment explores structural vulnerabilities in INEC's election technology stack — the Bimodal Voter Accreditation System (BVAS) and the INEC Result Viewing portal (IReV) — and how they bear on the transparency and verifiability of results."
      },
      {
        title: 'Areas examined',
        content: "The review covers the accreditation-to-result chain, the timeliness and completeness of IReV uploads, and the points at which the documentary trail can break down or be obscured."
      },
      {
        title: 'Conclusion',
        content: "The report sets out where technology strengthens the integrity of the process and where design and implementation gaps weaken it, with recommendations. The full analysis is available in the downloadable PDF."
      }
    ]
  }
];

export const DIARY_NATIONAL: DiaryItem[] = [
  {
    id: 'nat-1',
    date: '15 Aug 2026',
    title: 'Osun State Governorship',
    subtitle: 'Off-cycle · INEC',
    status: 'In view'
  },
  {
    id: 'nat-2',
    date: '16 Jan 2027',
    title: 'Presidential & National Assembly',
    subtitle: '2027 General Election',
    status: 'Scheduled'
  },
  {
    id: 'nat-3',
    date: '06 Feb 2027',
    title: 'Governorship & State Assembly',
    subtitle: '2027 General Election',
    status: 'Scheduled'
  }
];

export const DIARY_LOCAL: DiaryItem[] = [
  {
    id: 'loc-1',
    date: 'Q3 2026',
    title: 'Lagos LG Elections',
    subtitle: 'Local government · LASIEC',
    status: 'Provisional'
  },
  {
    id: 'loc-2',
    date: '2026–27',
    title: 'State-by-state LG polls',
    subtitle: 'Local government · SIECs',
    status: 'Tracking'
  }
];

export const DIARY_AFRICA: DiaryItem[] = [
  {
    id: 'afr-1',
    date: '25 Oct 2025',
    title: "Côte d'Ivoire Presidential",
    subtitle: 'Africa · reference',
    status: 'Concluded'
  }
];

export const DIARY_OTHER: DiaryItem[] = [
  {
    id: 'oth-1',
    date: 'Nov 2026',
    title: 'United States Midterms',
    subtitle: 'Other countries · reference',
    status: 'Scheduled'
  }
];

export const EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    month: 'AUG',
    day: '20',
    title: 'EHII Methodology Briefing',
    description: 'Presentation of the Electoral Health & Integrity Index to partners.',
    location: 'Abuja',
    type: 'Roundtable'
  },
  {
    id: 'evt-2',
    month: 'SEP',
    day: '05',
    title: 'Post-Osun Findings Forum',
    description: 'Early observations from the Osun governorship monitoring.',
    location: 'Virtual',
    type: 'Public'
  },
  {
    id: 'evt-3',
    month: 'NOV',
    day: '12',
    title: 'Democracy & Data Series',
    description: 'Evidence in election observation — a practitioner workshop.',
    location: 'Lagos',
    type: 'Workshop'
  }
];

export const TEAM: TeamMember[] = [
  {
    id: 'team-1',
    initials: 'AE',
    name: 'Observatory Lead',
    role: 'Strategy & methodology'
  },
  {
    id: 'team-2',
    initials: 'DA',
    name: 'Data & Forensics',
    role: 'Audit pipelines'
  },
  {
    id: 'team-3',
    initials: 'FM',
    name: 'Field Monitoring',
    role: 'Real-time observation'
  },
  {
    id: 'team-4',
    initials: 'CR',
    name: 'Communications',
    role: 'AEO Weekly & reports'
  }
];

export const WEEKLY_ISSUES: WeeklyIssue[] = [
  {
    id: 'wk-1',
    tag: 'Newsletter · No. 42',
    date: '27 Jun 2026',
    title: 'Ekiti, counted: what the IReV upload tells us',
    summary: 'Our read of the Ekiti result management and the three things to watch before Osun.',
    linkText: 'Read issue →'
  },
  {
    id: 'wk-2',
    tag: 'Analysis',
    date: 'Apr 2026',
    title: "Nigeria's Democracy & the Imperative of Competitive Politics",
    summary: 'Why institutional clarity and credible party competition matter for democratic resilience.',
    linkText: 'Read article →'
  },
  {
    id: 'wk-3',
    tag: 'Announcement',
    date: 'Apr 2026',
    title: 'Press Statement — For Immediate Release',
    summary: "AEO's statement on transparency and result management in the current electoral cycle.",
    linkText: 'Read statement →'
  }
];
