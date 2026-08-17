import { useEffect, useState } from 'react';
import { Calendar, ArrowRight, MapPin, Users, Building, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export default function Hero() {
  const { heroConfig } = useCMS();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [showOsunDetails, setShowOsunDetails] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      // Target date from CMS config
      const targetDate = new Date(heroConfig.spotlightTargetDate || "2026-08-15T08:00:00+01:00").getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);

    return () => clearInterval(interval);
  }, [heroConfig.spotlightTargetDate]);

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderTitleWithGradient = (text: string) => {
    const parts = text.split(/\{([^}]+)\}/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span 
            key={index} 
            className="text-transparent bg-clip-text bg-gradient-to-r"
            style={{ 
              backgroundImage: `linear-gradient(to right, ${heroConfig.titleHighlightFrom || '#93C5FD'}, ${heroConfig.titleHighlightTo || '#86EFAC'})` 
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <section 
      id="about" 
      className="text-white py-12 sm:py-16 md:py-20 border-b border-white/5 relative overflow-hidden"
      style={{ backgroundColor: heroConfig.heroBgColor || '#1E3A5F' }}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            
            <h1 
              className={`${heroConfig.titleFontFamily || 'font-display'} ${heroConfig.titleFontSize || 'text-4xl sm:text-5xl lg:text-6xl'} font-bold tracking-tight leading-none`}
              style={{ color: heroConfig.titleColor || '#FFFFFF' }}
            >
              {renderTitleWithGradient(heroConfig.title)}
            </h1>
            
            <p 
              className={`${heroConfig.descriptionFontFamily || 'font-sans'} ${heroConfig.descriptionFontSize || 'text-base sm:text-lg'} max-w-xl leading-relaxed`}
              style={{ color: heroConfig.descriptionColor || '#DBEAFE' }}
            >
              {heroConfig.description}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => {
                  window.history.pushState({}, '', '/ehii');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer shadow-lg shadow-brand-blue/25"
              >
                {heroConfig.exploreButtonText}
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => handleScroll('reports')}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/20 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer"
              >
                {heroConfig.auditButtonText}
              </button>
            </div>
          </div>

          {/* Osun Election Assessment Snapshot Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/5 border border-white/15 rounded-2xl p-6 sm:p-7 shadow-2xl relative backdrop-blur-md">
              
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono tracking-widest text-emerald-300 font-bold uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Osun Election Assessment
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  INEC Declared
                </span>
              </div>
              
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-1">
                Osun 2026 Governorship Assessment
              </h3>
              
              <div className="text-xs text-blue-200/90 font-medium mb-5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-300" />
                Declared on 16 August 2026 · 30 LGAs Audited
              </div>

              {/* Vote Highlights Grid */}
              <div className="space-y-2.5 mb-5">
                {/* Winner */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-400" /> Accord Party (Winner)
                    </span>
                    <p className="font-semibold text-xs text-white">Ademola Adeleke</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-emerald-300 block">511,067</span>
                    <span className="text-[10px] font-mono text-emerald-200/80">51.88% votes</span>
                  </div>
                </div>

                {/* Runner up */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300">
                      APC (2nd Place)
                    </span>
                    <p className="font-semibold text-xs text-white">Bola Oyebamiji</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-white block">444,815</span>
                    <span className="text-[10px] font-mono text-blue-200/80">45.16% votes</span>
                  </div>
                </div>
              </div>

              {/* Key Assessment Stats */}
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <span className="block font-mono text-lg font-bold text-emerald-300">
                    98.43%
                  </span>
                  <span className="block text-[9px] uppercase font-mono font-bold text-blue-200/90 tracking-wider mt-0.5">
                    IReV Transmission Rate
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <span className="block font-mono text-lg font-bold text-white">
                    1,010,684
                  </span>
                  <span className="block text-[9px] uppercase font-mono font-bold text-blue-200/90 tracking-wider mt-0.5">
                    Accredited Voters
                  </span>
                </div>
              </div>

              {/* Action Button: Read More */}
              <div className="pt-2 border-t border-white/10 text-center">
                <button 
                  onClick={() => {
                    window.history.pushState({}, '', '/election/osun');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-xs font-mono uppercase tracking-wider py-3 px-5 rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-blue/20"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
