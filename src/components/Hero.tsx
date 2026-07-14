import { useEffect, useState } from 'react';
import { Calendar, Eye, ArrowRight, BookOpen, MapPin, Users, Building, HelpCircle } from 'lucide-react';

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [showOsunDetails, setShowOsunDetails] = useState(false);

  useEffect(() => {
    // Target date: Saturday, 15 August 2026 at 08:00:00 (GMT+1 / West Africa Time / WAT)
    const targetDate = new Date("2026-08-15T08:00:00+01:00").getTime();

    const calculateTime = () => {
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
  }, []);

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="bg-navy text-white py-12 sm:py-16 md:py-20 border-b border-white/5 relative overflow-hidden">
      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider text-blue-200 uppercase">
              <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping"></span>
              Independent · Non-partisan · Evidence-based
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-none text-white">
              Monitoring election integrity across <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-green-300">Nigeria &amp; Africa</span>.
            </h1>
            
            <p className="text-base sm:text-lg text-blue-100 max-w-xl leading-relaxed">
              We observe, audit and report on electoral processes — anchored to primary documents and verifiable data, never to rumour. From live monitoring to forensic post-election analysis.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => handleScroll('ehii')}
                className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer shadow-lg shadow-brand-blue/25"
              >
                Explore the EHII Index
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => handleScroll('reports')}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/20 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer"
              >
                Audit Reports
              </button>
            </div>
          </div>

          {/* Election spotlight countdown card */}
          <div className="lg:col-span-5">
            <div className="bg-white/5 border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest text-blue-300 font-bold uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  ◦ Next election in view
                </span>
                <span className="text-xs bg-brand-blue/30 text-blue-200 border border-brand-blue/40 px-2.5 py-0.5 rounded-full font-semibold">
                  Off-Cycle
                </span>
              </div>
              
              <h3 className="font-display font-bold text-2xl sm:text-3xl mt-4 mb-1">
                Osun State Governorship
              </h3>
              
              <div className="text-sm text-blue-200/90 font-medium mb-6">
                Saturday, 15 August 2026 · INEC Monitored
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
                      <span className="font-mono font-bold text-white">30 LGAs + Area Office</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-blue-300"><Users className="w-3.5 h-3.5" /> Registered Voters:</span>
                      <span className="font-mono font-bold text-white">1,955,657 voters</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-blue-300"><Building className="w-3.5 h-3.5" /> Polling Units (PUs):</span>
                      <span className="font-mono font-bold text-white">3,763 PUs</span>
                    </div>
                    <p className="text-[11px] text-blue-200/70 border-t border-white/5 pt-2 mt-2 leading-relaxed">
                      Athena is deploying 1,200 trained field observers to map BVAS compliance and upload forms EC8A to our independent verification pipeline.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => handleScroll('diary')}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white font-semibold transition-colors mt-2"
                >
                  Open the Diary of Election <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
