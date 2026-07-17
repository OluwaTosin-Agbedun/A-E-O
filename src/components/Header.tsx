import { useState } from 'react';
import { Menu, X, ChevronDown, Mail, BookOpen, ShieldAlert, FileText, Bell } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleScroll = (id: string) => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleBrandClick = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateTo = (to: string, state: any = {}) => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.history.pushState(state, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy text-white shadow-md border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo/Brand */}
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={handleBrandClick}
            >
              <div className="w-9 h-9 rounded bg-brand-blue flex items-center justify-center font-display font-bold text-lg text-white tracking-tighter">
                A
              </div>
              <span className="font-display font-bold text-sm sm:text-base md:text-lg tracking-tight hover:text-brand-blue transition-colors">
                ATHENA ELECTION OBSERVATORY
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <a 
                href="#monitoring" 
                onClick={(e) => { e.preventDefault(); handleScroll('monitoring'); }}
                className="text-sm font-medium text-blue-100 hover:text-white transition-colors"
              >
                Live Election
              </a>

              <a 
                href="/ehii" 
                onClick={(e) => { e.preventDefault(); navigateTo('/ehii'); }}
                className="text-sm font-medium text-blue-100 hover:text-white transition-colors"
              >
                EHII Index
              </a>

              <a 
                href="/diary" 
                onClick={(e) => { e.preventDefault(); navigateTo('/diary'); }}
                className="text-sm font-medium text-blue-100 hover:text-white transition-colors"
              >
                Diary of Election
              </a>

              {/* Publications Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <a 
                  href="/publications"
                  onClick={(e) => { e.preventDefault(); navigateTo('/publications'); }}
                  className="flex items-center gap-1 text-sm font-medium text-blue-100 hover:text-white py-2 focus:outline-none transition-colors cursor-pointer"
                >
                  <span>Publications</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </a>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-0 w-[30rem] bg-white text-ink border border-line rounded-xl shadow-custom p-3 animate-fade-in z-50">
                    <a 
                      href="/post-election-audits" 
                      onClick={(e) => { e.preventDefault(); navigateTo('/post-election-audits'); }}
                      className="flex items-start gap-4 p-3.5 rounded-lg hover:bg-paper transition-all"
                    >
                      <FileText className="w-6 h-6 text-brand-purple mt-1 flex-shrink-0" />
                      <div>
                        <span className="block text-base font-bold text-brand-purple leading-snug">Post-election audit reports</span>
                        <span className="block text-xs sm:text-sm text-mut font-normal mt-1">Forensic analyses on PV and results.</span>
                      </div>
                    </a>

                    <a 
                      href="/political-landscape-monitor" 
                      onClick={(e) => { e.preventDefault(); navigateTo('/political-landscape-monitor'); }}
                      className="flex items-start gap-4 p-3.5 rounded-lg hover:bg-paper transition-all"
                    >
                      <BookOpen className="w-6 h-6 text-brand-blue mt-1 flex-shrink-0" />
                      <div>
                        <span className="block text-base font-bold text-brand-blue leading-snug">Political landscape monitor</span>
                        <span className="block text-xs sm:text-sm text-mut font-normal mt-1">Sub-national landscape & technology assessments.</span>
                      </div>
                    </a>

                    <a 
                      href="/aeo-weekly-digest" 
                      onClick={(e) => { e.preventDefault(); navigateTo('/aeo-weekly-digest'); }}
                      className="flex items-start gap-4 p-3.5 rounded-lg hover:bg-paper transition-all"
                    >
                      <Mail className="w-6 h-6 text-brand-green mt-1 flex-shrink-0" />
                      <div>
                        <span className="block text-base font-bold text-brand-green leading-snug">AEO weekly digest</span>
                        <span className="block text-xs sm:text-sm text-mut font-normal mt-1">Our analytical briefs & newsletters.</span>
                      </div>
                    </a>

                    <a 
                      href="/announcements" 
                      onClick={(e) => { e.preventDefault(); navigateTo('/announcements'); }}
                      className="flex items-start gap-4 p-3.5 rounded-lg hover:bg-paper transition-all"
                    >
                      <Bell className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="block text-base font-bold text-amber-500 leading-snug">Announcements</span>
                        <span className="block text-xs sm:text-sm text-mut font-normal mt-1">Upcoming statements, announcements, and alerts.</span>
                      </div>
                    </a>
                  </div>
                )}
              </div>

              <a 
                href="/events" 
                onClick={(e) => { e.preventDefault(); navigateTo('/events'); }}
                className="text-sm font-medium text-blue-100 hover:text-white transition-colors"
              >
                Events
              </a>

              <a 
                href="#subscribe"
                onClick={(e) => { e.preventDefault(); handleScroll('subscribe'); }}
                className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Subscribe
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-blue-100 hover:text-white hover:bg-navy-dark focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-navy px-4 pt-2 pb-6 space-y-2">
            <a 
              href="#monitoring" 
              onClick={(e) => { e.preventDefault(); handleScroll('monitoring'); }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-blue-100 hover:text-white hover:bg-navy-dark"
            >
              Live Election
            </a>
            <a 
              href="/ehii" 
              onClick={(e) => { e.preventDefault(); navigateTo('/ehii'); }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-blue-100 hover:text-white hover:bg-navy-dark"
            >
              EHII Index
            </a>
            <a 
              href="/diary" 
              onClick={(e) => { e.preventDefault(); navigateTo('/diary'); }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-blue-100 hover:text-white hover:bg-navy-dark"
            >
              Diary of Election
            </a>
            <div className="pt-2 pb-1 px-3">
              <span className="text-[10px] font-bold font-mono tracking-wider text-white/40 uppercase">Publications</span>
            </div>
            <a 
              href="/post-election-audits" 
              onClick={(e) => { e.preventDefault(); navigateTo('/post-election-audits'); }}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-100 hover:text-white hover:bg-navy-dark pl-6"
            >
              Post-election audit reports
            </a>
            <a 
              href="/political-landscape-monitor" 
              onClick={(e) => { e.preventDefault(); navigateTo('/political-landscape-monitor'); }}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-100 hover:text-white hover:bg-navy-dark pl-6"
            >
              Political landscape monitor
            </a>
            <a 
              href="/aeo-weekly-digest" 
              onClick={(e) => { e.preventDefault(); navigateTo('/aeo-weekly-digest'); }}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-100 hover:text-white hover:bg-navy-dark pl-6"
            >
              AEO weekly digest
            </a>
            <a 
              href="/announcements" 
              onClick={(e) => { e.preventDefault(); navigateTo('/announcements'); }}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-100 hover:text-white hover:bg-navy-dark pl-6"
            >
              Announcements
            </a>
            <a 
              href="/events" 
              onClick={(e) => { e.preventDefault(); navigateTo('/events'); }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-blue-100 hover:text-white hover:bg-navy-dark pt-4 border-t border-white/5"
            >
              Events
            </a>
            <div className="pt-4 border-t border-white/10">
              <a 
                href="#subscribe"
                onClick={(e) => { e.preventDefault(); handleScroll('subscribe'); }}
                className="w-full inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Subscribe to AEO Updates
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
