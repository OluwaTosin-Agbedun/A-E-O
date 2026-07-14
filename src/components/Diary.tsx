import { useState } from 'react';
import { Calendar, Tag, Layers, Landmark, Info, MapPin } from 'lucide-react';
import { DIARY_NATIONAL, DIARY_LOCAL, DIARY_AFRICA, DIARY_OTHER } from '../data';
import { DiaryItem } from '../types';

export default function Diary() {
  const [activeTab, setActiveTab] = useState<'national' | 'local' | 'africa' | 'other'>('national');

  const getActiveData = (): DiaryItem[] => {
    switch (activeTab) {
      case 'national': return DIARY_NATIONAL;
      case 'local': return DIARY_LOCAL;
      case 'africa': return DIARY_AFRICA;
      case 'other': return DIARY_OTHER;
    }
  };

  const getStatusColor = (status: DiaryItem['status']) => {
    switch (status) {
      case 'In view':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Provisional':
        return 'bg-purple-50 text-brand-purple border-purple-200';
      case 'Tracking':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Concluded':
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const tabsConfig = [
    { id: 'national', label: 'Nigeria — National', icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: 'local', label: 'Local Government', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'africa', label: 'Africa Referrals', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'other', label: 'Other Countries', icon: <Calendar className="w-3.5 h-3.5" /> }
  ] as const;

  return (
    <section className="py-16 bg-white border-b border-line" id="diary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="eyebrow text-brand-blue font-semibold">Electoral Timelines</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2 mb-4 leading-tight">
            Diary of Election — every poll, on one calendar
          </h2>
          <p className="text-ink2 text-base">
            Election timelines mapped across four distinct tiers: national processes, state local government councils, African referrals, and comparative global references.
          </p>
        </div>

        {/* Tab Selection Row */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-line pb-4">
          {tabsConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide font-mono uppercase border transition-all cursor-pointer focus:outline-none ${
                activeTab === tab.id
                  ? 'bg-navy border-navy text-white shadow-sm'
                  : 'bg-paper hover:bg-line border-line text-ink2'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calendar Rows Container */}
        <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-custom">
          {getActiveData().map((item, idx) => (
            <div 
              key={item.id}
              className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-5 sm:p-6 hover:bg-paper/40 transition-colors border-b border-line last:border-b-0`}
            >
              {/* Date Column */}
              <div className="md:col-span-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-blue uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.date}
                </span>
              </div>

              {/* Title & Description Column */}
              <div className="md:col-span-6 space-y-1">
                <h4 className="font-display font-bold text-base sm:text-lg text-ink">
                  {item.title}
                </h4>
                <p className="text-xs text-mut font-medium uppercase tracking-wider">
                  {item.subtitle}
                </p>
              </div>

              {/* Status and Action Column */}
              <div className="md:col-span-3 flex items-center md:justify-end justify-start gap-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="mt-4 flex items-start gap-2 text-xs text-mut max-w-2xl bg-paper p-3 rounded-lg border border-line">
          <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
          <span>
            Due to the recent Supreme Court judgment on financial autonomy, state local government polls are experiencing fluid schedules. Athena continuously synchronizes with individual State Independent Electoral Commissions (SIECs).
          </span>
        </div>

      </div>
    </section>
  );
}
