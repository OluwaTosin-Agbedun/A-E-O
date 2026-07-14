import { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import { CMSProvider } from './context/CMSContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Flagship from './components/Flagship';
import LiveDashboard from './components/LiveDashboard';
import AuditReports from './components/AuditReports';
import AeoWeekly from './components/AeoWeekly';
import Diary from './components/Diary';
import Events from './components/Events';
import Team from './components/Team';
import Subscribe from './components/Subscribe';
import Footer from './components/Footer';
import ReportReader from './components/ReportReader';
import WeeklyReader from './components/WeeklyReader';
import CMSPanel from './components/CMSPanel';
import ReportsArchive from './components/ReportsArchive';
import WeeklyArchive from './components/WeeklyArchive';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  if (path === '/admin') {
    return (
      <CMSProvider>
        <CMSPanel 
          isStandalone={true}
          onNavigateHome={() => navigate('/')}
        />
      </CMSProvider>
    );
  }

  if (path === '/reports-archive') {
    return (
      <CMSProvider>
        <ReportsArchive />
      </CMSProvider>
    );
  }

  if (path === '/weekly-archive') {
    return (
      <CMSProvider>
        <WeeklyArchive />
      </CMSProvider>
    );
  }

  if (path.startsWith('/report/')) {
    const reportId = path.substring('/report/'.length);
    return (
      <CMSProvider>
        <ReportReader 
          reportId={reportId} 
          onClose={() => navigate('/')} 
        />
      </CMSProvider>
    );
  }

  if (path.startsWith('/weekly/')) {
    const weeklyId = path.substring('/weekly/'.length);
    return (
      <CMSProvider>
        <WeeklyReader 
          weeklyId={weeklyId} 
          onClose={() => navigate('/')} 
        />
      </CMSProvider>
    );
  }

  return (
    <CMSProvider>
      <div className="min-h-screen flex flex-col bg-panel text-ink antialiased selection:bg-brand-blue/20">
        <Header />
        <main className="flex-grow">
          <Hero />
          <Stats />
          <Flagship />
          <LiveDashboard />
          <AuditReports onOpenReport={(id) => navigate(`/report/${id}`)} />
          <AeoWeekly onSelectIssue={(id) => navigate(`/weekly/${id}`)} />
          <Diary />
          <Events />
          <Team />
          <Subscribe />
        </main>
        <Footer />

        {/* Floating CMS Control Trigger */}
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-mono text-xs font-bold uppercase tracking-wider px-4.5 py-3 rounded-full shadow-xl border border-white/10 hover:border-brand-purple/50 hover:scale-105 transition-all cursor-pointer group"
          >
            <Database className="w-4 h-4 text-brand-purple animate-pulse" />
            <span>Site CMS Console</span>
          </button>
        </div>
      </div>
    </CMSProvider>
  );
}

