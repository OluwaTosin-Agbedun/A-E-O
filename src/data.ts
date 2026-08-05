import { Report, DiaryItem, EventItem, TeamMember, WeeklyIssue, AnnouncementItem } from './types';

export const REPORTS: Report[] = [];

export const DIARY_NATIONAL: DiaryItem[] = [
  {
    id: 'nat-1',
    date: '15 Aug 2026',
    title: 'Osun State Governorship',
    subtitle: 'Off-cycle · INEC Monitored',
    status: 'In view',
    region: 'nigeria',
    type: 'governorship',
    country: 'Nigeria',
    location: 'Osun State, Nigeria',
    stateCode: 'OS',
    electoralBody: 'INEC (Independent National Electoral Commission)',
    registeredVoters: '2,339,233 voters',
    pollingUnits: '3,763 polling units',
    lgasCount: '30 LGAs + Area Office',
    description: 'Off-cycle gubernatorial election in Osun State. Athena Election Observatory is deploying 1,200 trained field monitors across all 30 LGAs to audit BVAS machine compliance, EC8A physical form uploads, and collation accuracy.',
    sittingExecutive: {
      name: 'Ademola Adeleke',
      title: 'Incumbent Governor of Osun State',
      party: 'PDP',
      assumedOffice: 'November 27, 2022',
      termInfo: 'First Term (2022–2026)',
      notes: 'Seeking re-election for a second four-year term under the People\'s Democratic Party banner.'
    },
    participants: [
      { name: 'Ademola Adeleke', party: 'PDP', role: 'Incumbent Governor & Flagbearer', platform: 'Infrastructure expansion, public worker welfare, education & digital economy' },
      { name: 'Adegboyega Oyetola / APC Candidate', party: 'APC', role: 'Flagbearer & Former Governor', platform: 'Fiscal consolidation, agricultural development, health sector reform' },
      { name: 'Dr. Akin Ogunbiyi', party: 'Accord / LP Candidate', role: 'Gubernatorial Candidate', platform: 'Private sector employment, industrialization, youth empowerment' },
      { name: 'Ganiyu Olaoluwa', party: 'SDP Candidate', role: 'Gubernatorial Candidate', platform: 'Local government autonomy, rural roads, SME credit support' }
    ],
    keyIssues: [
      'BVAS startup latency and biometric accreditation rates across rural LGAs',
      'Real-time IReV server synchronization speed during polling unit counts',
      'Prevention of vote-buying and financial inducements near voting cubicles',
      'Security posture and security agency neutrality at collation centers'
    ],
    monitoringMission: 'Athena Deployment: 1,200 Accredited Observers · Direct IReV Validation Pipeline'
  },
  {
    id: 'nat-2',
    date: '16 Jan 2027',
    title: 'Presidential & National Assembly Election',
    subtitle: '2027 Nigeria General Election',
    status: 'Scheduled',
    region: 'nigeria',
    type: 'presidential',
    country: 'Nigeria',
    location: 'Nationwide (36 States & FCT Abuja)',
    electoralBody: 'INEC (Independent National Electoral Commission)',
    registeredVoters: '93,468,208 voters (Projected)',
    pollingUnits: '176,846 polling units',
    lgasCount: '774 LGAs',
    description: 'Federal election to elect the President and Commander-in-Chief of the Federal Republic of Nigeria, along with members of the Senate and House of Representatives.',
    sittingExecutive: {
      name: 'Bola Ahmed Tinubu',
      title: 'President of the Federal Republic of Nigeria',
      party: 'APC',
      assumedOffice: 'May 29, 2023',
      termInfo: 'First Term (2023–2027)',
      notes: 'Incumbent administration presiding over structural economic reforms, fuel subsidy removal, and currency unification.'
    },
    participants: [
      { name: 'Bola Ahmed Tinubu', party: 'APC', role: 'Incumbent President & Flagbearer', platform: 'Renewed Hope Agenda, economic liberalization, national security' },
      { name: 'Atiku Abubakar', party: 'PDP Candidate', role: 'Flagbearer', platform: 'Devolution of powers, economic restructuring, public education reform' },
      { name: 'Peter Obi', party: 'Labour Party (LP) Candidate', role: 'Flagbearer', platform: 'Production-based economy, governance cost reduction, anti-corruption' },
      { name: 'Rabiu Musa Kwankwaso', party: 'NNPP Candidate', role: 'Flagbearer', platform: 'Human capital development, free education, grassroots security' }
    ],
    keyIssues: [
      'Nationwide BVAS deployment robustness across 176,846 polling units',
      'IReV portal transmission integrity for Presidential result forms',
      'Electoral logistics timely distribution of sensitive materials',
      'Prevention of voter suppression and conflict in volatile zones'
    ],
    monitoringMission: 'Athena Nationwide Mission: 15,000 Field Observers across 774 LGAs'
  },
  {
    id: 'nat-3',
    date: '06 Feb 2027',
    title: 'Governorship & State Assembly Elections',
    subtitle: '2027 Nigeria General Election',
    status: 'Scheduled',
    region: 'nigeria',
    type: 'governorship',
    country: 'Nigeria',
    location: '28 States across Nigeria',
    electoralBody: 'INEC (Independent National Electoral Commission)',
    registeredVoters: '72,100,000 voters (State-level totals)',
    pollingUnits: '135,000 polling units',
    lgasCount: '620 State LGAs',
    description: 'State-level elections to elect State Governors and House of Assembly members in 28 states where elections coincide with the general election cycle.',
    sittingExecutive: {
      name: 'Incumbent Governors Council',
      title: 'State Executive Governors (28 States)',
      party: 'APC / PDP / LP / APGA / NNPP',
      termInfo: '2023–2027 Term',
      notes: 'Multiparty governance across subnational states.'
    },
    participants: [
      { name: 'APC State Candidates', party: 'APC', role: 'Gubernatorial Candidates in 28 States', platform: 'Federal-State alignment, infrastructure, agricultural hubs' },
      { name: 'PDP State Candidates', party: 'PDP', role: 'Gubernatorial Candidates in 28 States', platform: 'Subnational economy, state health insurance, civil service welfare' },
      { name: 'LP State Candidates', party: 'Labour Party', role: 'Gubernatorial Candidates in Key States', platform: 'Transparent governance, youth employment, MSME funds' },
      { name: 'APGA State Candidates', party: 'APGA', role: 'Gubernatorial Candidates in South-East', platform: 'Regional economic integration and security technology' }
    ],
    keyIssues: [
      'State-level collation center security and transparency',
      'Observer access to ward collation centers',
      'Timely announcement of state assembly results'
    ],
    monitoringMission: 'Subnational Deployment across 28 State Capitals'
  },
  {
    id: 'nat-4',
    date: '08 Nov 2025',
    title: 'Anambra State Governorship',
    subtitle: 'Off-cycle · INEC Monitored',
    status: 'Concluded',
    region: 'nigeria',
    type: 'governorship',
    country: 'Nigeria',
    location: 'Anambra State, Nigeria',
    stateCode: 'AN',
    electoralBody: 'INEC (Independent National Electoral Commission)',
    registeredVoters: '2,650,000 voters',
    pollingUnits: '5,720 polling units',
    lgasCount: '21 LGAs',
    description: 'Off-cycle gubernatorial election in Anambra State. Observatory auditing focuses on BVAS accreditation consistency, voter turnout metrics, and peaceful voting in the South-East.',
    sittingExecutive: {
      name: 'Prof. Chukwuma Charles Soludo',
      title: 'Incumbent Governor of Anambra State',
      party: 'APGA',
      assumedOffice: 'March 17, 2022',
      termInfo: 'First Term (2022–2026)',
      notes: 'Seeking re-election under the All Progressives Grand Alliance (APGA).'
    },
    participants: [
      { name: 'Prof. Chukwuma Soludo', party: 'APGA', role: 'Incumbent Governor & Candidate', platform: 'Smart mega-city masterplan, teacher recruitment, industrial parks' },
      { name: 'Senator Ifeanyi Ubah / YPP-APC Candidate', party: 'APC / YPP', role: 'Flagbearer', platform: 'Security modernization, commercial trade support, youth employment' },
      { name: 'Valentine Ozigbo', party: 'Labour Party (LP) Candidate', role: 'Gubernatorial Candidate', platform: 'Digital technology hubs, governance audit, export promotion' },
      { name: 'PDP Candidate', party: 'PDP', role: 'Gubernatorial Candidate', platform: 'Local government revitalization and primary healthcare' }
    ],
    keyIssues: [
      'BVAS machine performance in high-density urban wards (Awka, Onitsha, Nnewi)',
      'Security atmosphere and voter turnout assurance',
      'Form EC8A uploaded image clarity on IReV portal'
    ],
    monitoringMission: 'Athena Deployment: 1,000 Field Observers across 21 LGAs'
  }
];

export const DIARY_LOCAL: DiaryItem[] = [
  {
    id: 'loc-1',
    date: 'Q3 2026',
    title: 'Lagos State Local Government Elections',
    subtitle: 'Local Government · LASIEC',
    status: 'Provisional',
    region: 'nigeria',
    type: 'local_government',
    country: 'Nigeria',
    location: 'Lagos State (20 LGAs & 37 LCDAs)',
    electoralBody: 'LASIEC (Lagos State Independent Electoral Commission)',
    registeredVoters: '7,000,000+ voters',
    pollingUnits: '13,325 polling units',
    lgasCount: '20 LGAs & 37 LCDAs',
    description: 'Grassroots local council elections across Lagos State to elect 57 Council Chairmen and 376 Ward Councillors.',
    sittingExecutive: {
      name: 'Babajide Sanwo-Olu',
      title: 'Governor of Lagos State (Overseeing LASIEC)',
      party: 'APC',
      assumedOffice: 'May 29, 2019',
      termInfo: 'Second Term (2023–2027)',
      notes: 'State government supervises the state independent electoral body.'
    },
    participants: [
      { name: 'APC Local Chairmanship Candidates', party: 'APC', role: 'Candidates in 57 Councils', platform: 'Grassroots infrastructure, drainage maintenance, primary health' },
      { name: 'PDP Council Candidates', party: 'PDP', role: 'Candidates across 20 Wards', platform: 'Community market development, youth empowerment, bursaries' },
      { name: 'Labour Party Candidates', party: 'Labour Party', role: 'Candidates in Urban Councils', platform: 'Transparent local budget execution and sanitation reforms' }
    ],
    keyIssues: [
      'State Independent Electoral Commission (SIEC) operational independence',
      'Timely deployment of ballot boxes and manual voters registers',
      'Voter turnout in grassroots council polls'
    ],
    monitoringMission: 'Local Government Integrity Oversight Team'
  },
  {
    id: 'loc-2',
    date: 'Q1 2026',
    title: 'FCT Abuja Municipal Area Council Polls',
    subtitle: 'Local Government · INEC Monitored',
    status: 'Scheduled',
    region: 'nigeria',
    type: 'local_government',
    country: 'Nigeria',
    location: 'Federal Capital Territory (AMAC, Bwari, Gwagwalada, Kuje, Abaji, Kwali)',
    electoralBody: 'INEC (Federal Area Council Supervision)',
    registeredVoters: '1,500,000 voters',
    pollingUnits: '2,828 polling units',
    lgasCount: '6 Area Councils',
    description: 'Area Council elections in the Federal Capital Territory, Abuja, unique as the only local government elections directly conducted by INEC.',
    sittingExecutive: {
      name: 'Christopher Maikalangu',
      title: 'AMAC Council Chairman / Nyesom Wike (FCT Minister)',
      party: 'PDP / Federal FCTA',
      assumedOffice: 'February 2022',
      termInfo: '2022–2026 Term',
      notes: 'INEC conducts FCT area council polls directly under federal election laws.'
    },
    participants: [
      { name: 'Christopher Maikalangu', party: 'PDP', role: 'Incumbent AMAC Chairman', platform: 'Rural electrification, municipal road paving, sanitation' },
      { name: 'APC AMAC Candidate', party: 'APC', role: 'Area Council Flagbearer', platform: 'FCT satellite town development, primary healthcare centers' },
      { name: 'LP AMAC Candidate', party: 'Labour Party', role: 'Area Council Flagbearer', platform: 'Urban vendor protection, transparent revenue collection' }
    ],
    keyIssues: [
      'INEC technology deployment at grassroots level in FCT',
      'Bimodal voter accreditation speed in satellite towns',
      'Security and public order at area council collation centers'
    ],
    monitoringMission: 'FCT Area Council Independent Monitoring Panel'
  },
  {
    id: 'loc-3',
    date: '2026–2027',
    title: 'State-by-State Local Government Polls',
    subtitle: 'Local Government · SIECs Nationwide',
    status: 'Tracking',
    region: 'nigeria',
    type: 'local_government',
    country: 'Nigeria',
    location: '36 States Nationwide',
    electoralBody: 'State Independent Electoral Commissions (SIECs)',
    registeredVoters: 'Grassroots Sub-national Population',
    pollingUnits: 'State-wide polling locations',
    lgasCount: '774 LGAs nationwide',
    description: 'Ongoing tracking of local council elections held across Nigerian states following Supreme Court judgment on financial autonomy for local governments.',
    sittingExecutive: {
      name: 'State Governors Forum & SIEC Chairmen',
      title: 'State Executive Authorities',
      party: 'Cross-party',
      termInfo: 'Constitutional LG Autonomy Mandate',
      notes: 'Tracking compliance with direct federal allocation disbursements to democratically elected council officials.'
    },
    participants: [
      { name: 'Multi-party Grassroots Candidates', party: 'APC / PDP / LP / APGA / NNPP', role: 'LGA Chairmanship & Ward Councillors', platform: 'Primary health, rural access roads, market administration' }
    ],
    keyIssues: [
      'Compliance with constitutional requirement for democratically elected council leadership',
      'Level playing field for opposition parties in SIEC-conducted polls',
      'Transparency of revenue collection and expenditure at council level'
    ],
    monitoringMission: 'AEO Grassroots Democracy & Autonomy Index'
  }
];

export const DIARY_AFRICA: DiaryItem[] = [
  {
    id: 'afr-1',
    date: '25 Oct 2025',
    title: "Côte d'Ivoire Presidential Election",
    subtitle: 'Africa · Regional Benchmark',
    status: 'Concluded',
    region: 'africa',
    type: 'presidential',
    country: "Côte d'Ivoire",
    location: 'Abidjan & All Districts, Côte d\'Ivoire',
    electoralBody: 'CEI (Commission Électorale Indépendante)',
    registeredVoters: '8,000,000 registered voters',
    pollingUnits: '22,000 polling stations',
    lgasCount: '31 Regions & 108 Departments',
    description: 'Presidential election in Côte d\'Ivoire serving as a key democratic indicator for political stability and electoral administration in Francophone West Africa.',
    sittingExecutive: {
      name: 'Alassane Ouattara',
      title: 'President of the Republic of Côte d\'Ivoire',
      party: 'RHDP (Rassemblement des Houphouëtistes pour la Démocratie et la Paix)',
      assumedOffice: 'December 2010',
      termInfo: 'Third Term (2020–2025)',
      notes: 'Presided over economic expansion and regional infrastructure development.'
    },
    participants: [
      { name: 'Alassane Ouattara / RHDP Flagbearer', party: 'RHDP', role: 'Ruling Party Candidate', platform: 'Economic growth, agricultural processing, national stability' },
      { name: 'Tidjane Thiam', party: 'PDCI-RDA', role: 'Main Opposition Candidate', platform: 'Institutional reform, youth employment, judicial independence' },
      { name: 'Pascal Affi N\'Guessan', party: 'FPI', role: 'Opposition Candidate', platform: 'National reconciliation, decentralization, social welfare' }
    ],
    keyIssues: [
      'Voter register credibility and inclusion of young electors',
      'Biometric voter identification technology performance',
      'Peaceful conduct and opposition acceptance of official tally'
    ],
    monitoringMission: 'AEO West Africa Electoral Integrity Research Desk'
  },
  {
    id: 'afr-2',
    date: '07 Dec 2028',
    title: 'Ghana General Election',
    subtitle: 'Africa · West Africa Landmark',
    status: 'Scheduled',
    region: 'africa',
    type: 'presidential',
    country: 'Ghana',
    location: 'Accra & 16 Regions, Ghana',
    electoralBody: 'Electoral Commission of Ghana (EC)',
    registeredVoters: '18,700,000 registered voters',
    pollingUnits: '40,000 polling stations',
    lgasCount: '275 Constituencies',
    description: 'Ghanaian presidential and parliamentary elections representing one of the most competitive democratic transitions in Sub-Saharan Africa.',
    sittingExecutive: {
      name: 'Incumbent President of Ghana',
      title: 'President of the Republic of Ghana',
      party: 'NPP / NDC',
      assumedOffice: 'January 2025',
      termInfo: 'Four-Year Presidential Term',
      notes: 'Ghana maintains a strict two-term constitutional limit for heads of state.'
    },
    participants: [
      { name: 'Dr. Mahamudu Bawumia', party: 'NPP (New Patriotic Party)', role: 'Flagbearer', platform: 'Digital transformation, credit scoring systems, gold-backed currency' },
      { name: 'John Dramani Mahama', party: 'NDC (National Democratic Congress)', role: 'Flagbearer', platform: '24-hour economy policy, anti-corruption, public health investment' }
    ],
    keyIssues: [
      'Biometric verification devices (BVD) operational efficiency',
      'Collation center security and media access transparency',
      'Bi-partisan trust in the Electoral Commission of Ghana'
    ],
    monitoringMission: 'AEO Continental Elections Observatory Panel'
  },
  {
    id: 'afr-3',
    date: 'May 2029',
    title: 'South Africa General Election',
    subtitle: 'Africa · Southern Africa Benchmark',
    status: 'Scheduled',
    region: 'africa',
    type: 'presidential',
    country: 'South Africa',
    location: 'Pretoria & 9 Provinces, South Africa',
    electoralBody: 'IEC (Electoral Commission of South Africa)',
    registeredVoters: '27,700,000 voters',
    pollingUnits: '23,292 voting stations',
    lgasCount: '52 Districts / Metros',
    description: 'National and Provincial elections in South Africa electing members of the National Assembly who subsequently elect the President.',
    sittingExecutive: {
      name: 'Cyril Ramaphosa',
      title: 'President of the Republic of South Africa',
      party: 'ANC (African National Congress)',
      assumedOffice: 'February 2018',
      termInfo: 'Government of National Unity (GNU)',
      notes: 'Leading South Africa\'s historic multi-party Government of National Unity.'
    },
    participants: [
      { name: 'Cyril Ramaphosa', party: 'ANC', role: 'Incumbent President', platform: 'Government of National Unity, energy grid restoration, job creation' },
      { name: 'John Steenhuisen', party: 'Democratic Alliance (DA)', role: 'GNU Partner / Minister', platform: 'Free market reforms, municipal service delivery, deregulation' },
      { name: 'Julius Malema', party: 'EFF (Economic Freedom Fighters)', role: 'Opposition Leader', platform: 'Land expropriation, state bank creation, mineral nationalization' },
      { name: 'Jacob Zuma', party: 'uMkhonto weSizwe (MK Party)', role: 'Opposition Leader', platform: 'Constitutional amendment, traditional authority empowerment' }
    ],
    keyIssues: [
      'Proportional representation and coalition government stability',
      'Voter turnout among youth cohort (18-29 age bracket)',
      'Electronic voter roll verification and voting station queuing times'
    ],
    monitoringMission: 'AEO Southern Africa Governance & Integrity Desk'
  }
];

export const DIARY_OTHER: DiaryItem[] = [
  {
    id: 'oth-1',
    date: '03 Nov 2026',
    title: 'United States Midterm Elections',
    subtitle: 'Other Continents · Global Reference',
    status: 'Scheduled',
    region: 'other',
    type: 'presidential',
    country: 'United States',
    location: 'United States (50 States & Territories)',
    electoralBody: 'State & County Election Boards',
    registeredVoters: '168,000,000 voters',
    pollingUnits: '100,000+ voting precincts',
    lgasCount: '3,143 Counties',
    description: 'United States federal elections held midway through the presidential term to elect all 435 members of the House of Representatives and 33 members of the Senate.',
    sittingExecutive: {
      name: 'Donald J. Trump',
      title: 'President of the United States',
      party: 'Republican Party (GOP)',
      assumedOffice: 'January 20, 2025',
      termInfo: 'Non-consecutive Second Term (2025–2029)',
      notes: 'Midterm elections determine Congressional majority power balance.'
    },
    participants: [
      { name: 'Republican Congressional Candidates', party: 'Republican Party (GOP)', role: 'House & Senate Candidates', platform: 'Border security, tax cuts, deregulation, energy independence' },
      { name: 'Democratic Congressional Candidates', party: 'Democratic Party', role: 'House & Senate Candidates', platform: 'Healthcare access, climate policy, voting rights legislation, worker protection' }
    ],
    keyIssues: [
      'Mail-in ballot reconciliation rules and state audit laws',
      'Electronic voting machine hardware security certification',
      'Congressional district redistricting and gerrymandering disputes'
    ],
    monitoringMission: 'AEO Global Comparative Electoral Systems Program'
  },
  {
    id: 'oth-2',
    date: 'Apr 2027',
    title: 'France Presidential Election',
    subtitle: 'Other Continents · European Benchmark',
    status: 'Scheduled',
    region: 'other',
    type: 'presidential',
    country: 'France',
    location: 'France & Overseas Territories',
    electoralBody: 'Conseil Constitutionnel / Ministère de l\'Intérieur',
    registeredVoters: '49,500,000 voters',
    pollingUnits: '35,000 polling stations',
    lgasCount: '101 Departments',
    description: 'Two-round direct popular vote election to elect the President of the French Republic for a five-year term.',
    sittingExecutive: {
      name: 'Emmanuel Macron',
      title: 'President of the French Republic',
      party: 'Renaissance',
      assumedOffice: 'May 14, 2017',
      termInfo: 'Second Term (2022–2027)',
      notes: 'Term limited following two consecutive presidential mandates.'
    },
    participants: [
      { name: 'Marine Le Pen / Jordan Bardella', party: 'Rassemblement National (RN)', role: 'Flagbearer', platform: 'National sovereignty, immigration restriction, purchasing power' },
      { name: 'Gabriel Attal / Centrist Candidate', party: 'Renaissance', role: 'Flagbearer', platform: 'European integration, industrial modernization, fiscal discipline' },
      { name: 'Jean-Luc Mélenchon Candidate', party: 'La France Insoumise (LFI)', role: 'Left-wing Flagbearer', platform: '6th Republic constitutional reform, wealth tax, price controls' }
    ],
    keyIssues: [
      'Two-round runoff voting system integrity',
      'Foreign election interference and digital disinformation monitoring',
      'Voter turnout across overseas departments'
    ],
    monitoringMission: 'AEO Comparative Democratic Research Desk'
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
    type: 'Roundtable',
    externalLink: 'https://forms.google.com/',
    links: [
      { label: 'View Our Publications', url: '/publications', external: false },
      { label: 'Submit Partner Cooperation Request', url: 'mailto:aeo@athenacentre.org', external: true }
    ]
  },
  {
    id: 'evt-2',
    month: 'SEP',
    day: '05',
    title: 'Post-Osun Findings Forum',
    description: 'Early observations from the Osun governorship monitoring.',
    location: 'Virtual',
    type: 'Public',
    externalLink: 'https://zoom.us/j/athenaosunfindings',
    links: [
      { label: 'View Our Publications', url: '/publications', external: false },
      { label: 'Submit Partner Cooperation Request', url: 'mailto:aeo@athenacentre.org', external: true }
    ]
  },
  {
    id: 'evt-3',
    month: 'NOV',
    day: '12',
    title: 'Democracy & Data Series',
    description: 'Evidence in election observation — a practitioner workshop.',
    location: 'Lagos',
    type: 'Workshop',
    externalLink: 'https://forms.google.com/',
    links: [
      { label: 'View Our Publications', url: '/publications', external: false },
      { label: 'Submit Partner Cooperation Request', url: 'mailto:aeo@athenacentre.org', external: true }
    ]
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

export const WEEKLY_ISSUES: WeeklyIssue[] = [];

export const ANNOUNCEMENTS: AnnouncementItem[] = [];
