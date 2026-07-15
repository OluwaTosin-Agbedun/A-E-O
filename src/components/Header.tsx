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

  const navigateTo = (to: string) => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.history.pushState({}, '', to);
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
                href="#about" 
                onClick={(e) => { e.preventDefault(); handleScroll('about'); }}
                className="text-sm font-medium text-blue-100 hover:text-white transition-colors"
              >
                About
              </a>
              <a 
                href="#monitoring" 
                onClick={(e) => { e.preventDefault(); handleScroll('monitoring'); }}
                className="text-sm font-medium text-blue-100 hover:text-white transition-colors"
              >
                Dashboard
              </a>
              <a 
                href="#diary" 
                onClick={(e) => { e.preventDefault(); handleScroll('diary'); }}
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
                <button 
                  className="flex items-center gap-1 text-sm font-medium text-blue-100 hover:text-white py-2 focus:outline-none transition-colors"
                >
                  <span>Publications</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-0 w-80 bg-white text-ink border border-line rounded-xl shadow-custom p-2 animate-fade-in z-50">
                    <a 
                      href="/reports-archive" 
                      onClick={(e) => { e.preventDefault(); navigateTo('/reports-archive'); }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-paper hover:text-brand-blue transition-all"
                    >
                      <FileText className="w-5 h-5 text-brand-blue mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold font-mono text-brand-blue uppercase tracking-wider">Audit</span>
                        <span className="block text-sm font-semibold">Audit Reports</span>
                        <span className="block text-xs text-mut font-normal mt-0.5">Forensic analyses on PV and results.</span>
                      </div>
                    </a>

                    <a 
                      href="/weekly-archive" 
                      onClick={(e) => { e.preventDefault(); navigateTo('/weekly-archive'); }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-paper hover:text-brand-blue transition-all"
                    >
                      <Mail className="w-5 h-5 text-brand-green mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold font-mono text-brand-green uppercase tracking-wider">Insights</span>
                        <span className="block text-sm font-semibold">AEO Weekly Digest</span>
                        <span className="block text-xs text-mut font-normal mt-0.5">Our analytical briefs & newsletters.</span>
                      </div>
                    </a>

                    <a 
                      href="/press-bulletins" 
                      onClick={(e) => { e.preventDefault(); navigateTo('/press-bulletins'); }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-paper hover:text-brand-blue transition-all"
                    >
                      <Bell className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold font-mono text-amber-500 uppercase tracking-wider">Announcements</span>
                        <span className="block text-sm font-semibold">Press & Bulletins</span>
                        <span className="block text-xs text-mut font-normal mt-0.5">Upcoming statements, announcements, and alerts.</span>
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
              href="#about" 
              onClick={(e) => { e.preventDefault(); handleScroll('about'); }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-blue-100 hover:text-white hover:bg-navy-dark"
            >
              About
            </a>
            <a 
              href="#monitoring" 
              onClick={(e) => { e.preventDefault(); handleScroll('monitoring'); }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-blue-100 hover:text-white hover:bg-navy-dark"
            >
              Dashboard
            </a>
            <a 
              href="#diary" 
              onClick={(e) => { e.preventDefault(); handleScroll('diary'); }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-blue-100 hover:text-white hover:bg-navy-dark"
            >
              Diary of Election
            </a>
            <a 
              href="/reports-archive" 
              onClick={(e) => { e.preventDefault(); navigateTo('/reports-archive'); }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-blue-100 hover:text-white hover:bg-navy-dark"
            >
              Audit Reports
            </a>
            <a 
              href="/weekly-archive" 
              onClick={(e) => { e.preventDefault(); navigateTo('/weekly-archive'); }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-blue-100 hover:text-white hover:bg-navy-dark"
            >
              AEO Weekly Digest
            </a>
            <a 
              href="/press-bulletins" 
              onClick={(e) => { e.preventDefault(); navigateTo('/press-bulletins'); }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-blue-100 hover:text-white hover:bg-navy-dark"
            >
              Press &amp; Bulletins
            </a>
            <a 
              href="/events" 
              onClick={(e) => { e.preventDefault(); navigateTo('/events'); }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-blue-100 hover:text-white hover:bg-navy-dark"
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
