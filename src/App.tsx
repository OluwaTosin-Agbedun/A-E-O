import { useState } from 'react';
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

export default function App() {
  const [openedReportId, setOpenedReportId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-panel text-ink antialiased selection:bg-brand-blue/20">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Stats />
        <Flagship />
        <LiveDashboard />
        <AuditReports onOpenReport={(id) => setOpenedReportId(id)} />
        <AeoWeekly />
        <Diary />
        <Events />
        <Team />
        <Subscribe />
      </main>
      <Footer />

      {/* Forensic Report Auditing modal/overlay */}
      <ReportReader 
        reportId={openedReportId} 
        onClose={() => setOpenedReportId(null)} 
      />
    </div>
  );
}

