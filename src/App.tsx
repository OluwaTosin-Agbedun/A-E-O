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
import EhiiIndex from './components/EhiiIndex';
import DiaryPage from './components/DiaryPage';
import PublicationsPage from './components/PublicationsPage';

export default function App() {
  const getInitialPath = () => {
    // 1. Support hash routing (e.g. #/admin or #/weekly/issue-1)
    if (window.location.hash) {
      const hashPath = window.location.hash.substring(1);
      if (hashPath.startsWith('/')) return hashPath;
    }
    // 2. Support search query routing (e.g. ?path=/admin)
    const params = new URLSearchParams(window.location.search);
    const queryPath = params.get('path');
    if (queryPath && queryPath.startsWith('/')) return queryPath;

    // 3. Default to standard pathname
    return window.location.pathname;
  };

  const [path, setPath] = useState(getInitialPath());

  useEffect(() => {
    const handleNavigation = () => {
      setPath(getInitialPath());
    };
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
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
    if (window.location.hash) {
      window.location.hash = to;
    } else {
      window.history.pushState({}, '', to);
    }
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

  let content = null;

  if (
    path === '/publications' ||
    path === '/post-election-audits' ||
    path === '/political-landscape-monitor' ||
    path === '/aeo-weekly-digest' ||
    path === '/announcements'
  ) {
    content = <PublicationsPage />;
  } else if (path === '/reports-archive') {
    content = <ReportsArchive />;
  } else if (path === '/weekly-archive') {
    content = <WeeklyArchive />;
  } else if (path === '/press-bulletins') {
    content = <AnnouncementsArchive />;
  } else if (path === '/events') {
    content = <EventsArchive />;
  } else if (path === '/ehii') {
    content = <EhiiIndex />;
  } else if (path === '/diary') {
    content = <DiaryPage />;
  } else if (path.startsWith('/report/')) {
    const reportId = path.substring('/report/'.length);
    content = <ReportReader reportId={reportId} onClose={() => navigate('/')} />;
  } else if (path.startsWith('/weekly/')) {
    const weeklyId = path.substring('/weekly/'.length);
    content = <WeeklyReader weeklyId={weeklyId} onClose={() => navigate('/')} />;
  } else {
    content = (
      <>
        <Hero />
        <LiveDashboard />
        <AuditReports 
          onOpenReport={(id) => navigate(`/report/${id}`)} 
          onOpenWeekly={(id) => navigate(`/weekly/${id}`)} 
        />
        <Events />
        <Subscribe />
      </>
    );
  }

  return (
    <CMSProvider>
      <div className="min-h-screen flex flex-col bg-panel text-ink antialiased selection:bg-brand-blue/20">
        <Header />
        <main className="flex-grow">
          {content}
        </main>
        <Footer />
      </div>
    </CMSProvider>
  );
}

