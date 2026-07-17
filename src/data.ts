import { Report, DiaryItem, EventItem, TeamMember, WeeklyIssue, AnnouncementItem } from './types';

export const REPORTS: Report[] = [
  {
    id: 'anambra',
    tag: 'Election Analysis',
    tagType: 'analysis',
    date: 'Nov 2025',
    size: '3.6 MB',
    title: 'Do Votes Count? Anambra 2025',
    summary: 'Full four-form audit across 5,720 polling units, with party vote-journey analysis and compliance classification.',
    author: 'Uchenna Victor Mgbechi',
    authorsList: 'Uchenna Victor Mgbechi and Dr. Izuchukwu Christiantus Anyanwu',
    image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800',
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
    author: 'Chinaza Igwe',
    authorsList: 'Chinaza Igwe and Uchenna Victor Mgbechi',
    image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800',
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
    author: 'Dr. Izuchukwu Christiantus Anyanwu',
    authorsList: 'Dr. Izuchukwu Christiantus Anyanwu and Chinaza Igwe',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
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
  },
  {
    id: 'kaduna-security',
    tag: 'Governance and Leadership',
    tagType: 'tech',
    date: '9 Feb 2026',
    size: '4.5 MB',
    title: "Kaduna’s Security Crisis: Denial, Delay and the Erosion of State Authority",
    summary: "An in-depth assessment of Kaduna's evolving security landscape, analysing the systemic erosion of state authority, governance models, and sub-national response mechanisms.",
    author: "Uchenna Victor Mgbechi",
    authorsList: "Uchenna Victor Mgbechi and Dr. Izuchukwu Christiantus Anyanwu",
    image: "/src/assets/images/kaduna_security_1784290584592.jpg",
    researchArea: "Governance and Leadership",
    sections: [
      {
        title: 'Executive Summary',
        content: "The state of play in Kaduna continues to be defined by high instability, where regional armed groups challenge traditional state governance, leading to an erosion of administrative authority. This assessment explores how state denial and systemic delays in deployment compound local vulnerability."
      },
      {
        title: 'Strategic Security Assessment',
        content: "Detailed security logs show a pattern of critical delays in response times. Policy coordination gaps between sub-national authorities and federal defense structures are analysed in full. We present geospatial maps of localized insecurity incidents alongside administrative response intervals."
      },
      {
        title: 'Roadmap and Recommendations',
        content: "Re-establishing governance trust, scaling decentralized community security monitors, and implementing comprehensive, open-access audit logs of response times remain the core administrative imperatives."
      }
    ]
  },
  {
    id: 'hospitals-reform',
    tag: 'Education & Health',
    tagType: 'tech',
    date: '2 Feb 2026',
    size: '3.8 MB',
    title: "When Hospitals Kill: The Urgent Need to Reform Nigeria's Health System",
    summary: "Nigeria's healthcare system carries a heavy and largely avoidable human cost. Too many patients die not because their conditions are incurable, but because routine hospital care fails them.",
    author: "Dr. Izuchukwu Christiantus Anyanwu",
    authorsList: "Dr. Izuchukwu Christiantus Anyanwu, Chinaza Igwe, and Fr. Dr. Emmanuel C. Ejimonu",
    image: "/src/assets/images/hospital_reform_1784290598333.jpg",
    researchArea: "Health",
    sections: [
      {
        title: 'Executive Summary',
        content: "This study highlights the severe structural deficit across tertiary and secondary healthcare facilities. It calls attention to avoidable patient mortality rates linked to equipment neglect, operational delays, and supply chain breakdowns."
      },
      {
        title: 'Healthcare Audit & Findings',
        content: "Assessment of facilities across selected sub-national districts reveals high equipment downtime, critical drug stockouts, and clinical administrative fatigue. We contrast public funding allocations against patient care output metrics."
      },
      {
        title: 'Strategic Reform Roadmap',
        content: "Key interventions include standardizing critical care response systems, deploying localized performance audit workflows, and boosting primary healthcare capacity to divert routine traffic from tertiary hubs."
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
    linkText: 'Read issue →',
    author: 'Uchenna Victor Mgbechi',
    authorsList: 'Uchenna Victor Mgbechi'
  },
  {
    id: 'wk-2',
    tag: 'Analysis',
    date: 'Apr 2026',
    title: "Nigeria's Democracy & the Imperative of Competitive Politics",
    summary: 'Why institutional clarity and credible party competition matter for democratic resilience.',
    linkText: 'Read article →',
    author: 'Dr. Izuchukwu Christiantus Anyanwu',
    authorsList: 'Dr. Izuchukwu Christiantus Anyanwu'
  },
  {
    id: 'wk-3',
    tag: 'Announcement',
    date: 'Apr 2026',
    title: 'Press Statement — For Immediate Release',
    summary: "AEO's statement on transparency and result management in the current electoral cycle.",
    linkText: 'Read statement →',
    author: 'Chinaza Igwe',
    authorsList: 'Chinaza Igwe'
  }
];

export const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    month: 'AUG',
    day: '10',
    date: '10 Aug 2026',
    title: 'Deployment of Osun State Observers Completed',
    summary: 'AEO has finished the training and geographic staging of 1,200 independent observers who will be tracking polling unit operations and uploading form EC8A scans across Osun State.',
    content: "Our logistics team has activated 30 sub-divisional monitoring desks. Observers are equipped with digital survey and submission channels that bypass typical mobile network latencies via high-availability secondary relays.",
    category: 'press',
    author: 'AEO Secretariat',
    authorsList: 'Athena Election Observatory Secretariat'
  },
  {
    id: 'ann-2',
    month: 'JUN',
    day: '15',
    date: '15 Jun 2026',
    title: 'AEO Statement on IReV Access Limits and Portal Latency',
    summary: 'An official alert highlighting recent issues with result viewing latency and portal accessibility during sub-national updates.',
    content: "AEO's technology audit panel notes that INEC's Result Viewing Portal experienced recurring 2-hour latency clusters in the most recent updates. We urge INEC to scale compute resources to maintain public transparency during result collation cycles.",
    category: 'alert',
    author: 'Uchenna Victor Mgbechi',
    authorsList: 'Uchenna Victor Mgbechi'
  }
];
