import { useState } from 'react';
import { Shield, Database, FileSpreadsheet, Globe, HelpCircle } from 'lucide-react';

export default function Stats() {
  const [activeStat, setActiveStat] = useState<number | null>(null);

  const statsData = [
    {
      id: 1,
      title: 'States Monitored',
      value: '4+',
      sub: 'Anambra · Ondo · Ekiti · Osun',
      color: 'bg-gradient-to-br from-blue-600 to-navy-dark',
      icon: <Shield className="w-5 h-5 text-blue-200" />,
      detail: 'Our state-by-state deployment maps regional irregularities, accreditation compliance, and local collation workflows.'
    },
    {
      id: 2,
      title: 'Polling Units Audited',
      value: '12,000+',
      sub: 'Across recent off-cycle polls',
      color: 'bg-gradient-to-br from-green-600 to-green-950',
      icon: <Database className="w-5 h-5 text-green-200" />,
      detail: 'Every single audited unit has its Form EC8A manually cross-checked with BVAS machine registers for discrepancy metrics.'
    },
    {
      id: 3,
      title: 'Reports Published',
      value: '10+',
      sub: 'Forensic & analytical',
      color: 'bg-gradient-to-br from-brand-purple to-purple-950',
      icon: <FileSpreadsheet className="w-5 h-5 text-purple-200" />,
      detail: 'Includes peer-reviewed technology security whitepapers, post-election litigation reports, and procedural recommendations.'
    },
    {
      id: 4,
      title: 'Countries Tracked',
      value: '15',
      sub: 'Nigeria, Africa & beyond',
      color: 'bg-gradient-to-br from-slate-700 to-ink',
      icon: <Globe className="w-5 h-5 text-slate-300" />,
      detail: 'We track macro-democratic trends, regional election tribunals, and comparative electoral administration across West Africa.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsData.map((stat, idx) => (
          <div 
            key={stat.id}
            onClick={() => setActiveStat(activeStat === stat.id ? null : stat.id)}
            className={`${stat.color} text-white rounded-2xl p-5 sm:p-6 shadow-custom transform hover:-translate-y-1 transition-all cursor-pointer relative group overflow-hidden`}
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              {stat.icon}
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-semibold text-white/80 tracking-wider uppercase">
                {stat.title}
              </span>
              <span className="p-1.5 bg-white/10 rounded-lg">
                {stat.icon}
              </span>
            </div>

            <div className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-1">
              {stat.value}
            </div>

            <div className="text-xs text-white/80 leading-relaxed font-medium">
              {stat.sub}
            </div>

            {/* Click to expand detail box */}
            <div className={`mt-3 pt-3 border-t border-white/10 text-[11px] text-white/90 leading-relaxed transition-all duration-300 ${activeStat === stat.id ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              {stat.detail}
            </div>
            
            <div className="absolute bottom-2 right-3 text-[9px] font-mono opacity-40 group-hover:opacity-100 transition-opacity">
              {activeStat === stat.id ? 'Click to collapse' : 'Click for info'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
