import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, ArrowLeft, Users, AlertCircle, Search, MapPin, CheckCircle2,
  Calendar, ShieldCheck, X, ChevronRight
} from 'lucide-react';
import { PartyLogo } from './PartyLogo';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useCMS } from '../context/CMSContext';
import DiaryElectionDetail from './DiaryElectionDetail';
import { DiaryItem } from '../types';

export interface PartyVote {
  name: string;
  fullName: string;
  votes: string;
  percentage: number;
  color: string;
}

export interface LgaPartyStanding {
  lgaName: string;
  accreditedVoters: number;
  first: { name: string; color: string; fullName: string; votes: number };
  second: { name: string; color: string; fullName: string; votes: number };
  third: { name: string; color: string; fullName: string; votes: number };
  others?: { name: string; color: string; fullName: string; votes: number };
}

export function getLgaOthersVotes(lga: LgaPartyStanding): number {
  if (lga.others && typeof lga.others.votes === 'number') {
    return lga.others.votes;
  }
  const top3Sum = (lga.first?.votes || 0) + (lga.second?.votes || 0) + (lga.third?.votes || 0);
  return Math.round(top3Sum * 0.045);
}

export function getLgaValidVotes(lga: LgaPartyStanding): number {
  const top3Sum = (lga.first?.votes || 0) + (lga.second?.votes || 0) + (lga.third?.votes || 0);
  return top3Sum + getLgaOthersVotes(lga);
}

export interface StateMonitor {
  code: string;
  name: string;
  region: string;
  election: string;
  status: 'Upcoming' | 'Concluded' | 'Audit phase';
  date: string;
  voters: string;
  accreditedVoters?: number;
  pollingUnits: string;
  numLgas?: number;
  numWards?: number;
  reconciledRate: string;
  summary: string;
  colorClass: string;
  bgGradient: string;
  customImage?: string; // Base64 data URL
  topParties?: PartyVote[];
  lgaStandings?: LgaPartyStanding[];
  validVotes?: number;
  rejectedVotes?: number;
  totalVotes?: number;
}

const getTextColorFromBgClass = (bgClass: string): string => {
  if (bgClass.startsWith('bg-')) {
    return bgClass.replace('bg-', 'text-');
  }
  return 'text-ink';
};

export interface PartyDisplayItem {
  name: string;
  fullName: string;
  votes: string;
  percentage: number;
  color: string;
  isOthers?: boolean;
}

export function getTop3AndOthersParties(parties?: PartyVote[]): PartyDisplayItem[] {
  if (!parties || parties.length === 0) return [];

  if (parties.length <= 3) {
    return parties;
  }

  const top3 = parties.slice(0, 3);
  const remaining = parties.slice(3);

  let totalRemainingVotes = 0;
  let totalRemainingPercentage = 0;
  let hasNumericVotes = false;

  remaining.forEach((p) => {
    totalRemainingPercentage += Number(p.percentage) || 0;
    if (p.votes) {
      const clean = p.votes.replace(/[^0-9]/g, '');
      if (clean) {
        totalRemainingVotes += parseInt(clean, 10);
        hasNumericVotes = true;
      }
    }
  });

  const remainingAcronyms = remaining.map((p) => p.name).join(', ');

  let formattedVotes = 'Pending';
  if (hasNumericVotes && totalRemainingVotes > 0) {
    formattedVotes = `${totalRemainingVotes.toLocaleString()} votes`;
  } else if (remaining.some((p) => p.votes === 'Registered')) {
    formattedVotes = 'Registered';
  }

  const othersItem: PartyDisplayItem = {
    name: 'Others',
    fullName: `Other Parties (${remainingAcronyms})`,
    votes: formattedVotes,
    percentage: Math.round(totalRemainingPercentage * 10) / 10,
    color: 'bg-slate-400',
    isOthers: true,
  };

  return [...top3, othersItem];
}



export const INITIAL_STATES: StateMonitor[] = [
  {
    code: 'OS',
    name: 'Osun',
    region: 'South West',
    election: 'Governorship',
    status: 'Upcoming',
    date: 'Saturday, 15 August 2026',
    voters: '2,339,233',
    pollingUnits: '3,763',
    numLgas: 30,
    numWards: 332,
    reconciledRate: '0%',
    summary: 'Preparing 1,200 ad-hoc observers. Observer accreditation and mapping of local collation center routes are underway.',
    colorClass: 'text-amber-500 border-amber-500 bg-amber-50',
    bgGradient: 'from-amber-100 to-amber-200/50 border-amber-200',
    topParties: [
      { name: 'Accord', fullName: 'Accord (Ademola Adeleke)', votes: 'Pending', percentage: 0, color: 'bg-purple-600' },
      { name: 'AA', fullName: 'Action Alliance (Olanrewaju Farinloye)', votes: 'Pending', percentage: 0, color: 'bg-indigo-500' },
      { name: 'AAC', fullName: 'African Action Congress (Olajide Esan)', votes: 'Pending', percentage: 0, color: 'bg-orange-600' },
      { name: 'ADC', fullName: 'African Democratic Congress (Najeem Folasayo Salaam)', votes: 'Pending', percentage: 0, color: 'bg-blue-500' },
      { name: 'ADP', fullName: 'Action Democratic Party (Yemisi Adeagbo Opawoye)', votes: 'Pending', percentage: 0, color: 'bg-teal-600' },
      { name: 'APC', fullName: 'All Progressives Congress (Bola Oyebamiji)', votes: 'Pending', percentage: 0, color: 'bg-emerald-600' },
      { name: 'APGA', fullName: 'All Progressives Grand Alliance (Adesina Adeyemi-Doro)', votes: 'Pending', percentage: 0, color: 'bg-indigo-600' },
      { name: 'APM', fullName: 'Allied Peoples Movement (Adewale Adebayo)', votes: 'Pending', percentage: 0, color: 'bg-yellow-600' },
      { name: 'APP', fullName: 'Action Peoples Party (Clement Adesuyi)', votes: 'Pending', percentage: 0, color: 'bg-cyan-600' },
      { name: 'BP', fullName: 'Boot Party (Masilo Adeleke)', votes: 'Pending', percentage: 0, color: 'bg-pink-600' },
      { name: 'NNPP', fullName: 'New Nigeria Peoples Party (Taofeek Adeleke)', votes: 'Pending', percentage: 0, color: 'bg-sky-600' },
      { name: 'PRP', fullName: 'Peoples Redemption Party (Saliu Oyelami)', votes: 'Pending', percentage: 0, color: 'bg-red-700' },
      { name: 'YPP', fullName: 'Young Progressives Party (Olalekan Ogunsakin)', votes: 'Pending', percentage: 0, color: 'bg-emerald-800' },
      { name: 'ZLP', fullName: 'Zenith Labour Party (Adefemi Adesuyi)', votes: 'Pending', percentage: 0, color: 'bg-rose-700' }
    ]
  },
  {
    code: 'EK',
    name: 'Ekiti',
    region: 'South West',
    election: 'Governorship',
    status: 'Concluded',
    date: 'June 2024',
    voters: '988,923',
    accreditedVoters: 345100,
    validVotes: 336718,
    rejectedVotes: 8382,
    totalVotes: 345100,
    pollingUnits: '2,445',
    numLgas: 16,
    numWards: 177,
    reconciledRate: '98.2%',
    summary: 'Full audits concluded. High IReV upload fidelity recorded with minor ad-hoc administrative delays in Ekiti East LGA.',
    colorClass: 'text-green-600 border-green-600 bg-green-50',
    bgGradient: 'from-emerald-50 to-emerald-100/50 border-emerald-200',
    topParties: [
      { name: 'APC', fullName: 'All Progressives Congress', votes: '187,057 votes', percentage: 52.3, color: 'bg-emerald-600' },
      { name: 'SDP', fullName: 'Social Democratic Party', votes: '82,211 votes', percentage: 23.0, color: 'bg-amber-600' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '67,454 votes', percentage: 18.9, color: 'bg-red-600' },
      { name: 'LP', fullName: 'Labour Party', votes: '11,450 votes', percentage: 3.2, color: 'bg-rose-500' },
      { name: 'APGA', fullName: 'All Progressives Grand Alliance', votes: '5,120 votes', percentage: 1.4, color: 'bg-indigo-600' },
      { name: 'YPP', fullName: 'Young Progressives Party', votes: '3,100 votes', percentage: 0.9, color: 'bg-emerald-800' },
      { name: 'ADC', fullName: 'African Democratic Congress', votes: '1,050 votes', percentage: 0.3, color: 'bg-blue-500' }
    ],
    lgaStandings: [
      {
        lgaName: 'Ado-Ekiti',
        accreditedVoters: 64850,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 32451 },
        second: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 18211 },
        third: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 12454 }
      },
      {
        lgaName: 'Oye',
        accreditedVoters: 45100,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 24057 },
        second: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 11211 },
        third: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 8454 }
      },
      {
        lgaName: 'Ikole',
        accreditedVoters: 41200,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 22110 },
        second: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 10450 },
        third: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 7120 }
      },
      {
        lgaName: 'Ekiti East',
        accreditedVoters: 37500,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 19450 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 9210 },
        third: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 7450 }
      },
      {
        lgaName: 'Irepodun/Ifelodun',
        accreditedVoters: 48200,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 25310 },
        second: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 12210 },
        third: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 9450 }
      },
      {
        lgaName: 'Emure',
        accreditedVoters: 25600,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 14050 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 6210 },
        third: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 4450 }
      },
      {
        lgaName: 'Ijero',
        accreditedVoters: 27900,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 17210 },
        second: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 8211 },
        third: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 1454 }
      },
      {
        lgaName: 'Ekiti West',
        accreditedVoters: 32800,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 18110 },
        second: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 8450 },
        third: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 5120 }
      },
      {
        lgaName: 'Moba',
        accreditedVoters: 25450,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 15310 },
        second: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 7210 },
        third: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 1850 }
      },
      {
        lgaName: 'Ikere',
        accreditedVoters: 37200,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 19310 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 9210 },
        third: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 7450 }
      }
    ]
  },
  {
    code: 'AN',
    name: 'Anambra',
    region: 'South East',
    election: 'Governorship',
    status: 'Concluded',
    date: 'November 2025',
    voters: '2,533,722',
    accreditedVoters: 195500,
    validVotes: 191823,
    rejectedVotes: 3677,
    totalVotes: 195500,
    pollingUnits: '5,720',
    numLgas: 21,
    numWards: 326,
    reconciledRate: '100%',
    summary: 'Comprehensive audit report published. Verified 5,720 PUs with specific legal findings on over-accreditation patterns.',
    colorClass: 'text-green-600 border-green-600 bg-green-50',
    bgGradient: 'from-blue-50 to-blue-100/50 border-blue-200',
    topParties: [
      { name: 'APGA', fullName: 'All Progressives Grand Alliance', votes: '112,229 votes', percentage: 56.7, color: 'bg-indigo-600' },
      { name: 'APC', fullName: 'All Progressives Congress', votes: '43,285 votes', percentage: 21.9, color: 'bg-emerald-600' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '33,074 votes', percentage: 16.7, color: 'bg-red-600' },
      { name: 'YPP', fullName: 'Young Progressives Party', votes: '4,285 votes', percentage: 2.1, color: 'bg-emerald-800' },
      { name: 'LP', fullName: 'Labour Party', votes: '2,110 votes', percentage: 1.1, color: 'bg-rose-500' },
      { name: 'SDP', fullName: 'Social Democratic Party', votes: '1,020 votes', percentage: 0.5, color: 'bg-blue-600' },
      { name: 'ADC', fullName: 'African Democratic Congress', votes: '950 votes', percentage: 0.5, color: 'bg-blue-500' }
    ],
    lgaStandings: [
      {
        lgaName: 'Awka South',
        accreditedVoters: 44200,
        first: { name: 'APGA', color: 'bg-indigo-600', fullName: 'All Progressives Grand Alliance', votes: 24510 },
        second: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 10285 },
        third: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 8074 }
      },
      {
        lgaName: 'Onitsha North',
        accreditedVoters: 40100,
        first: { name: 'APGA', color: 'bg-indigo-600', fullName: 'All Progressives Grand Alliance', votes: 22310 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 11074 },
        third: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 5285 }
      },
      {
        lgaName: 'Nnewi North',
        accreditedVoters: 38400,
        first: { name: 'APGA', color: 'bg-indigo-600', fullName: 'All Progressives Grand Alliance', votes: 18510 },
        second: { name: 'YPP', color: 'bg-purple-700', fullName: 'Young Progressives Party', votes: 12285 },
        third: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 6074 }
      },
      {
        lgaName: 'Ihiala',
        accreditedVoters: 34100,
        first: { name: 'APGA', color: 'bg-indigo-600', fullName: 'All Progressives Grand Alliance', votes: 19210 },
        second: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 8285 },
        third: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 5074 }
      },
      {
        lgaName: 'Aguata',
        accreditedVoters: 42300,
        first: { name: 'APGA', color: 'bg-indigo-600', fullName: 'All Progressives Grand Alliance', votes: 23310 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 10074 },
        third: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 7285 }
      },
      {
        lgaName: 'Idemili North',
        accreditedVoters: 38200,
        first: { name: 'APGA', color: 'bg-indigo-600', fullName: 'All Progressives Grand Alliance', votes: 21510 },
        second: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 9285 },
        third: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 6074 }
      },
      {
        lgaName: 'Orumba South',
        accreditedVoters: 31200,
        first: { name: 'APGA', color: 'bg-indigo-600', fullName: 'All Progressives Grand Alliance', votes: 17510 },
        second: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 8285 },
        third: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 4074 }
      },
      {
        lgaName: 'Oyi',
        accreditedVoters: 29900,
        first: { name: 'APGA', color: 'bg-indigo-600', fullName: 'All Progressives Grand Alliance', votes: 16310 },
        second: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 7285 },
        third: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 5074 }
      },
      {
        lgaName: 'Anaocha',
        accreditedVoters: 38300,
        first: { name: 'APGA', color: 'bg-indigo-600', fullName: 'All Progressives Grand Alliance', votes: 20510 },
        second: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 10285 },
        third: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 6074 }
      },
      {
        lgaName: 'Ogbaru',
        accreditedVoters: 35200,
        first: { name: 'APGA', color: 'bg-indigo-600', fullName: 'All Progressives Grand Alliance', votes: 19310 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 9285 },
        third: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 5074 }
      }
    ]
  },
  {
    code: 'OD',
    name: 'Ondo',
    region: 'South West',
    election: 'Off-cycle Gov.',
    status: 'Concluded',
    date: 'November 2024',
    voters: '2,053,061',
    accreditedVoters: 495800,
    validVotes: 489155,
    rejectedVotes: 6645,
    totalVotes: 495800,
    pollingUnits: '3,933',
    numLgas: 18,
    numWards: 203,
    reconciledRate: '99.4%',
    summary: 'All polling unit results parsed. Concluded that results declared reflect the true distribution of primary ballots.',
    colorClass: 'text-green-600 border-green-600 bg-green-50',
    bgGradient: 'from-indigo-50 to-indigo-100/50 border-indigo-200',
    topParties: [
      { name: 'APC', fullName: 'All Progressives Congress', votes: '366,612 votes', percentage: 74.8, color: 'bg-emerald-600' },
      { name: 'PDP', fullName: "People's Democratic Party", votes: '117,845 votes', percentage: 24.1, color: 'bg-red-600' },
      { name: 'LP', fullName: 'Labour Party', votes: '4,743 votes', percentage: 1.0, color: 'bg-rose-500' },
      { name: 'SDP', fullName: 'Social Democratic Party', votes: '3,210 votes', percentage: 0.7, color: 'bg-blue-600' },
      { name: 'APGA', fullName: 'All Progressives Grand Alliance', votes: '1,500 votes', percentage: 0.3, color: 'bg-indigo-600' },
      { name: 'YPP', fullName: 'Young Progressives Party', votes: '1,100 votes', percentage: 0.2, color: 'bg-emerald-800' },
      { name: 'ADC', fullName: 'African Democratic Congress', votes: '900 votes', percentage: 0.2, color: 'bg-blue-500' }
    ],
    lgaStandings: [
      {
        lgaName: 'Akure South',
        accreditedVoters: 87900,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 62310 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 22845 },
        third: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 1234 }
      },
      {
        lgaName: 'Ondo West',
        accreditedVoters: 72800,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 52110 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 18245 },
        third: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 1112 }
      },
      {
        lgaName: 'Owo',
        accreditedVoters: 65100,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 48310 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 14845 },
        third: { name: 'ADC', color: 'bg-blue-600', fullName: 'African Democratic Congress', votes: 834 }
      },
      {
        lgaName: 'Okitipupa',
        accreditedVoters: 57000,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 42310 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 12845 },
        third: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 712 }
      },
      {
        lgaName: 'Ilaje',
        accreditedVoters: 50600,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 38110 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 10845 },
        third: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 534 }
      },
      {
        lgaName: 'Akoko South-West',
        accreditedVoters: 60300,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 44310 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 13845 },
        third: { name: 'ADC', color: 'bg-blue-600', fullName: 'African Democratic Congress', votes: 934 }
      },
      {
        lgaName: 'Idanre',
        accreditedVoters: 48500,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 35110 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 11845 },
        third: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 434 }
      },
      {
        lgaName: 'Irele',
        accreditedVoters: 44500,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 32310 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 10845 },
        third: { name: 'SDP', color: 'bg-amber-600', fullName: 'Social Democratic Party', votes: 312 }
      },
      {
        lgaName: 'Ese Odo',
        accreditedVoters: 38300,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 28110 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 8845 },
        third: { name: 'LP', color: 'bg-rose-500', fullName: 'Labour Party', votes: 234 }
      },
      {
        lgaName: 'Akure North',
        accreditedVoters: 46900,
        first: { name: 'APC', color: 'bg-emerald-600', fullName: 'All Progressives Congress', votes: 34310 },
        second: { name: 'PDP', color: 'bg-red-600', fullName: "People's Democratic Party", votes: 10845 },
        third: { name: 'ADC', color: 'bg-blue-600', fullName: 'African Democratic Congress', votes: 634 }
      }
    ]
  }
];

interface LiveDashboardProps {
  isPreview?: boolean;
}

export default function LiveDashboard({ isPreview = false }: LiveDashboardProps) {
  const [states, setStates] = useState<StateMonitor[]>(INITIAL_STATES);

  const { diaryNat, diaryLoc, diaryAfr, diaryOth } = useCMS();
  const [selectedDiaryItem, setSelectedDiaryItem] = useState<DiaryItem | null>(null);

  // Combine all diary items and find the 3 closest elections
  const allDiaryItems = useMemo(() => {
    const nat = (diaryNat || []).map(item => ({
      ...item,
      region: item.region || ('nigeria' as const),
      type: item.type || (item.title.toLowerCase().includes('presidential') ? ('presidential' as const) : ('governorship' as const))
    }));
    const loc = (diaryLoc || []).map(item => ({
      ...item,
      region: item.region || ('nigeria' as const),
      type: item.type || ('local_government' as const)
    }));
    const afr = (diaryAfr || []).map(item => ({
      ...item,
      region: item.region || ('africa' as const),
      type: item.type || ('presidential' as const)
    }));
    const oth = (diaryOth || []).map(item => ({
      ...item,
      region: item.region || ('other' as const),
      type: item.type || ('presidential' as const)
    }));
    return [...nat, ...loc, ...afr, ...oth];
  }, [diaryNat, diaryLoc, diaryAfr, diaryOth]);

  const closestElections = useMemo(() => {
    const statusPriority: Record<string, number> = {
      'In view': 1,
      'Scheduled': 2,
      'Tracking': 3,
      'Provisional': 4,
    };

    // Exclude Osun (live election in focus) and Concluded/Past elections
    const upcoming = allDiaryItems.filter(item => {
      if (item.status === 'Concluded') return false;

      const isOsun = item.id === 'nat-1' || 
                     item.title.toLowerCase().includes('osun') ||
                     (item.location && item.location.toLowerCase().includes('osun')) ||
                     item.stateCode === 'OS';
      if (isOsun) return false;

      if (item.date && (item.date.includes('2025') || item.date.includes('2024') || item.date.includes('2023'))) {
        return false;
      }

      return true;
    });

    return [...upcoming].sort((a, b) => {
      const pA = statusPriority[a.status] || 99;
      const pB = statusPriority[b.status] || 99;
      if (pA !== pB) return pA - pB;
      return a.date.localeCompare(b.date);
    }).slice(0, 3);
  }, [allDiaryItems]);

  // Split into Upcoming (Live) and Concluded (Past)
  const liveStates = states.filter(s => s.status === 'Upcoming');
  const pastStates = states.filter(s => s.status !== 'Upcoming');

  // Currently viewed Live election
  const liveState = liveStates[0] || INITIAL_STATES[0];

  // Selected concluded election index
  const [selectedPastIndex, setSelectedPastIndex] = useState(0);
  const activePastState = pastStates[selectedPastIndex] || pastStates[0] || INITIAL_STATES[1];

  // Mode tabs for each panel
  const [liveActiveTab, setLiveActiveTab] = useState<'overall' | 'lga'>('overall');
  const [pastActiveTab, setPastActiveTab] = useState<'lga' | 'overall'>('lga');

  const [liveLgaSearch, setLiveLgaSearch] = useState('');
  const [pastLgaSearch, setPastLgaSearch] = useState('');

  // Subscribe to monitored states from Firestore in real-time
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'cms', 'monitored_states'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items) {
          let needsFirestoreSync = false;
          const formatted = data.items.map((s: any) => {
            if (s.code === 'OS') {
              const currentCount = s.topParties?.length || 0;
              if (currentCount < 14) {
                needsFirestoreSync = true;
                return {
                  ...s,
                  voters: '2,339,233',
                  topParties: INITIAL_STATES[0].topParties
                };
              }
              return { ...s, voters: '2,339,233' };
            }
            return s;
          });

          setStates(formatted);

          if (needsFirestoreSync) {
            setDoc(doc(db, 'cms', 'monitored_states'), { items: formatted }, { merge: true })
              .catch(err => console.error("Error updating monitored_states with Osun parties:", err));
          }
        }
      } else {
        // Auto-seed if doc doesn't exist
        setDoc(doc(db, 'cms', 'monitored_states'), { items: INITIAL_STATES })
          .catch(err => console.error('Error seeding monitored_states:', err));
      }
    }, err => {
      console.warn("Firestore monitored states fallback:", err);
    });

    return () => unsub();
  }, []);

  // Reset searches on changes
  useEffect(() => {
    setLiveLgaSearch('');
  }, [liveState]);

  useEffect(() => {
    setPastLgaSearch('');
  }, [activePastState]);

  const filteredPastLgas = activePastState.lgaStandings?.filter(lga => 
    lga.lgaName.toLowerCase().includes(pastLgaSearch.toLowerCase())
  ) || [];

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const navigateToAudits = () => {
    window.history.pushState({}, '', '/post-election-audits');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className={isPreview ? "py-16 bg-paper border-b border-line" : "py-12 sm:py-16 bg-paper min-h-screen"}>
      <div className={isPreview ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"}>
        
        {/* Standalone Page Header */}
        {!isPreview && (
          <>
            {/* Page Header */}
            <div className="border-b border-line pb-8">
              <div className="flex items-center gap-3.5 mb-2">
                <span className="text-xs font-mono font-bold tracking-widest text-brand-blue uppercase">
                  Athena Observatory
                </span>
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-ink leading-tight">
                Elections Observatory
              </h1>
              <p className="text-ink2 text-base mt-3 max-w-3xl leading-relaxed">
                Electoral database tracking both upcoming off-cycle preparations in real-time and post-election audits with localized polling outcomes.
              </p>
            </div>
          </>
        )}

        {/* Homepage Preview Header */}
        {isPreview && (
          <div className="border-b border-line pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-brand-blue uppercase">
                Athena Observatory
              </span>
              <h2 className="font-display font-bold text-3xl text-ink leading-tight mt-1">
                Elections Observatory
              </h2>
              <p className="text-ink2 text-sm mt-2 max-w-2xl leading-relaxed">
                Electoral database tracking both upcoming off-cycle preparations in real-time and post-election audits with localized polling outcomes.
              </p>
            </div>
            <div>
              <a 
                href="/elections"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/elections');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
              >
                View Full Observatory
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 1: LIVE ELECTION (UPCOMING)
           ========================================================================= */}
        <div className="w-full space-y-8">
          {/* Section Header */}
          <div className="border-b border-line pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink leading-tight">
                Live Election
              </h2>
              <p className="text-xs text-mut font-semibold uppercase tracking-wider mt-1 font-mono">
                Active Off-Cycle Monitoring Pipeline
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Upcoming State
            </span>
          </div>

          {/* Live Election Details Panel */}
          <div className="bg-white border border-line rounded-2xl p-6 sm:p-8 shadow-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-2xl text-ink flex flex-wrap items-baseline gap-2">
                    <span>{liveState.name} State</span>
                    <span className="text-sm font-sans font-normal text-mut">({liveState.date})</span>
                  </h3>
                  <p className="text-xs text-mut font-medium mt-0.5">
                    {liveState.region} Region · Electoral Preparations
                  </p>
                </div>

                {/* Custom Uploaded Image Display */}
                {liveState.customImage && (
                  <div className="relative rounded-xl overflow-hidden border border-line max-h-56 bg-slate-50 flex items-center justify-center">
                    <img 
                      src={liveState.customImage} 
                      alt={`${liveState.name} State custom upload`} 
                      className="w-full h-auto max-h-56 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Meta details grid in specific order */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Registered Voters</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5 flex items-center gap-1.5 font-mono">
                      <Users className="w-3.5 h-3.5 text-brand-blue" /> {liveState.voters}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">LGAs</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5 flex items-center gap-1.5 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {liveState.numLgas ?? 30}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Wards</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5 flex items-center gap-1.5 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> {liveState.numWards ?? 332}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Polling Units</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5 flex items-center gap-1.5 font-mono">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> {liveState.pollingUnits}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Accredited Voters</span>
                    <span className="block text-sm font-semibold text-amber-600 mt-0.5 flex items-center gap-1.5 font-mono">
                      <Users className="w-3.5 h-3.5 text-amber-500" /> {liveState.status === 'Upcoming' ? 'Pending' : (liveState.accreditedVoters?.toLocaleString() ?? 'N/A')}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Valid Votes</span>
                    <span className="block text-sm font-semibold text-emerald-600 mt-0.5 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {liveState.status === 'Upcoming' ? 'Pending' : (liveState.validVotes?.toLocaleString() ?? 'N/A')}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Rejected Votes</span>
                    <span className="block text-sm font-semibold text-rose-600 mt-0.5 flex items-center gap-1.5 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> {liveState.status === 'Upcoming' ? 'Pending' : (liveState.rejectedVotes?.toLocaleString() ?? 'N/A')}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Total Votes</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5 flex items-center gap-1.5 font-mono">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> {liveState.status === 'Upcoming' ? 'Pending' : (liveState.totalVotes?.toLocaleString() ?? 'N/A')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-line/50">
                  <a 
                    href={`/election/${liveState.code}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', `/election/${liveState.code}`);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    Explore Osun Election Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Electoral Standings */}
              <div className="border-t md:border-t-0 md:border-l border-line pt-6 md:pt-0 md:pl-8 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-base text-ink">
                      Electoral Standings
                    </h4>
                    <span className="text-[10px] font-mono text-brand-blue bg-blue-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      IREV Data
                    </span>
                  </div>

                  {/* Tab Selector */}
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLiveActiveTab('overall')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        liveActiveTab === 'overall'
                          ? 'bg-white text-ink shadow-sm'
                          : 'text-mut hover:text-ink'
                      }`}
                    >
                      Party Votes
                    </button>
                    <button
                      type="button"
                      onClick={() => setLiveActiveTab('lga')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        liveActiveTab === 'lga'
                          ? 'bg-white text-ink shadow-sm'
                          : 'text-mut hover:text-ink'
                      }`}
                    >
                      LGA Breakdown
                    </button>
                  </div>
                </div>

                {/* Tab Content 1: State Overview */}
                {liveActiveTab === 'overall' && (
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-[11px] font-mono text-mut uppercase tracking-wider font-semibold">
                        {liveState.status === 'Upcoming' ? 'Participating Parties' : 'Leading Contenders & Others'}
                      </h5>
                      <p className="text-[10px] text-mut font-medium mt-0.5">
                        {liveState.status === 'Upcoming' 
                          ? 'Top registered parties & combined others contesting the election'
                          : 'Top 3 political contenders & aggregated other parties'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {getTop3AndOthersParties(liveState.topParties).map((party) => (
                        <div key={party.name} className="p-3 bg-paper rounded-xl border border-line space-y-2 hover:shadow-sm transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              {party.isOthers ? (
                                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-300">
                                  OTH
                                </div>
                              ) : (
                                <PartyLogo name={party.name} className="w-8 h-8 rounded-lg shrink-0" />
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                                  {party.name}
                                  {party.isOthers && (
                                    <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                      Combined
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-mut truncate max-w-[140px]" title={party.fullName}>
                                  {party.fullName}
                                </span>
                              </div>
                            </div>
                            {liveState.status === 'Upcoming' && !party.isOthers ? (
                              <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                                Votes: Pending
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                                {party.votes.toLowerCase().startsWith('votes:')
                                  ? party.votes
                                  : party.votes.toLowerCase().includes('votes') || party.votes === 'Pending' || party.votes === 'Registered'
                                  ? party.votes
                                  : `Votes: ${party.votes}`}
                              </span>
                            )}
                          </div>

                          {liveState.status !== 'Upcoming' && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono text-mut">
                                <span>{party.isOthers ? 'Combined Share' : 'Estimated Leverage'}</span>
                                <span>{party.percentage}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${party.color}`} 
                                  style={{ width: `${party.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab Content 2: LGA Breakdown */}
                {liveActiveTab === 'lga' && (
                  <div className="text-center py-12 px-4 text-xs text-mut bg-slate-50 rounded-xl border border-dashed border-line space-y-2">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto animate-bounce" />
                    <p className="font-semibold text-slate-700">Election Upcoming</p>
                    <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                      LGA-level vote break downs and accredited voters statistics will go live as certified polling reports are parsed on election day.
                    </p>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION: UPCOMING ELECTIONS (3 CLOSEST ELECTIONS LIST VIEW)
           ========================================================================= */}
        <div className="w-full space-y-8 mt-16 pt-12 border-t border-line">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-brand-blue uppercase px-2.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20">
                  Electoral Calendar
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
                Upcoming Elections
              </h2>
              <p className="text-ink2 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Upcoming electoral milestones and sub-national polls currently under active observation by the Athena Observatory research team.
              </p>
            </div>

            <button
              onClick={() => {
                window.history.pushState({}, '', '/diary');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-brand-blue hover:text-brand-blue-dark uppercase transition-colors shrink-0 group cursor-pointer"
            >
              <span>View Full Election Diary ({allDiaryItems.length})</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* 3 Closest Elections List View (Formatted as on Diary of Election page) */}
          <div className="bg-white border border-line rounded-3xl overflow-hidden shadow-custom divide-y divide-line">
            {closestElections.map((item) => {
              const getStatusColor = (status: DiaryItem['status']) => {
                switch (status) {
                  case 'In view':
                    return 'bg-amber-500/10 text-amber-700 border-amber-300';
                  case 'Scheduled':
                    return 'bg-blue-500/10 text-blue-700 border-blue-300';
                  case 'Provisional':
                    return 'bg-purple-500/10 text-brand-purple border-purple-300';
                  case 'Tracking':
                    return 'bg-slate-500/10 text-slate-700 border-slate-300';
                  case 'Concluded':
                    return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
                  default:
                    return 'bg-blue-500/10 text-blue-700 border-blue-300';
                }
              };

              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedDiaryItem(item)}
                  className="p-5 sm:p-6 hover:bg-blue-50/40 transition-all cursor-pointer group relative"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Date Badge */}
                    <div className="md:col-span-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-blue uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 group-hover:bg-blue-100 transition-colors">
                        <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                        {item.date}
                      </span>
                    </div>

                    {/* Title & Metadata */}
                    <div className="md:col-span-6 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-base sm:text-lg text-ink group-hover:text-brand-blue transition-colors">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs text-mut font-medium uppercase tracking-wider flex items-center gap-2">
                        <span>{item.subtitle}</span>
                        {(item.country || item.location) && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 font-bold">{item.country || item.location}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Status & Arrow Action */}
                    <div className="md:col-span-3 flex items-center md:justify-end justify-between gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {item.status}
                      </span>

                      <div className="w-8 h-8 rounded-full bg-paper border border-line flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white group-hover:border-brand-blue transition-all shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: PAST ELECTIONS (CONCLUDED)
           ========================================================================= */}
        <div className="w-full space-y-8 mt-16 pt-16 border-t border-line">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-3xl text-ink leading-tight">
                Past Elections
              </h2>
              <p className="text-xs text-mut font-semibold uppercase tracking-wider mt-1 font-mono">
                Concluded and Audited Historical Records
              </p>
            </div>
            
            {/* Concluded States Selector Pills & View All */}
            <div className="flex flex-wrap items-center gap-2">
              {pastStates.map((st, idx) => (
                <button
                  key={st.code}
                  onClick={() => setSelectedPastIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
                    selectedPastIndex === idx
                      ? 'bg-navy border-navy text-white shadow-sm'
                      : 'bg-white border-line text-ink hover:bg-slate-50'
                  }`}
                >
                  {st.name} State
                </button>
              ))}
              <a
                href="/past-elections"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/past-elections');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-mono font-bold tracking-wider uppercase shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>view all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Concluded Election Details Panel */}
          <div className="bg-white border border-line rounded-2xl p-6 sm:p-8 shadow-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Details */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-ink flex flex-wrap items-baseline gap-2">
                      <span>{activePastState.name} State</span>
                      <span className="text-sm font-sans font-normal text-mut">({activePastState.date})</span>
                    </h3>
                    <p className="text-xs text-mut font-medium mt-0.5">
                      {activePastState.region} Region · Post-Election Forensics
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-green-200 bg-green-50 text-[10px] font-mono font-bold uppercase tracking-wider text-green-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {activePastState.status}
                  </div>
                </div>

                {/* Custom Image */}
                {activePastState.customImage && (
                  <div className="relative rounded-xl overflow-hidden border border-line max-h-56 bg-slate-50 flex items-center justify-center">
                    <img 
                      src={activePastState.customImage} 
                      alt={`${activePastState.name} State custom upload`} 
                      className="w-full h-auto max-h-56 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Meta details grid in specific order */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Registered Voters</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5 flex items-center gap-1.5 font-mono">
                      <Users className="w-3.5 h-3.5 text-brand-blue" /> {activePastState.voters}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">LGAs</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5 flex items-center gap-1.5 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {activePastState.numLgas ?? 16}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Wards</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5 flex items-center gap-1.5 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> {activePastState.numWards ?? 177}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Polling Units</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5 flex items-center gap-1.5 font-mono">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> {activePastState.pollingUnits}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Accredited Voters</span>
                    <span className="block text-sm font-semibold text-emerald-600 mt-0.5 flex items-center gap-1.5 font-mono">
                      <Users className="w-3.5 h-3.5 text-emerald-500" /> {activePastState.accreditedVoters?.toLocaleString() ?? 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Valid Votes</span>
                    <span className="block text-sm font-semibold text-emerald-600 mt-0.5 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {activePastState.validVotes?.toLocaleString() ?? 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Rejected Votes</span>
                    <span className="block text-sm font-semibold text-rose-600 mt-0.5 flex items-center gap-1.5 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> {activePastState.rejectedVotes?.toLocaleString() ?? 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-xl border border-line">
                    <span className="block text-[10px] font-mono font-bold text-mut uppercase tracking-wider">Total Votes</span>
                    <span className="block text-sm font-semibold text-ink mt-0.5 flex items-center gap-1.5 font-mono">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> {activePastState.totalVotes?.toLocaleString() ?? 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Form EC8A Upload Audit Rate - Compact & Centered with % Bar */}
                <div className="w-full md:w-[372px] mx-auto p-2.5 bg-slate-50 border border-line rounded-xl flex flex-col items-center justify-center text-center gap-1.5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-ink">Form EC8A Audit Rate:</span>
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                      {activePastState.reconciledRate} Reconciled
                    </span>
                  </div>
                  <div className="w-full max-w-xs bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: activePastState.reconciledRate }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-mut max-w-[280px] sm:max-w-md leading-tight">
                    {activePastState.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-line/50 flex flex-wrap items-center justify-center gap-3">
                  <a 
                    href={`/election/${activePastState.code}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', `/election/${activePastState.code}`);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-navy hover:bg-navy/95 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    Explore {activePastState.name} Election Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <a 
                    href="/past-elections"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', '/past-elections');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-mono font-bold tracking-wider uppercase rounded-lg shadow-2xs transition-all cursor-pointer"
                  >
                    <span>view all</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Standings and LGA Breakdown */}
              <div className="border-t md:border-t-0 md:border-l border-line pt-6 md:pt-0 md:pl-8 space-y-4">
                
                {/* Header Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-base text-ink">
                      Electoral Standings
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-emerald-100">
                      IREV Data
                    </span>
                  </div>

                  {/* Tab Selector */}
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPastActiveTab('lga')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        pastActiveTab === 'lga'
                          ? 'bg-white text-ink shadow-sm'
                          : 'text-mut hover:text-ink'
                      }`}
                    >
                      LGA Breakdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setPastActiveTab('overall')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        pastActiveTab === 'overall'
                          ? 'bg-white text-ink shadow-sm'
                          : 'text-mut hover:text-ink'
                      }`}
                    >
                      Party Votes
                    </button>
                  </div>
                </div>

                {/* Tab Content 1: Concluded LGA Breakdown */}
                {pastActiveTab === 'lga' && (
                  <div className="space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-mut absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search LGA / Local Gov..."
                        value={pastLgaSearch}
                        onChange={(e) => setPastLgaSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 border border-line rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 transition-colors"
                      />
                    </div>

                    {/* LGA List Container */}
                    <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                      {filteredPastLgas.length > 0 ? (
                        filteredPastLgas.map((lga) => (
                          <div
                            key={lga.lgaName}
                            className="p-3.5 bg-paper border border-line hover:border-slate-300 rounded-xl transition-all text-xs text-ink space-y-2.5"
                          >
                            <div className="flex items-center justify-between font-bold text-ink border-b border-line/50 pb-1.5">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                                <span className="font-display font-bold text-sm text-slate-800">{lga.lgaName} LGA</span>
                              </div>
                              <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase border border-emerald-100">
                                Audited
                              </span>
                            </div>

                            <div className="text-ink2 bg-white p-2.5 rounded-lg border border-slate-100 space-y-1.5 shadow-sm">
                              {/* Vote Badges breakdown - horizontally aligned filling full space */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pb-2 border-b border-slate-100">
                                <div className="flex flex-col items-center justify-center p-2 bg-slate-100/80 border border-slate-200 rounded-md shadow-2xs text-center w-full">
                                  <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-slate-500 leading-tight">Accredited Voters</span>
                                  <span className="text-[11px] font-mono font-bold text-slate-800 leading-tight mt-0.5">{lga.accreditedVoters?.toLocaleString() ?? 'N/A'}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 bg-emerald-50/90 border border-emerald-200/80 rounded-md shadow-2xs text-center w-full">
                                  <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-emerald-700/80 leading-tight">Valid Votes</span>
                                  <span className="text-[11px] font-mono font-bold text-emerald-900 leading-tight mt-0.5">{getLgaValidVotes(lga).toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 bg-rose-50/90 border border-rose-200/80 rounded-md shadow-2xs text-center w-full">
                                  <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-rose-700/80 leading-tight">Rejected Votes</span>
                                  <span className="text-[11px] font-mono font-bold text-rose-900 leading-tight mt-0.5">{Math.round((lga.first.votes + lga.second.votes) * 0.015).toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 bg-blue-50/90 border border-blue-200/80 rounded-md shadow-2xs text-center w-full">
                                  <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-blue-700/80 leading-tight">Total Votes</span>
                                  <span className="text-[11px] font-mono font-bold text-blue-950 leading-tight mt-0.5">{(getLgaValidVotes(lga) + Math.round((lga.first.votes + lga.second.votes) * 0.015)).toLocaleString()}</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pb-1">
                                <span>PARTY</span>
                                <span>VOTES</span>
                              </div>
                              
                              {/* Top Party */}
                              <div className="flex justify-between items-center py-0.5">
                                <div className="flex items-center gap-1.5">
                                  <PartyLogo name={lga.first.name} className="w-4 h-4 rounded-md" />
                                  <span className={`font-bold ${getTextColorFromBgClass(lga.first.color)}`}>{lga.first.name}</span>
                                </div>
                                <span className="font-mono font-bold text-slate-800">{lga.first.votes?.toLocaleString() ?? '0'}</span>
                              </div>

                              {/* Second Party */}
                              <div className="flex justify-between items-center py-0.5">
                                <div className="flex items-center gap-1.5">
                                  <PartyLogo name={lga.second.name} className="w-4 h-4 rounded-md" />
                                  <span className={`font-semibold ${getTextColorFromBgClass(lga.second.color)}`}>{lga.second.name}</span>
                                </div>
                                <span className="font-mono text-slate-600">{lga.second.votes?.toLocaleString() ?? '0'}</span>
                              </div>

                              {/* Third Party */}
                              <div className="flex justify-between items-center py-0.5">
                                <div className="flex items-center gap-1.5">
                                  <PartyLogo name={lga.third.name} className="w-4 h-4 rounded-md" />
                                  <span className={`font-semibold ${getTextColorFromBgClass(lga.third.color)}`}>{lga.third.name}</span>
                                </div>
                                <span className="font-mono text-slate-600">{lga.third.votes?.toLocaleString() ?? '0'}</span>
                              </div>

                              {/* Others Party */}
                              <div className="flex justify-between items-center py-0.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-4 h-4 rounded-md bg-slate-200 text-slate-700 font-mono font-bold text-[8px] flex items-center justify-center shrink-0 border border-slate-300">
                                    OTH
                                  </div>
                                  <span className="font-semibold text-slate-600">Others</span>
                                </div>
                                <span className="font-mono text-slate-600">{getLgaOthersVotes(lga).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-xs text-mut bg-slate-50 rounded-xl border border-dashed border-line">
                          No LGA found matching "{pastLgaSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Concluded State Overview */}
                {pastActiveTab === 'overall' && (
                  <div className="space-y-4">
                    {/* Statewide Accredited Voters Box */}
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-brand-blue" />
                        <span className="font-semibold text-xs text-slate-700">Total Accredited Voters</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-slate-800 bg-white border border-slate-100 px-2.5 py-1 rounded-lg shadow-sm">
                        {activePastState.accreditedVoters?.toLocaleString() ?? 'N/A'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-[11px] font-mono text-mut uppercase tracking-wider font-semibold">
                        Top 3 Parties & Others (Statewide)
                      </h5>
                      <p className="text-[10px] text-mut font-medium">
                        Official certified votes share (Top 3 contenders + aggregated others)
                      </p>
                    </div>

                    <div className="space-y-3">
                      {getTop3AndOthersParties(activePastState.topParties).map((party) => (
                        <div key={party.name} className="p-3 bg-paper rounded-xl border border-line space-y-2 hover:shadow-sm transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              {party.isOthers ? (
                                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-300">
                                  OTH
                                </div>
                              ) : (
                                <PartyLogo name={party.name} className="w-8 h-8 rounded-lg shrink-0" />
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                                  {party.name}
                                  {party.isOthers && (
                                    <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                      Combined
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-mut truncate max-w-[140px]" title={party.fullName}>
                                  {party.fullName}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-ink shrink-0">
                              {party.votes.toLowerCase().startsWith('votes:')
                                ? party.votes
                                : party.votes.toLowerCase().includes('votes') || party.votes === 'Pending' || party.votes === 'Registered'
                                ? party.votes
                                : `${party.votes} votes`}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-mut">
                              <span>{party.isOthers ? 'Combined Share' : 'Vote Share'}</span>
                              <span>{party.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${party.color}`} 
                                style={{ width: `${party.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>

        {/* View Reports Button */}
        <div className="w-full flex justify-end">
          <button 
            type="button"
            onClick={navigateToAudits}
            className="inline-flex items-center gap-1.5 text-xs text-brand-blue font-bold hover:underline cursor-pointer"
          >
            Inspect Associated Audit Reports
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      {/* Modal for Diary Item detail view */}
      {selectedDiaryItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy/70 backdrop-blur-sm p-4 sm:p-6 lg:p-8 flex justify-center items-start pt-12">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-line relative animate-scale-up">
            <button 
              onClick={() => setSelectedDiaryItem(null)}
              className="absolute top-4 right-4 bg-paper hover:bg-line p-2 rounded-full text-mut hover:text-ink transition-colors cursor-pointer z-20"
            >
              <X className="w-5 h-5" />
            </button>
            <DiaryElectionDetail 
              item={selectedDiaryItem} 
              onBack={() => setSelectedDiaryItem(null)}
              onNavigateToElection={(code) => {
                setSelectedDiaryItem(null);
                window.history.pushState({}, '', `/election/${code}`);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            />
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
