import { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import SEO from './components/SEO';
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
import EventReader from './components/EventReader';
import AnnouncementReader from './components/AnnouncementReader';
import ElectionDetails from './components/ElectionDetails';
import PastElectionsArchive from './components/PastElectionsArchive';

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

  // Track virtual page views in Google Tag Manager (dataLayer) for SPA routing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'page_view',
        page_path: path,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [path]);

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
  let seo = null;

  if (
    path === '/publications' ||
    path === '/reports-and-briefs' ||
    path === '/reports-briefs' ||
    path === '/post-election-audits' ||
    path === '/political-landscape-monitor' ||
    path === '/democracy-competitive-index' ||
    path === '/aeo-weekly-digest' ||
    path === '/announcements'
  ) {
    if (path === '/reports-and-briefs' || path === '/reports-briefs') {
      seo = <SEO title="Reports and Briefs" description="Access our full registry of forensic election audits, sub-national tech assessments, and policy research briefs." canonicalPath="/reports-and-briefs" />;
    } else if (path === '/post-election-audits') {
      seo = <SEO title="Post-Election Audit Reports" description="Explore independent forensic audits scoring electoral administration against primary source evidence." canonicalPath="/post-election-audits" />;
    } else if (path === '/political-landscape-monitor') {
      seo = <SEO title="Political Landscape Monitor" description="Sub-national technological assessments and electoral health monitoring across Nigerian states." canonicalPath="/political-landscape-monitor" />;
    } else if (path === '/democracy-competitive-index') {
      seo = <SEO title="Democracy Competitive Index" description="Evaluating democratic competitiveness, voting access, and electoral fairness across sub-national jurisdictions." canonicalPath="/democracy-competitive-index" />;
    } else if (path === '/aeo-weekly-digest') {
      seo = <SEO title="AEO Weekly Digest" description="Weekly intelligence bulletins, electoral timeline updates, and democratic health monitoring." canonicalPath="/aeo-weekly-digest" />;
    } else if (path === '/announcements') {
      seo = <SEO title="Press Bulletins & Announcements" description="Official press statements, bulletins, and observer deployment notices from the Athena Election Observatory." canonicalPath="/announcements" />;
    } else {
      seo = <SEO title="Publications & Research" description="Access our full registry of forensic election audits, sub-national tech assessments, and policy research briefs." canonicalPath="/publications" />;
    }
    content = <PublicationsPage />;
  } else if (path === '/reports-archive') {
    seo = <SEO title="Reports Archive" description="The complete archival registry of election audit reports, technology assessments, and policy research." canonicalPath="/reports-archive" />;
    content = <ReportsArchive />;
  } else if (path === '/weekly-archive') {
    seo = <SEO title="Weekly Digest Archive" description="Comprehensive archive of AEO weekly intelligence bulletins." canonicalPath="/weekly-archive" />;
    content = <WeeklyArchive />;
  } else if (path === '/press-bulletins') {
    seo = <SEO title="Press Bulletins" description="Official press statements, bulletins, and observer deployment notices." canonicalPath="/press-bulletins" />;
    content = <AnnouncementsArchive />;
  } else if (path === '/events') {
    seo = <SEO title="Events" description="Upcoming and past election monitoring briefings, policy dialogues, and electoral technology workshops." canonicalPath="/events" />;
    content = <EventsArchive />;
  } else if (path === '/past-elections') {
    seo = <SEO title="Past Elections Archive" description="Historical election monitoring data, voter turnout records, and electoral audit scorecards." canonicalPath="/past-elections" />;
    content = <PastElectionsArchive />;
  } else if (path === '/elections') {
    seo = <SEO title="Elections & Electoral Data" description="Explore real-time election monitoring, voter turnouts, polling unit statistics, and election results across Nigeria." canonicalPath="/elections" />;
    content = <LiveDashboard isPreview={false} />;
  } else if (path.startsWith('/election/')) {
    const electionCode = path.substring('/election/'.length);
    content = (
      <ElectionDetails 
        electionCode={electionCode}
        onBack={() => navigate('/elections')}
        onOpenReport={(id) => navigate(`/report/${id}`)}
        onOpenWeekly={(id) => navigate(`/weekly/${id}`)}
      />
    );
  } else if (path === '/ehii') {
    seo = <SEO title="Electoral Health & Integrity Index (EHII)" description="Comprehensive assessment scoring election integrity, INEC performance, voter access, and security across Nigerian elections." canonicalPath="/ehii" />;
    content = <EhiiIndex />;
  } else if (path === '/diary') {
    seo = <SEO title="Electoral Diary & Timeline" description="Chronological timeline of electoral events, INEC deadlines, observer deployments, and key legal milestones." canonicalPath="/diary" />;
    content = <DiaryPage />;
  } else if (path.startsWith('/report/')) {
    const reportId = path.substring('/report/'.length);
    content = <ReportReader reportId={reportId} onClose={() => navigate('/publications')} />;
  } else if (path.startsWith('/weekly/')) {
    const weeklyId = path.substring('/weekly/'.length);
    content = <WeeklyReader weeklyId={weeklyId} onClose={() => navigate('/publications')} />;
  } else if (path.startsWith('/announcement/')) {
    const announcementId = path.substring('/announcement/'.length);
    content = <AnnouncementReader announcementId={announcementId} onClose={() => navigate('/publications')} />;
  } else if (path.startsWith('/event/')) {
    const eventId = path.substring('/event/'.length);
    content = <EventReader eventId={eventId} onClose={() => navigate('/')} />;
  } else {
    seo = <SEO title="Athena Election Observatory (AEO) | Election Integrity, Data & Accountability" description="Independent, non-partisan election data, audits and democratic health insights from the Athena Election Observatory, an initiative of the Athena Centre for Policy and Leadership." canonicalPath="/" />;
    content = (
      <>
        <Hero />
        <LiveDashboard isPreview={true} />
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
      {seo}
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

