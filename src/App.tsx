import { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import { CMSProvider } from './context/CMSContext';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import AdminAuth from './components/AdminAuth';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
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
import EventsArchive from './components/EventsArchive';
import AnnouncementsArchive from './components/AnnouncementsArchive';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  if (path === '/admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-panel flex items-center justify-center">
          <div className="text-center font-mono text-xs text-mut animate-pulse">Verifying authorization...</div>
        </div>
      );
    }

    if (!user) {
      return (
        <AdminAuth 
          onSuccess={() => {}} 
          onNavigateHome={() => navigate('/')} 
        />
      );
    }

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

  if (path === '/press-bulletins') {
    return (
      <CMSProvider>
        <AnnouncementsArchive />
      </CMSProvider>
    );
  }

  if (path === '/events') {
    return (
      <CMSProvider>
        <EventsArchive />
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
          <LiveDashboard />
          <AuditReports onOpenReport={(id) => navigate(`/report/${id}`)} />
          <AeoWeekly onSelectIssue={(id) => navigate(`/weekly/${id}`)} />
          <Diary />
          <Events />
          <Team />
          <Subscribe />
        </main>
        <Footer />
      </div>
    </CMSProvider>
  );
}

