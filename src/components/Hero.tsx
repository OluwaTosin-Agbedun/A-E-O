import { useEffect, useState } from 'react';
import { Calendar, Eye, ArrowRight, BookOpen, MapPin, Users, Building, HelpCircle } from 'lucide-react';
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
      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none"></div>

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

          {/* Election spotlight countdown card */}
          <div className="lg:col-span-5">
            <div className="bg-white/5 border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest text-blue-300 font-bold uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  ◦ {heroConfig.spotlightBadgeText}
                </span>
                <span className="text-xs bg-brand-blue/30 text-blue-200 border border-brand-blue/40 px-2.5 py-0.5 rounded-full font-semibold">
                  {heroConfig.spotlightStatusText}
                </span>
              </div>
              
              <h3 className="font-display font-bold text-2xl sm:text-3xl mt-4 mb-1">
                {heroConfig.spotlightTitle}
              </h3>
              
              <div className="text-sm text-blue-200/90 font-medium mb-6">
                {heroConfig.spotlightDateText}
              </div>

              {/* Countdown Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
                  <span className="block font-mono text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    {timeLeft.days}
                  </span>
                  <span className="block text-[10px] uppercase font-mono font-bold text-blue-300 tracking-wider mt-1">
                    days
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
                  <span className="block font-mono text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] uppercase font-mono font-bold text-blue-300 tracking-wider mt-1">
                    hours
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
                  <span className="block font-mono text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] uppercase font-mono font-bold text-blue-300 tracking-wider mt-1">
                    min
                  </span>
                </div>
              </div>

              {/* Interactivity: Osun Spotlight Toggle */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <button
                  onClick={() => setShowOsunDetails(!showOsunDetails)}
                  className="w-full flex items-center justify-between text-blue-300 hover:text-white font-semibold text-xs font-mono uppercase tracking-wider focus:outline-none transition-colors"
                >
                  <span>{showOsunDetails ? 'Hide Spotlight Specs' : 'Show Spotlight Specs'}</span>
                  <span>{showOsunDetails ? '▲' : '▼'}</span>
                </button>

                {showOsunDetails && (
                  <div className="mt-4 space-y-3 text-xs bg-white/5 p-4 rounded-xl border border-white/10 animate-fade-in text-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-blue-300"><MapPin className="w-3.5 h-3.5" /> LGAs:</span>
                      <span className="font-mono font-bold text-white">{heroConfig.lgasCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-blue-300"><Users className="w-3.5 h-3.5" /> Registered Voters:</span>
                      <span className="font-mono font-bold text-white">{heroConfig.registeredVoters}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-blue-300"><Building className="w-3.5 h-3.5" /> Polling Units (PUs):</span>
                      <span className="font-mono font-bold text-white">{heroConfig.pollingUnits}</span>
                    </div>
                    <p className="text-[11px] text-blue-200/70 border-t border-white/5 pt-2 mt-2 leading-relaxed">
                      {heroConfig.spotlightBottomText}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => handleScroll('diary')}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white font-semibold transition-colors mt-2"
                >
                  {heroConfig.diaryLinkText} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
