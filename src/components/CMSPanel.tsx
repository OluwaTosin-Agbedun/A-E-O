import { useState, useEffect, FormEvent } from 'react';
import { 
  X, Database, Edit3, Trash2, Plus, Save, RotateCcw, 
  BookOpen, Calendar, MapPin, Users, FileText, CheckCircle2, ChevronRight, LogOut, Bell, Search, Loader2
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { auth, db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Report, DiaryItem, EventItem, TeamMember, WeeklyIssue, HeroConfig, StatItemConfig, AnnouncementItem } from '../types';

interface CMSPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  isStandalone?: boolean;
  onNavigateHome?: () => void;
}

type TabType = 'publications' | 'diary' | 'events' | 'team' | 'hero_stats' | 'subscribers';

const FileUploadField = ({ 
  label, 
  accept, 
  value, 
  onChange 
}: { 
  label: string; 
  accept: string; 
  value?: string; 
  onChange: (base64OrUrl: string) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-mono uppercase font-bold text-mut">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        <div className="md:col-span-8 font-mono">
          <input 
            type="text" 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste URL or drag file →"
            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-mono"
          />
        </div>
        <div className="md:col-span-4">
          <label 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
            className={`flex items-center justify-center border border-dashed text-[10px] font-mono font-bold uppercase rounded-lg h-10 cursor-pointer transition-colors ${
              isDragging ? 'border-brand-purple bg-purple-50 text-brand-purple' : 'border-line hover:border-mut text-mut hover:bg-slate-50'
            }`}
          >
            <span>Upload File</span>
            <input 
              type="file" 
              accept={accept} 
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              className="hidden" 
            />
          </label>
        </div>
      </div>
      {value && value.startsWith('data:') && (
        <span className="text-[9px] font-mono text-brand-green block">✓ File uploaded successfully (Base64 encoded)</span>
      )}
    </div>
  );
};

export default function CMSPanel({ 
  isOpen = false, 
  onClose = () => {}, 
  isStandalone = false, 
  onNavigateHome = () => {} 
}: CMSPanelProps) {
  const {
    reports, diaryNat, diaryLoc, diaryAfr, diaryOth, events, announcements, team, weekly,
    heroConfig, statsConfig,
    saveReport, deleteReport, saveDiaryItem, deleteDiaryItem, saveEvent, deleteEvent,
    saveAnnouncement, deleteAnnouncement,
    saveTeamMember, deleteTeamMember, saveWeeklyIssue, deleteWeeklyIssue,
    saveHeroConfig, saveStatsConfig, resetAllData
  } = useCMS();

  const [activeTab, setActiveTab] = useState<TabType>('publications');
  const [selectedPubType, setSelectedPubType] = useState<'report' | 'weekly' | 'announcement'>('report');
  const [pubFilter, setPubFilter] = useState<'all' | 'report' | 'weekly' | 'announcement'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [diaryCategory, setDiaryCategory] = useState<'national' | 'local' | 'africa' | 'other'>('national');
  
  // Local states for visual Hero and Stats editor
  const [localHero, setLocalHero] = useState<HeroConfig>(heroConfig);
  const [localStats, setLocalStats] = useState<StatItemConfig[]>(statsConfig);
  const [expandedStatStyles, setExpandedStatStyles] = useState<number | null>(null);

  // Subscribers states
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [subSearch, setSubSearch] = useState('');

  // Sync local states if the context gets reset or updated
  useEffect(() => {
    setLocalHero(heroConfig);
  }, [heroConfig]);

  useEffect(() => {
    setLocalStats(statsConfig);
  }, [statsConfig]);

  // Real-time Firestore subscribers sync
  useEffect(() => {
    if (activeTab === 'subscribers') {
      setSubLoading(true);
      const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setSubscribers(list);
        setSubLoading(false);
      }, (error) => {
        console.error("Error listening to subscribers:", error);
        setSubLoading(false);
      });
      return () => unsubscribe();
    }
  }, [activeTab]);

  // Flash status messages
  const [statusMsg, setStatusMsg] = useState('');

  // ----------------------------------------------------
  // Form States
  // ----------------------------------------------------
  
  // 1. Report Form
  const [reportForm, setReportForm] = useState<Partial<Report>>({
    id: '', tag: 'ELECTION AUDIT', tagType: 'analysis', date: '2026-07-13', size: '1.2 MB', title: '', summary: '', sections: [], author: '', authorsList: '', image: '', pdfUrl: ''
  });

  // 2. Diary Form
  const [diaryForm, setDiaryForm] = useState<Partial<DiaryItem>>({
    id: '', date: '', title: '', subtitle: '', status: 'In view'
  });

  // 3. Weekly Issue Form
  const [weeklyForm, setWeeklyForm] = useState<Partial<WeeklyIssue>>({
    id: '', tag: 'Weekly Analysis', date: 'July 2026', title: '', summary: '', linkText: 'Read full analysis',
    author: 'Athena Observatory', readingTime: '4 min read', sections: [], image: '', pdfUrl: ''
  });

  // 4. Event Form
  const [eventForm, setEventForm] = useState<Partial<EventItem>>({
    id: '', month: 'JUL', day: '15', title: '', description: '', location: 'Online Webinar', type: 'Briefing'
  });

  // Announcement Form
  const [announcementForm, setAnnouncementForm] = useState<Partial<AnnouncementItem>>({
    id: '', month: 'JUL', day: '15', date: '15 July 2026', title: '', summary: '', content: '', category: 'press', author: '', authorsList: '', image: '', pdfUrl: ''
  });

  // 5. Team Member Form
  const [teamForm, setTeamForm] = useState<Partial<TeamMember>>({
    id: '', name: '', role: '', initials: ''
  });

  if (!isStandalone && !isOpen) return null;

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all site content back to the default illustrative templates? Any custom entries will be lost.')) {
      resetAllData();
      setEditingId(null);
      showStatus('All database items restored to original defaults.');
    }
  };

  // Helper to generate IDs
  const generateId = () => {
    return 'custom-' + Math.random().toString(36).substring(2, 7);
  };

  // ----------------------------------------------------
  // Form Submission Handlers
  // ----------------------------------------------------

  const handleSaveReport = (e: FormEvent) => {
    e.preventDefault();
    if (!reportForm.title || !reportForm.summary) {
      alert('Please fill out the Title and Summary.');
      return;
    }

    const finalId = reportForm.id || generateId();
    const finalReport: Report = {
      id: finalId,
      title: reportForm.title,
      summary: reportForm.summary,
      tag: reportForm.tag || 'ELECTION AUDIT',
      tagType: (reportForm.tagType as 'analysis' | 'tech') || 'analysis',
      date: reportForm.date || 'July 2026',
      size: reportForm.size || '1.0 MB',
      sections: reportForm.sections && reportForm.sections.length > 0 
        ? reportForm.sections 
        : [{ title: 'Overview', content: reportForm.summary }],
      author: reportForm.author || '',
      authorsList: reportForm.authorsList || '',
      image: reportForm.image || '',
      pdfUrl: reportForm.pdfUrl || ''
    };

    saveReport(finalReport);
    setEditingId(null);
    setReportForm({ id: '', tag: 'ELECTION AUDIT', tagType: 'analysis', date: 'July 2026', size: '1.2 MB', title: '', summary: '', sections: [], author: '', authorsList: '', image: '', pdfUrl: '' });
    showStatus(`Report "${finalReport.title}" saved successfully!`);
  };

  const handleSaveDiary = (e: FormEvent) => {
    e.preventDefault();
    if (!diaryForm.title || !diaryForm.date) {
      alert('Please enter Title and Date.');
      return;
    }

    const finalId = diaryForm.id || generateId();
    const finalItem: DiaryItem = {
      id: finalId,
      date: diaryForm.date,
      title: diaryForm.title,
      subtitle: diaryForm.subtitle || 'Observatory Sync',
      status: diaryForm.status || 'In view'
    };

    saveDiaryItem(diaryCategory, finalItem);
    setEditingId(null);
    setDiaryForm({ id: '', date: '', title: '', subtitle: '', status: 'In view' });
    showStatus(`Electoral timeline "${finalItem.title}" saved!`);
  };

  const handleSaveWeekly = (e: FormEvent) => {
    e.preventDefault();
    if (!weeklyForm.title || !weeklyForm.summary) {
      alert('Please fill out Title and Summary.');
      return;
    }

    const finalId = weeklyForm.id || generateId();
    const finalIssue: WeeklyIssue = {
      id: finalId,
      tag: weeklyForm.tag || 'Weekly Analysis',
      date: weeklyForm.date || 'July 2026',
      title: weeklyForm.title,
      summary: weeklyForm.summary,
      linkText: weeklyForm.linkText || 'Read full analysis',
      author: weeklyForm.author || 'Athena Forensics',
      readingTime: weeklyForm.readingTime || '5 min read',
      sections: weeklyForm.sections && weeklyForm.sections.length > 0
        ? weeklyForm.sections
        : [
            { title: 'Core Assessment', text: weeklyForm.summary },
            { title: 'Logistics Breakdown', text: 'This represents a live, custom edited observation sub-paragraph.' }
          ],
      image: weeklyForm.image || '',
      pdfUrl: weeklyForm.pdfUrl || ''
    };

    saveWeeklyIssue(finalIssue);
    setEditingId(null);
    setWeeklyForm({
      id: '', tag: 'Weekly Analysis', date: 'July 2026', title: '', summary: '', linkText: 'Read full analysis',
      author: 'Athena Observatory', readingTime: '4 min read', sections: [], image: '', pdfUrl: ''
    });
    showStatus(`Weekly briefing "${finalIssue.title}" saved!`);
  };

  const handleSaveEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.month || !eventForm.day) {
      alert('Please fill out Title, Month, and Day.');
      return;
    }

    const finalId = eventForm.id || generateId();
    const finalEvent: EventItem = {
      id: finalId,
      month: eventForm.month.toUpperCase(),
      day: eventForm.day,
      title: eventForm.title,
      description: eventForm.description || '',
      location: eventForm.location || 'Online',
      type: eventForm.type || 'Briefing'
    };

    saveEvent(finalEvent);
    setEditingId(null);
    setEventForm({ id: '', month: 'JUL', day: '15', title: '', description: '', location: 'Online Webinar', type: 'Briefing' });
    showStatus(`Event "${finalEvent.title}" saved!`);
  };

  const handleSaveAnnouncement = (e: FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.month || !announcementForm.day) {
      alert('Please fill out Title, Month, and Day.');
      return;
    }

    const finalId = announcementForm.id || generateId();
    const finalAnnouncement: AnnouncementItem = {
      id: finalId,
      month: announcementForm.month.toUpperCase(),
      day: announcementForm.day,
      date: announcementForm.date || `${announcementForm.day} ${announcementForm.month} 2026`,
      title: announcementForm.title,
      summary: announcementForm.summary || '',
      content: announcementForm.content || '',
      category: announcementForm.category || 'press',
      author: announcementForm.author || '',
      authorsList: announcementForm.authorsList || '',
      image: announcementForm.image || '',
      pdfUrl: announcementForm.pdfUrl || ''
    };

    saveAnnouncement(finalAnnouncement);
    setEditingId(null);
    setAnnouncementForm({ id: '', month: 'JUL', day: '15', date: '15 July 2026', title: '', summary: '', content: '', category: 'press', author: '', authorsList: '', image: '', pdfUrl: '' });
    showStatus(`Announcement "${finalAnnouncement.title}" saved!`);
  };

  const handleSaveTeam = (e: FormEvent) => {
    e.preventDefault();
    if (!teamForm.name || !teamForm.role) {
      alert('Please fill out Member Name and Role.');
      return;
    }

    const finalId = teamForm.id || generateId();
    const initials = teamForm.initials || teamForm.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const finalMember: TeamMember = {
      id: finalId,
      name: teamForm.name,
      role: teamForm.role,
      initials
    };

    saveTeamMember(finalMember);
    setEditingId(null);
    setTeamForm({ id: '', name: '', role: '', initials: '' });
    showStatus(`Team member "${finalMember.name}" saved!`);
  };

  // ----------------------------------------------------
  // Dynamic Section Modifiers
  // ----------------------------------------------------
  const addReportSection = () => {
    const sections = [...(reportForm.sections || [])];
    sections.push({ title: 'New Sub-Section', content: 'Enter forensic details here...' });
    setReportForm({ ...reportForm, sections });
  };

  const updateReportSection = (index: number, field: 'title' | 'content', val: string) => {
    const sections = [...(reportForm.sections || [])];
    sections[index] = { ...sections[index], [field]: val };
    setReportForm({ ...reportForm, sections });
  };

  const removeReportSection = (index: number) => {
    const sections = (reportForm.sections || []).filter((_, i) => i !== index);
    setReportForm({ ...reportForm, sections });
  };

  const addWeeklySection = () => {
    const sections = [...(weeklyForm.sections || [])];
    sections.push({ title: 'New Article Chapter', text: 'Enter article text body here...' });
    setWeeklyForm({ ...weeklyForm, sections });
  };

  const updateWeeklySection = (index: number, field: 'title' | 'text', val: string) => {
    const sections = [...(weeklyForm.sections || [])];
    sections[index] = { ...sections[index], [field]: val };
    setWeeklyForm({ ...weeklyForm, sections });
  };

  const removeWeeklySection = (index: number) => {
    const sections = (weeklyForm.sections || []).filter((_, i) => i !== index);
    setWeeklyForm({ ...weeklyForm, sections });
  };

  return (
    <div className={isStandalone 
      ? "min-h-screen bg-slate-50 flex flex-col font-sans text-ink" 
      : "fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex justify-end font-sans text-ink"
    }>
      
      {/* Sliding Panel / Main Container */}
      <div className={isStandalone 
        ? "w-full flex-grow flex flex-col bg-white" 
        : "w-full max-w-4xl bg-white shadow-2xl h-full flex flex-col animate-slide-in"
      }>
        
        {/* Header */}
        <div className="bg-navy text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-brand-purple" />
            <div>
              <h2 className="font-display font-bold text-lg leading-tight flex items-center gap-2">
                <span>Observatory CMS Dashboard</span>
                {isStandalone && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-brand-purple/20 text-brand-purple border border-brand-purple/30 rounded">Admin Workspace</span>
                )}
              </h2>
              <p className="text-[11px] text-blue-200 font-mono">
                {isStandalone ? 'Full-Screen Content Management Console' : 'Live Content Management Console'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              title="Factory Reset All Fields"
              className="p-1.5 hover:bg-white/10 rounded-lg text-amber-300 hover:text-amber-400 transition-colors flex items-center gap-1 text-xs font-mono font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
            {isStandalone ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => auth.signOut()}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-[1.02]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
                <button 
                  onClick={onNavigateHome}
                  className="px-3.5 py-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-[1.02]"
                >
                  <span>Back to Website</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Floating toast notification */}
        {statusMsg && (
          <div className="bg-green-50 border-y border-green-200 px-6 py-2.5 text-xs text-green-800 font-mono flex items-center gap-2 animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-brand-green" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="bg-paper border-b border-line px-6 py-2 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('publications'); setEditingId(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border border-brand-purple/25 ${
              activeTab === 'publications' ? 'bg-navy text-white font-bold' : 'hover:bg-line text-ink2'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-brand-purple" />
            <span>Publications ({reports.length + weekly.length + announcements.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('diary'); setEditingId(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'diary' ? 'bg-navy text-white' : 'hover:bg-line text-ink2'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Electoral Timelines</span>
          </button>
          <button
            onClick={() => { setActiveTab('events'); setEditingId(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'events' ? 'bg-navy text-white' : 'hover:bg-line text-ink2'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Events ({events.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('team'); setEditingId(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'team' ? 'bg-navy text-white' : 'hover:bg-line text-ink2'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Members ({team.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('hero_stats'); setEditingId(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border border-brand-purple/20 ${
              activeTab === 'hero_stats' ? 'bg-brand-purple text-white' : 'hover:bg-line text-brand-purple'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-brand-purple" />
            <span className="font-bold">Hero & Stats (Visual CMS)</span>
          </button>
          <button
            onClick={() => { setActiveTab('subscribers'); setEditingId(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border border-brand-blue/20 ${
              activeTab === 'subscribers' ? 'bg-brand-blue text-white' : 'hover:bg-line text-brand-blue'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-brand-blue" />
            <span className="font-bold">Subscribers ({subscribers.length})</span>
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* PUBLICATIONS TAB (Unified Point for all publications) */}
          {activeTab === 'publications' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Publication Editor Form */}
              <div className="lg:col-span-7 bg-paper border border-line rounded-2xl p-5 space-y-4">
                
                {/* Header with Type selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-sm text-ink uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4.5 h-4.5 text-brand-blue" />
                      <span>
                        {editingId 
                          ? `Edit ${selectedPubType === 'report' ? 'Report' : selectedPubType === 'weekly' ? 'Weekly Digest' : 'Announcement'}` 
                          : `Create ${selectedPubType === 'report' ? 'Report' : selectedPubType === 'weekly' ? 'Weekly Digest' : 'Announcement'}`
                        }
                      </span>
                    </h3>
                    {editingId && (
                      <button 
                        onClick={() => {
                          setEditingId(null);
                          setReportForm({ id: '', tag: 'ELECTION AUDIT', tagType: 'analysis', date: 'July 2026', size: '1.2 MB', title: '', summary: '', sections: [], author: '', authorsList: '', image: '', pdfUrl: '' });
                          setWeeklyForm({ id: '', tag: 'Weekly Analysis', date: 'July 2026', title: '', summary: '', linkText: 'Read full analysis', author: 'Athena Observatory', readingTime: '4 min read', sections: [], image: '', pdfUrl: '' });
                          setAnnouncementForm({ id: '', month: 'JUL', day: '15', date: '15 July 2026', title: '', summary: '', content: '', category: 'press', author: '', authorsList: '', image: '', pdfUrl: '' });
                        }}
                        className="text-xs text-red-600 hover:underline font-semibold font-mono"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  {/* Single Unified Selector for Publication Type */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase font-bold text-mut">Publication Category / Type</label>
                    <select 
                      disabled={!!editingId}
                      value={selectedPubType} 
                      onChange={(e) => setSelectedPubType(e.target.value as any)}
                      className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-semibold font-mono focus:outline-none focus:border-brand-blue"
                    >
                      <option value="report">Post-Election Audit / Technology Assessment Report</option>
                      <option value="weekly">AEO Weekly Digest Bulletin</option>
                      <option value="announcement">Official Announcement / Press Bulletin</option>
                    </select>
                    {editingId && (
                      <span className="text-[9px] font-mono text-mut block mt-1">* Publication type cannot be changed while editing an existing item.</span>
                    )}
                  </div>
                </div>

                {/* Sub-form based on selection */}
                <div className="border-t border-line pt-4">
                  {selectedPubType === 'report' && (
                    <form onSubmit={handleSaveReport} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Report Tag Label</label>
                          <input 
                            type="text" 
                            value={reportForm.tag} 
                            onChange={(e) => setReportForm({ ...reportForm, tag: e.target.value })}
                            placeholder="E.g., OSUN AUDIT"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white focus:outline-none focus:border-brand-blue"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Tag Type Classification</label>
                          <select 
                            value={reportForm.tagType} 
                            onChange={(e) => setReportForm({ ...reportForm, tagType: e.target.value as 'analysis' | 'tech' })}
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white focus:outline-none"
                          >
                            <option value="analysis">Election Analysis (Purple theme)</option>
                            <option value="tech">Technology Security (Orange theme)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Publishing Date/Month</label>
                          <input 
                            type="text" 
                            value={reportForm.date} 
                            onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                            placeholder="E.g., July 2026"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-mono focus:outline-none focus:border-brand-blue"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">PDF Document Size</label>
                          <input 
                            type="text" 
                            value={reportForm.size} 
                            onChange={(e) => setReportForm({ ...reportForm, size: e.target.value })}
                            placeholder="E.g., 1.2 MB"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase font-bold text-mut">Report Title</label>
                        <input 
                          type="text" 
                          value={reportForm.title} 
                          onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                          placeholder="E.g., Osun 2026: Post-Election Audit on Live Collation Uploads"
                          className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-semibold focus:outline-none focus:border-brand-blue"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase font-bold text-mut">Short Synopsis / Executive Summary</label>
                        <textarea 
                          value={reportForm.summary} 
                          onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                          placeholder="E.g., In-depth assessment of transmission pipelines and ad-hoc response compliance across 30 LGAs..."
                          className="w-full text-xs p-2.5 border border-line rounded-lg bg-white h-20 resize-none focus:outline-none focus:border-brand-blue"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Lead Author</label>
                          <input 
                            type="text" 
                            value={reportForm.author || ''} 
                            onChange={(e) => setReportForm({ ...reportForm, author: e.target.value })}
                            placeholder="E.g. Chinaza Igwe"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Full Authors List</label>
                          <input 
                            type="text" 
                            value={reportForm.authorsList || ''} 
                            onChange={(e) => setReportForm({ ...reportForm, authorsList: e.target.value })}
                            placeholder="E.g. Chinaza Igwe and Uchenna Mgbechi"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <FileUploadField 
                        label="Publication Thumbnail Image" 
                        accept="image/*" 
                        value={reportForm.image} 
                        onChange={(val) => setReportForm({ ...reportForm, image: val })} 
                      />

                      <FileUploadField 
                        label="Publication PDF Document (Downloadable)" 
                        accept="application/pdf" 
                        value={reportForm.pdfUrl} 
                        onChange={(val) => setReportForm({ ...reportForm, pdfUrl: val })} 
                      />

                      {/* Document Sections Builder */}
                      <div className="border-t border-line pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-mono uppercase font-bold text-ink">Extended Article Content ({reportForm.sections?.length || 0} Chapters)</h4>
                          <button 
                            type="button" 
                            onClick={addReportSection}
                            className="text-[10px] font-mono font-bold bg-navy text-white px-2 py-1 rounded hover:bg-navy-dark cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Chapter
                          </button>
                        </div>

                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                          {reportForm.sections?.map((sec, sIdx) => (
                            <div key={sIdx} className="bg-white border border-line rounded-xl p-3 space-y-2 relative">
                              <button 
                                type="button" 
                                onClick={() => removeReportSection(sIdx)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-[10px] font-mono"
                              >
                                Remove
                              </button>
                              <input 
                                type="text" 
                                value={sec.title} 
                                onChange={(e) => updateReportSection(sIdx, 'title', e.target.value)}
                                placeholder={`Chapter ${sIdx+1} Title`}
                                className="w-11/12 text-xs font-semibold p-1.5 border-b border-line"
                              />
                              <textarea 
                                value={sec.content} 
                                onChange={(e) => updateReportSection(sIdx, 'content', e.target.value)}
                                placeholder="Enter detailed forensic paragraphs here..."
                                className="w-full text-xs p-1.5 border border-line rounded bg-paper/30 h-16 resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-purple hover:bg-purple-700 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Report</span>
                      </button>
                    </form>
                  )}

                  {selectedPubType === 'weekly' && (
                    <form onSubmit={handleSaveWeekly} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Newsletter Tag</label>
                          <input 
                            type="text" 
                            value={weeklyForm.tag} 
                            onChange={(e) => setWeeklyForm({ ...weeklyForm, tag: e.target.value })}
                            placeholder="E.g., Analysis Bulletin"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white focus:outline-none focus:border-brand-blue"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Publication Month</label>
                          <input 
                            type="text" 
                            value={weeklyForm.date} 
                            onChange={(e) => setWeeklyForm({ ...weeklyForm, date: e.target.value })}
                            placeholder="E.g., July 2026"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase font-bold text-mut">Weekly Digest Title</label>
                        <input 
                          type="text" 
                          value={weeklyForm.title} 
                          onChange={(e) => setWeeklyForm({ ...weeklyForm, title: e.target.value })}
                          placeholder="E.g., The Osun Trajectory: Accreditation Auditing Metrology"
                          className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-semibold focus:outline-none focus:border-brand-blue"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Lead Author</label>
                          <input 
                            type="text" 
                            value={weeklyForm.author} 
                            onChange={(e) => setWeeklyForm({ ...weeklyForm, author: e.target.value })}
                            placeholder="E.g. Athena Observatory"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-semibold focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Estimated Reading Time</label>
                          <input 
                            type="text" 
                            value={weeklyForm.readingTime} 
                            onChange={(e) => setWeeklyForm({ ...weeklyForm, readingTime: e.target.value })}
                            placeholder="E.g., 4 min read"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase font-bold text-mut">Teaser Summary / Synopsis</label>
                        <textarea 
                          value={weeklyForm.summary} 
                          onChange={(e) => setWeeklyForm({ ...weeklyForm, summary: e.target.value })}
                          placeholder="E.g., A comprehensive breakdown of pre-election ad-hoc team layouts and operational protocols..."
                          className="w-full text-xs p-2.5 border border-line rounded-lg bg-white h-20 resize-none focus:outline-none focus:border-brand-blue"
                        />
                      </div>

                      <FileUploadField 
                        label="Newsletter Thumbnail Image" 
                        accept="image/*" 
                        value={weeklyForm.image} 
                        onChange={(val) => setWeeklyForm({ ...weeklyForm, image: val })} 
                      />

                      <FileUploadField 
                        label="Newsletter PDF Document (Downloadable)" 
                        accept="application/pdf" 
                        value={weeklyForm.pdfUrl} 
                        onChange={(val) => setWeeklyForm({ ...weeklyForm, pdfUrl: val })} 
                      />

                      {/* Weekly Sections Builder */}
                      <div className="border-t border-line pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-mono uppercase font-bold text-ink">Newsletter Article Sections ({weeklyForm.sections?.length || 0} Blocks)</h4>
                          <button 
                            type="button" 
                            onClick={addWeeklySection}
                            className="text-[10px] font-mono font-bold bg-navy text-white px-2 py-1 rounded hover:bg-navy-dark cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Block
                          </button>
                        </div>

                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                          {weeklyForm.sections?.map((sec, sIdx) => (
                            <div key={sIdx} className="bg-white border border-line rounded-xl p-3 space-y-2 relative">
                              <button 
                                type="button" 
                                onClick={() => removeWeeklySection(sIdx)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-[10px] font-mono"
                              >
                                Remove
                              </button>
                              <input 
                                type="text" 
                                value={sec.title} 
                                onChange={(e) => updateWeeklySection(sIdx, 'title', e.target.value)}
                                placeholder={`Section ${sIdx+1} Title`}
                                className="w-11/12 text-xs font-semibold p-1.5 border-b border-line"
                              />
                              <textarea 
                                value={sec.text} 
                                onChange={(e) => updateWeeklySection(sIdx, 'text', e.target.value)}
                                placeholder="Enter section article text body paragraphs here..."
                                className="w-full text-xs p-1.5 border border-line rounded bg-paper/30 h-16 resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-purple hover:bg-purple-700 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Weekly Issue</span>
                      </button>
                    </form>
                  )}

                  {selectedPubType === 'announcement' && (
                    <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Month string</label>
                          <input 
                            type="text" 
                            value={announcementForm.month} 
                            onChange={(e) => setAnnouncementForm({ ...announcementForm, month: e.target.value })}
                            placeholder="E.g., JUL"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white uppercase font-mono focus:outline-none focus:border-brand-blue"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Day string</label>
                          <input 
                            type="text" 
                            value={announcementForm.day} 
                            onChange={(e) => setAnnouncementForm({ ...announcementForm, day: e.target.value })}
                            placeholder="E.g., 15"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-mono focus:outline-none focus:border-brand-blue"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Category</label>
                          <select
                            value={announcementForm.category}
                            onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value as any })}
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-mono focus:outline-none"
                          >
                            <option value="press">Press Release</option>
                            <option value="bulletin">Official Bulletin</option>
                            <option value="statement">Public Statement</option>
                            <option value="alert">Security/Audit Alert</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase font-bold text-mut">Date Display (e.g. 15 July 2026)</label>
                        <input 
                          type="text" 
                          value={announcementForm.date} 
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, date: e.target.value })}
                          placeholder="E.g., 15 July 2026"
                          className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-mono focus:outline-none focus:border-brand-blue"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase font-bold text-mut">Announcement Title</label>
                        <input 
                          type="text" 
                          value={announcementForm.title} 
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                          placeholder="E.g., Official Statement on Osun Result Portal Upload Integrity"
                          className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-semibold focus:outline-none focus:border-brand-blue"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase font-bold text-mut">Summary / Teaser</label>
                        <textarea 
                          value={announcementForm.summary} 
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, summary: e.target.value })}
                          placeholder="E.g., AEO outlines the 4 critical protocols needed to guarantee live transmission audits."
                          className="w-full text-xs p-2.5 border border-line rounded-lg bg-white h-20 resize-none focus:outline-none focus:border-brand-blue"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Author Name</label>
                          <input 
                            type="text" 
                            value={announcementForm.author || ''} 
                            onChange={(e) => setAnnouncementForm({ ...announcementForm, author: e.target.value })}
                            placeholder="E.g., Athena Secretariat"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase font-bold text-mut">Full Authors List</label>
                          <input 
                            type="text" 
                            value={announcementForm.authorsList || ''} 
                            onChange={(e) => setAnnouncementForm({ ...announcementForm, authorsList: e.target.value })}
                            placeholder="E.g., Athena Secretariat"
                            className="w-full text-xs p-2.5 border border-line rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <FileUploadField 
                        label="Announcement Header Image" 
                        accept="image/*" 
                        value={announcementForm.image} 
                        onChange={(val) => setAnnouncementForm({ ...announcementForm, image: val })} 
                      />

                      <FileUploadField 
                        label="Announcement PDF Document (Downloadable)" 
                        accept="application/pdf" 
                        value={announcementForm.pdfUrl} 
                        onChange={(val) => setAnnouncementForm({ ...announcementForm, pdfUrl: val })} 
                      />

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase font-bold text-mut">Full Content (Optional Markdown/Text)</label>
                        <textarea 
                          value={announcementForm.content} 
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                          placeholder="E.g., Full detailed text of the announcement or statement."
                          className="w-full text-xs p-2.5 border border-line rounded-lg bg-white h-32 resize-y font-mono focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-purple hover:bg-purple-700 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Announcement</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Unified Publications Catalog Directory */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="font-display font-bold text-xs text-mut uppercase tracking-wider">Publications Catalog</h3>
                
                {/* Interactive filter toggle bar */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
                  {(['all', 'report', 'weekly', 'announcement'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setPubFilter(f)}
                      className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        pubFilter === f
                          ? 'bg-white text-navy shadow-xs border border-slate-200/50'
                          : 'text-mut hover:text-ink'
                      }`}
                    >
                      {f === 'all' ? 'All' : f === 'report' ? 'Reports' : f === 'weekly' ? 'Weekly' : 'Announcements'}
                    </button>
                  ))}
                </div>

                {/* Combined list of publications filtered */}
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {(() => {
                    const filtered = [
                      ...reports.map(r => ({ ...r, unifiedType: 'report' as const, tagColor: r.tagType === 'tech' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-brand-purple bg-purple-50 border-purple-100' })),
                      ...weekly.map(w => ({ ...w, unifiedType: 'weekly' as const, tagColor: 'text-brand-blue bg-blue-50 border-blue-100' })),
                      ...announcements.map(a => ({ ...a, unifiedType: 'announcement' as const, tagColor: 'text-emerald-600 bg-emerald-50 border-emerald-100' }))
                    ].filter(item => pubFilter === 'all' || item.unifiedType === pubFilter);

                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 border border-dashed border-line rounded-xl text-center">
                          <p className="text-xs text-mut font-mono">No publications found.</p>
                        </div>
                      );
                    }

                    return filtered.map(item => (
                      <div key={item.id} className="bg-paper border border-line rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border ${item.tagColor}`}>
                              {item.unifiedType === 'report' ? (item as any).tag : item.unifiedType === 'weekly' ? 'Weekly Digest' : `Announcement (${(item as any).category})`}
                            </span>
                            {item.pdfUrl && (
                              <span className="text-[9px] font-mono font-bold text-brand-green bg-green-50 border border-green-100 px-1.5 py-0.5 rounded">
                                PDF Attached
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-xs text-ink leading-snug truncate">{item.title}</h4>
                          <span className="text-[10px] text-mut font-mono block">
                            {item.date} · {item.unifiedType === 'report' ? (item as any).size : item.unifiedType === 'weekly' ? (item as any).readingTime : (item as any).author || 'AEO'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setSelectedPubType(item.unifiedType);
                              if (item.unifiedType === 'report') {
                                setReportForm(item);
                              } else if (item.unifiedType === 'weekly') {
                                setWeeklyForm(item);
                              } else if (item.unifiedType === 'announcement') {
                                setAnnouncementForm(item);
                              }
                            }}
                            title="Edit Publication"
                            className="p-1 hover:bg-line rounded text-ink2 hover:text-brand-purple cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete publication "${item.title}"?`)) {
                                if (item.unifiedType === 'report') {
                                  deleteReport(item.id);
                                } else if (item.unifiedType === 'weekly') {
                                  deleteWeeklyIssue(item.id);
                                } else if (item.unifiedType === 'announcement') {
                                  deleteAnnouncement(item.id);
                                }
                                showStatus(`Publication deleted.`);
                              }
                            }}
                            title="Delete Publication"
                            className="p-1 hover:bg-line rounded text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>
          )}

          {/* ELECTORAL TIMELINES TAB */}
          {activeTab === 'diary' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Timeline Form */}
              <div className="lg:col-span-7 bg-paper border border-line rounded-2xl p-5 space-y-4">
                <h3 className="font-display font-bold text-sm text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4.5 h-4.5 text-brand-blue" />
                  <span>{editingId ? 'Edit Calendar Row' : 'Add Calendar Row'}</span>
                </h3>

                <form onSubmit={handleSaveDiary} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-mut">Database Category</label>
                      <select 
                        value={diaryCategory} 
                        onChange={(e) => setDiaryCategory(e.target.value as any)}
                        className="w-full text-xs p-2.5 border border-line rounded-lg bg-white"
                      >
                        <option value="national">Nigeria — National</option>
                        <option value="local">Local Government councils</option>
                        <option value="africa">Africa Referrals</option>
                        <option value="other">Other Global Countries</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-mut">Timeline status</label>
                      <select 
                        value={diaryForm.status} 
                        onChange={(e) => setDiaryForm({ ...diaryForm, status: e.target.value as any })}
                        className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-mono"
                      >
                        <option value="In view">In view</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Provisional">Provisional</option>
                        <option value="Tracking">Tracking</option>
                        <option value="Concluded">Concluded</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-mut">Electoral Date String</label>
                      <input 
                        type="text" 
                        value={diaryForm.date} 
                        onChange={(e) => setDiaryForm({ ...diaryForm, date: e.target.value })}
                        placeholder="E.g., Aug 16, 2026"
                        className="w-full text-xs p-2.5 border border-line rounded-lg bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-mut">Poll Subtitle / Context</label>
                      <input 
                        type="text" 
                        value={diaryForm.subtitle} 
                        onChange={(e) => setDiaryForm({ ...diaryForm, subtitle: e.target.value })}
                        placeholder="E.g., 30 seats contested"
                        className="w-full text-xs p-2.5 border border-line rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase font-bold text-mut">Electoral Event Title</label>
                    <input 
                      type="text" 
                      value={diaryForm.title} 
                      onChange={(e) => setDiaryForm({ ...diaryForm, title: e.target.value })}
                      placeholder="E.g., Osun Gubernatorial Polls"
                      className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-purple hover:bg-purple-700 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Timeline Event</span>
                  </button>
                </form>
              </div>

              {/* Timeline Catalog Lists */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-xs text-mut uppercase tracking-wider">Timeline Database</h3>
                  <select 
                    value={diaryCategory} 
                    onChange={(e) => setDiaryCategory(e.target.value as any)}
                    className="text-xs p-1 bg-paper border border-line rounded"
                  >
                    <option value="national">National List</option>
                    <option value="local">Local List</option>
                    <option value="africa">Africa List</option>
                    <option value="other">Other List</option>
                  </select>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {((diaryCategory === 'national' ? diaryNat : 
                     diaryCategory === 'local' ? diaryLoc :
                     diaryCategory === 'africa' ? diaryAfr : diaryOth)).map(d => (
                    <div key={d.id} className="bg-paper border border-line rounded-xl p-3 flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-brand-blue bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{d.date}</span>
                        <h4 className="font-semibold text-xs text-ink mt-1.5 leading-snug">{d.title}</h4>
                        <span className="text-[10px] text-mut block">{d.subtitle}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(d.id);
                            setDiaryForm(d);
                          }}
                          className="p-1 hover:bg-line rounded text-ink2 hover:text-brand-purple"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete timeline "${d.title}"?`)) deleteDiaryItem(diaryCategory, d.id);
                          }}
                          className="p-1 hover:bg-line rounded text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Event Editor */}
              <div className="lg:col-span-7 bg-paper border border-line rounded-2xl p-5 space-y-4">
                <h3 className="font-display font-bold text-sm text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4.5 h-4.5 text-brand-blue" />
                  <span>{editingId ? 'Edit Event Detail' : 'Create Event Row'}</span>
                </h3>

                <form onSubmit={handleSaveEvent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-mut">Month string (3 chars)</label>
                      <input 
                        type="text" 
                        value={eventForm.month} 
                        onChange={(e) => setEventForm({ ...eventForm, month: e.target.value })}
                        placeholder="E.g., AUG"
                        className="w-full text-xs p-2.5 border border-line rounded-lg bg-white uppercase font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-mut">Day string (1-2 chars)</label>
                      <input 
                        type="text" 
                        value={eventForm.day} 
                        onChange={(e) => setEventForm({ ...eventForm, day: e.target.value })}
                        placeholder="E.g., 28"
                        className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-mut">Event Location</label>
                      <input 
                        type="text" 
                        value={eventForm.location} 
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        placeholder="E.g., Abuja Center"
                        className="w-full text-xs p-2.5 border border-line rounded-lg bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-mut">Engagement Type</label>
                      <input 
                        type="text" 
                        value={eventForm.type} 
                        onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                        placeholder="E.g., Workshop / Press Hub"
                        className="w-full text-xs p-2.5 border border-line rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase font-bold text-mut">Conference Title</label>
                    <input 
                      type="text" 
                      value={eventForm.title} 
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="E.g., Post-Election Forensic Review"
                      className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase font-bold text-mut">Description Teaser</label>
                    <textarea 
                      value={eventForm.description} 
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="E.g., Live presentation of IReV discrepancy metrics and voter accreditation ratios."
                      className="w-full text-xs p-2.5 border border-line rounded-lg bg-white h-20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-purple hover:bg-purple-700 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Event</span>
                  </button>
                </form>
              </div>

              {/* Event Catalog */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="font-display font-bold text-xs text-mut uppercase tracking-wider">Events Catalog</h3>
                <div className="space-y-2">
                  {events.map(evt => (
                    <div key={evt.id} className="bg-paper border border-line rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-xs">
                      <div>
                        <span className="text-[10px] font-mono text-brand-blue bg-white px-1.5 py-0.5 rounded border border-line uppercase font-bold block mb-1">{evt.month} {evt.day}</span>
                        <h4 className="font-semibold text-xs text-ink leading-snug">{evt.title}</h4>
                        <span className="text-[10px] text-mut font-mono">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(evt.id);
                            setEventForm(evt);
                          }}
                          className="p-1 hover:bg-line rounded text-ink2 hover:text-brand-purple"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete event "${evt.title}"?`)) deleteEvent(evt.id);
                          }}
                          className="p-1 hover:bg-line rounded text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TEAM MEMBERS TAB */}
          {activeTab === 'team' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Team Editor */}
              <div className="lg:col-span-7 bg-paper border border-line rounded-2xl p-5 space-y-4">
                <h3 className="font-display font-bold text-sm text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4.5 h-4.5 text-brand-blue" />
                  <span>{editingId ? 'Edit Team Member' : 'Add Team Member'}</span>
                </h3>

                <form onSubmit={handleSaveTeam} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-mut">Full Name</label>
                      <input 
                        type="text" 
                        value={teamForm.name} 
                        onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                        placeholder="E.g., Dr. Chuka Obi"
                        className="w-full text-xs p-2.5 border border-line rounded-lg bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-mut">Initials / Avatar</label>
                      <input 
                        type="text" 
                        value={teamForm.initials} 
                        onChange={(e) => setTeamForm({ ...teamForm, initials: e.target.value })}
                        placeholder="E.g., CO"
                        maxLength={2}
                        className="w-full text-xs p-2.5 border border-line rounded-lg bg-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase font-bold text-mut">Professional Role</label>
                    <input 
                      type="text" 
                      value={teamForm.role} 
                      onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                      placeholder="E.g., Lead Legal Observer"
                      className="w-full text-xs p-2.5 border border-line rounded-lg bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-purple hover:bg-purple-700 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Team Member</span>
                  </button>
                </form>
              </div>

              {/* Team list directory */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="font-display font-bold text-xs text-mut uppercase tracking-wider">Our People</h3>
                <div className="space-y-2">
                  {team.map(member => (
                    <div key={member.id} className="bg-paper border border-line rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded bg-brand-purple text-white text-xs font-bold font-mono flex items-center justify-center">
                          {member.initials}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-ink leading-snug">{member.name}</h4>
                          <span className="text-[10px] text-mut block">{member.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(member.id);
                            setTeamForm(member);
                          }}
                          className="p-1 hover:bg-line rounded text-ink2 hover:text-brand-purple"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete team member "${member.name}"?`)) deleteTeamMember(member.id);
                          }}
                          className="p-1 hover:bg-line rounded text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* HERO & STATS TAB (VISUAL SITE CMS EDITOR) */}
          {activeTab === 'hero_stats' && (
            <div className="space-y-6">
              
              {/* Guidance Info Banner */}
              <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-2xl p-4 flex items-start gap-3.5">
                <Database className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-xs text-brand-purple uppercase tracking-wider">Visual Section Editor (Hero & Stats)</h4>
                  <p className="text-xs text-ink/80 leading-relaxed">
                    This editing interface is styled <strong>exactly like the live homepage</strong>. You can modify any text, numbers, countdown deadlines, backgrounds, and icons directly in the live templates. Use curly brackets <code>{'{'}glowing text{'}'}</code> in the main title to wrap words in the animated blue-green gradient highlight! Sizing, fonts, and responsive alignments are preserved.
                  </p>
                </div>
              </div>

              {/* Action Buttons Header */}
              <div className="flex items-center justify-between bg-paper p-4 border border-line rounded-xl">
                <div className="text-xs text-mut font-mono">
                  *Changes take effect across the entire site immediately upon saving.
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setLocalHero(heroConfig);
                      setLocalStats(statsConfig);
                      showStatus('Reset unsaved changes in visual editor.');
                    }}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-line rounded-lg text-xs font-semibold text-ink transition-colors cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={() => {
                      saveHeroConfig(localHero);
                      saveStatsConfig(localStats);
                      showStatus('Hero section and live statistics saved successfully!');
                    }}
                    className="px-5 py-2 bg-brand-purple hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-brand-purple/20 transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>

              {/* LIVE PREVIEW HERO LAYOUT WITH DIRECT INPUT FIELDS */}
              <div className="bg-navy rounded-3xl p-6 sm:p-8 relative overflow-hidden text-white border border-white/5">
                {/* Decorative ambient blobs */}
                <div className="absolute top-1/4 left-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                  {/* Left Hero Form */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-blue-300 uppercase tracking-wider font-bold">Eyebrow / Badge Text</label>
                      <input 
                        type="text"
                        value={localHero.badgeText}
                        onChange={(e) => setLocalHero({ ...localHero, badgeText: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-brand-blue outline-none px-3.5 py-2 rounded-xl text-xs font-mono tracking-wide text-blue-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-blue-300 uppercase tracking-wider font-bold">Main Title Header (use {'{'}highlight{'}'} for gradient color)</label>
                      <textarea 
                        value={localHero.title}
                        onChange={(e) => setLocalHero({ ...localHero, title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-brand-blue outline-none p-3 rounded-xl font-display text-sm sm:text-base font-bold leading-relaxed text-white h-20 resize-none"
                        placeholder="Use curly brackets for {highlight}"
                      />
                      {/* Live text highlight render as helper */}
                      <div className="text-[11px] text-blue-200/60 font-medium italic pt-1">
                        Render Preview: "{localHero.title.split(/\{([^}]+)\}/g).map((part, index) => index % 2 === 1 ? <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-green-300 font-bold">{part}</span> : part)}"
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-blue-300 uppercase tracking-wider font-bold">Sub-Description Text</label>
                      <textarea 
                        value={localHero.description}
                        onChange={(e) => setLocalHero({ ...localHero, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-brand-blue outline-none p-3 rounded-xl text-xs text-blue-100 leading-relaxed h-24 resize-none"
                      />
                    </div>

                    {/* Collapsible Custom Theme & Fonts Section */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                          🎨 Hero Typography & Color Customizer
                        </span>
                      </div>

                      {/* Section Background & Accent Colors */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-mono text-blue-200">Hero Section BG</label>
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="color" 
                              value={localHero.heroBgColor || "#1E3A5F"} 
                              onChange={(e) => setLocalHero({ ...localHero, heroBgColor: e.target.value })}
                              className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                            />
                            <input 
                              type="text" 
                              value={localHero.heroBgColor || "#1E3A5F"} 
                              onChange={(e) => setLocalHero({ ...localHero, heroBgColor: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-white text-center"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-mono text-blue-200 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-green-300">Highlight Gradient From</label>
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="color" 
                              value={localHero.titleHighlightFrom || "#93C5FD"} 
                              onChange={(e) => setLocalHero({ ...localHero, titleHighlightFrom: e.target.value })}
                              className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                            />
                            <input 
                              type="text" 
                              value={localHero.titleHighlightFrom || "#93C5FD"} 
                              onChange={(e) => setLocalHero({ ...localHero, titleHighlightFrom: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-white text-center"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-mono text-blue-200 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-green-300">Highlight Gradient To</label>
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="color" 
                              value={localHero.titleHighlightTo || "#86EFAC"} 
                              onChange={(e) => setLocalHero({ ...localHero, titleHighlightTo: e.target.value })}
                              className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                            />
                            <input 
                              type="text" 
                              value={localHero.titleHighlightTo || "#86EFAC"} 
                              onChange={(e) => setLocalHero({ ...localHero, titleHighlightTo: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-white text-center"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Main Title Customizer */}
                      <div className="border-t border-white/5 pt-3 space-y-3">
                        <span className="block text-[10px] font-mono text-blue-300 font-bold uppercase">Main Title Font & Color Settings</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-blue-200">Font Family</label>
                            <select 
                              value={localHero.titleFontFamily || "font-display"}
                              onChange={(e) => setLocalHero({ ...localHero, titleFontFamily: e.target.value })}
                              className="w-full bg-white/10 text-white text-xs rounded p-1.5 border border-white/10 focus:outline-none font-mono"
                            >
                              <option value="font-display">Space Grotesk (Display)</option>
                              <option value="font-sans">Inter (Sans-Serif)</option>
                              <option value="font-mono">IBM Plex Mono (Mono)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-blue-200">Font Size</label>
                            <select 
                              value={localHero.titleFontSize || "text-4xl sm:text-5xl lg:text-6xl"}
                              onChange={(e) => setLocalHero({ ...localHero, titleFontSize: e.target.value })}
                              className="w-full bg-white/10 text-white text-xs rounded p-1.5 border border-white/10 focus:outline-none font-mono"
                            >
                              <option value="text-3xl sm:text-4xl lg:text-5xl">Small Title (3xl-5xl)</option>
                              <option value="text-4xl sm:text-5xl lg:text-6xl">Medium Title (4xl-6xl)</option>
                              <option value="text-5xl sm:text-6xl lg:text-7xl">Large Title (5xl-7xl)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-blue-200">Title Base Color</label>
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="color" 
                                value={localHero.titleColor || "#FFFFFF"} 
                                onChange={(e) => setLocalHero({ ...localHero, titleColor: e.target.value })}
                                className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                              />
                              <input 
                                type="text" 
                                value={localHero.titleColor || "#FFFFFF"} 
                                onChange={(e) => setLocalHero({ ...localHero, titleColor: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[11px] font-mono text-white text-center"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sub-description Customizer */}
                      <div className="border-t border-white/5 pt-3 space-y-3">
                        <span className="block text-[10px] font-mono text-blue-300 font-bold uppercase">Sub-description Font & Color Settings</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-blue-200">Font Family</label>
                            <select 
                              value={localHero.descriptionFontFamily || "font-sans"}
                              onChange={(e) => setLocalHero({ ...localHero, descriptionFontFamily: e.target.value })}
                              className="w-full bg-white/10 text-white text-xs rounded p-1.5 border border-white/10 focus:outline-none font-mono"
                            >
                              <option value="font-sans">Inter (Sans-Serif)</option>
                              <option value="font-display">Space Grotesk (Display)</option>
                              <option value="font-mono">IBM Plex Mono (Mono)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-blue-200">Font Size</label>
                            <select 
                              value={localHero.descriptionFontSize || "text-base sm:text-lg"}
                              onChange={(e) => setLocalHero({ ...localHero, descriptionFontSize: e.target.value })}
                              className="w-full bg-white/10 text-white text-xs rounded p-1.5 border border-white/10 focus:outline-none font-mono"
                            >
                              <option value="text-xs sm:text-sm">Small Description (xs-sm)</option>
                              <option value="text-sm sm:text-base">Medium Description (sm-base)</option>
                              <option value="text-base sm:text-lg">Large Description (base-lg)</option>
                              <option value="text-lg sm:text-xl">X-Large Description (lg-xl)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-blue-200">Description Color</label>
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="color" 
                                value={localHero.descriptionColor || "#DBEAFE"} 
                                onChange={(e) => setLocalHero({ ...localHero, descriptionColor: e.target.value })}
                                className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                              />
                              <input 
                                type="text" 
                                value={localHero.descriptionColor || "#DBEAFE"} 
                                onChange={(e) => setLocalHero({ ...localHero, descriptionColor: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[11px] font-mono text-white text-center"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-blue-300 uppercase tracking-wider font-bold">Primary Button Text</label>
                        <input 
                          type="text"
                          value={localHero.exploreButtonText}
                          onChange={(e) => setLocalHero({ ...localHero, exploreButtonText: e.target.value })}
                          className="w-full bg-brand-blue border border-transparent focus:border-white/20 outline-none px-3.5 py-2 rounded-xl text-xs font-bold text-white text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-blue-300 uppercase tracking-wider font-bold">Secondary Button Text</label>
                        <input 
                          type="text"
                          value={localHero.auditButtonText}
                          onChange={(e) => setLocalHero({ ...localHero, auditButtonText: e.target.value })}
                          className="w-full bg-white/5 border border-white/15 focus:border-white/20 outline-none px-3.5 py-2 rounded-xl text-xs font-bold text-white text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Spotlight Card Form */}
                  <div className="lg:col-span-5 bg-white/5 border border-white/15 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <label className="block text-[9px] font-mono text-blue-300 uppercase tracking-widest font-bold">Spotlight Badge</label>
                        <input 
                          type="text"
                          value={localHero.spotlightBadgeText}
                          onChange={(e) => setLocalHero({ ...localHero, spotlightBadgeText: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-brand-blue outline-none px-2 py-1 rounded text-[10px] font-mono text-blue-300 uppercase"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <label className="block text-[9px] font-mono text-blue-300 uppercase tracking-widest font-bold">Status Badge</label>
                        <input 
                          type="text"
                          value={localHero.spotlightStatusText}
                          onChange={(e) => setLocalHero({ ...localHero, spotlightStatusText: e.target.value })}
                          className="w-full bg-brand-blue/30 text-blue-200 border border-brand-blue/40 px-2 py-1 rounded text-[10px] text-center font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-blue-300 uppercase tracking-widest font-bold">Spotlight Title</label>
                      <input 
                        type="text"
                        value={localHero.spotlightTitle}
                        onChange={(e) => setLocalHero({ ...localHero, spotlightTitle: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-blue outline-none px-2.5 py-1.5 rounded font-display font-bold text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-blue-300 uppercase tracking-widest font-bold">Date & INEC Monitor Info</label>
                      <input 
                        type="text"
                        value={localHero.spotlightDateText}
                        onChange={(e) => setLocalHero({ ...localHero, spotlightDateText: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-blue outline-none px-2.5 py-1.5 rounded text-xs text-blue-200 font-medium"
                      />
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                      <span className="block text-[9px] font-mono uppercase text-blue-300 font-bold">Live Countdown Setting</span>
                      <div className="space-y-1">
                        <label className="block text-[8px] font-mono text-blue-200/70">Target Date (ISO string deadline):</label>
                        <input 
                          type="text"
                          value={localHero.spotlightTargetDate}
                          onChange={(e) => setLocalHero({ ...localHero, spotlightTargetDate: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 focus:border-brand-blue outline-none px-2 py-1 rounded text-xs text-white font-mono"
                          placeholder="YYYY-MM-DDTHH:MM:SS+01:00"
                        />
                      </div>
                    </div>

                    {/* Specifications */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 text-[11px]">
                      <span className="block text-[9px] font-mono uppercase text-blue-300 font-bold">Spotlight Specs</span>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-blue-200 text-[10px]">LGAs:</span>
                          <input 
                            type="text"
                            value={localHero.lgasCount}
                            onChange={(e) => setLocalHero({ ...localHero, lgasCount: e.target.value })}
                            className="bg-white/5 border border-white/10 focus:border-brand-blue outline-none rounded px-2 py-0.5 text-[11px] font-mono text-white text-right w-1/2"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-blue-200 text-[10px]">Registered Voters:</span>
                          <input 
                            type="text"
                            value={localHero.registeredVoters}
                            onChange={(e) => setLocalHero({ ...localHero, registeredVoters: e.target.value })}
                            className="bg-white/5 border border-white/10 focus:border-brand-blue outline-none rounded px-2 py-0.5 text-[11px] font-mono text-white text-right w-1/2"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-blue-200 text-[10px]">Polling Units (PUs):</span>
                          <input 
                            type="text"
                            value={localHero.pollingUnits}
                            onChange={(e) => setLocalHero({ ...localHero, pollingUnits: e.target.value })}
                            className="bg-white/5 border border-white/10 focus:border-brand-blue outline-none rounded px-2 py-0.5 text-[11px] font-mono text-white text-right w-1/2"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 pt-1.5 border-t border-white/5">
                        <label className="block text-[8px] font-mono text-blue-200/70">Specification Detail paragraph:</label>
                        <textarea 
                          value={localHero.spotlightBottomText}
                          onChange={(e) => setLocalHero({ ...localHero, spotlightBottomText: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 focus:border-brand-blue outline-none p-1.5 rounded text-[10px] text-blue-100 leading-normal h-12 resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-blue-300 uppercase tracking-widest font-bold">Bottom Link Text</label>
                      <input 
                        type="text"
                        value={localHero.diaryLinkText}
                        onChange={(e) => setLocalHero({ ...localHero, diaryLinkText: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-blue outline-none px-2 py-1 rounded text-xs text-center text-blue-300 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE PREVIEW STATS LAYOUT WITH DIRECT INPUT FIELDS */}
              <div className="bg-paper border border-line rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-xs text-ink uppercase tracking-wider">Live Statistics Cards Editor</h3>
                  <span className="text-[10px] text-mut font-mono">Preserves specific card colors, icons, values and expand triggers</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {localStats.map((stat) => (
                    <div 
                      key={stat.id}
                      className={`${stat.color} text-white rounded-2xl p-4 relative group overflow-hidden shadow-md flex flex-col justify-between space-y-4`}
                    >
                      {/* Top metadata info */}
                      <div className="flex items-center justify-between gap-1.5 relative z-10">
                        <input 
                          type="text"
                          value={stat.title}
                          onChange={(e) => {
                            const newStats = [...localStats];
                            const idx = newStats.findIndex(s => s.id === stat.id);
                            newStats[idx] = { ...newStats[idx], title: e.target.value };
                            setLocalStats(newStats);
                          }}
                          className="bg-white/10 border border-white/10 focus:border-white/30 outline-none rounded px-1.5 py-0.5 text-[9px] font-mono tracking-wider font-semibold text-white/95 uppercase w-full"
                          title="Card Title"
                        />
                        <div className="shrink-0">
                          <select 
                            value={stat.iconName}
                            onChange={(e) => {
                              const newStats = [...localStats];
                              const idx = newStats.findIndex(s => s.id === stat.id);
                              newStats[idx] = { ...newStats[idx], iconName: e.target.value as any };
                              setLocalStats(newStats);
                            }}
                            className="bg-black/40 text-white text-[9px] font-mono rounded px-1 py-0.5 border border-white/10 focus:outline-none"
                            title="Select Icon"
                          >
                            <option value="Shield">🛡️ Shield</option>
                            <option value="Database">🗄️ Database</option>
                            <option value="FileSpreadsheet">📊 Sheet</option>
                            <option value="Globe">🌐 Globe</option>
                          </select>
                        </div>
                      </div>

                      {/* Display value */}
                      <div className="relative z-10 space-y-1">
                        <label className="block text-[8px] font-mono text-white/70">Primary Audited Value:</label>
                        <input 
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...localStats];
                            const idx = newStats.findIndex(s => s.id === stat.id);
                            newStats[idx] = { ...newStats[idx], value: e.target.value };
                            setLocalStats(newStats);
                          }}
                          className="bg-white/10 border border-white/10 focus:border-white/30 outline-none rounded px-1.5 py-0.5 font-display font-bold text-lg text-white w-full"
                        />
                      </div>

                      {/* Sub text */}
                      <div className="relative z-10 space-y-1">
                        <label className="block text-[8px] font-mono text-white/70">Sub-title / Scope:</label>
                        <input 
                          type="text"
                          value={stat.sub}
                          onChange={(e) => {
                            const newStats = [...localStats];
                            const idx = newStats.findIndex(s => s.id === stat.id);
                            newStats[idx] = { ...newStats[idx], sub: e.target.value };
                            setLocalStats(newStats);
                          }}
                          className="bg-white/10 border border-white/10 focus:border-white/30 outline-none rounded px-1.5 py-0.5 text-[10px] text-white/90 font-medium w-full"
                        />
                      </div>

                      {/* Detail section */}
                      <div className="relative z-10 space-y-1">
                        <label className="block text-[8px] font-mono text-white/70">Expanded hover/click description text:</label>
                        <textarea 
                          value={stat.detail}
                          onChange={(e) => {
                            const newStats = [...localStats];
                            const idx = newStats.findIndex(s => s.id === stat.id);
                            newStats[idx] = { ...newStats[idx], detail: e.target.value };
                            setLocalStats(newStats);
                          }}
                          className="bg-white/10 border border-white/10 focus:border-white/30 outline-none rounded p-1 text-[10px] text-white/95 leading-normal h-16 w-full resize-none"
                        />
                      </div>

                      {/* Color preset picker dropdown */}
                      <div className="relative z-10 space-y-1 pt-1.5 border-t border-white/10">
                        <label className="block text-[8px] font-mono text-white/70">Card Theme Color Preset:</label>
                        <select
                          value={stat.color}
                          onChange={(e) => {
                            const newStats = [...localStats];
                            const idx = newStats.findIndex(s => s.id === stat.id);
                            newStats[idx] = { ...newStats[idx], color: e.target.value };
                            setLocalStats(newStats);
                          }}
                          className="bg-black/30 text-white text-[9px] rounded p-1 w-full border border-white/10 focus:outline-none font-mono"
                        >
                          <option value="bg-gradient-to-br from-blue-600 to-navy-dark">Slate Blue</option>
                          <option value="bg-gradient-to-br from-green-600 to-green-950">Deep Green</option>
                          <option value="bg-gradient-to-br from-brand-purple to-purple-950">Royal Purple</option>
                          <option value="bg-gradient-to-br from-slate-700 to-ink">Ink Charcoal</option>
                          <option value="bg-gradient-to-br from-amber-600 to-amber-950">Warm Amber</option>
                        </select>
                      </div>

                      {/* Collapsible card style editor */}
                      <button
                        type="button"
                        onClick={() => setExpandedStatStyles(expandedStatStyles === stat.id ? null : stat.id)}
                        className="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-mono font-bold tracking-wider uppercase transition-colors text-center cursor-pointer mt-1 border border-white/10 relative z-10"
                      >
                        {expandedStatStyles === stat.id ? 'Hide Style Settings' : '🎨 Customize Card Styles'}
                      </button>

                      {expandedStatStyles === stat.id && (
                        <div className="space-y-3 pt-3 border-t border-white/15 text-[11px] relative z-10 bg-black/25 p-3 rounded-xl">
                          {/* Card Background Setting */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-white/80">Background Style:</label>
                            <select
                              value={stat.cardBgType || 'gradient'}
                              onChange={(e) => {
                                const newStats = [...localStats];
                                const idx = newStats.findIndex(s => s.id === stat.id);
                                newStats[idx] = { ...newStats[idx], cardBgType: e.target.value as any };
                                setLocalStats(newStats);
                              }}
                              className="bg-black/40 text-white text-[10px] rounded p-1 w-full border border-white/10 focus:outline-none font-mono"
                            >
                              <option value="gradient">Gradient Background</option>
                              <option value="solid">Solid Background</option>
                            </select>
                          </div>

                          {stat.cardBgType === 'solid' ? (
                            <div className="space-y-1">
                              <label className="block text-[9px] font-mono text-white/80">Solid Color:</label>
                              <div className="flex items-center gap-1.5">
                                <input 
                                  type="color" 
                                  value={stat.cardBgSolid || '#1E3A5F'} 
                                  onChange={(e) => {
                                    const newStats = [...localStats];
                                    const idx = newStats.findIndex(s => s.id === stat.id);
                                    newStats[idx] = { ...newStats[idx], cardBgSolid: e.target.value };
                                    setLocalStats(newStats);
                                  }}
                                  className="w-6 h-6 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                />
                                <input 
                                  type="text" 
                                  value={stat.cardBgSolid || '#1E3A5F'} 
                                  onChange={(e) => {
                                    const newStats = [...localStats];
                                    const idx = newStats.findIndex(s => s.id === stat.id);
                                    newStats[idx] = { ...newStats[idx], cardBgSolid: e.target.value };
                                    setLocalStats(newStats);
                                  }}
                                  className="w-full bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-white"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="block text-[8px] font-mono text-white/70">Grad From:</label>
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="color" 
                                    value={stat.cardBgGradFrom || '#2563EB'} 
                                    onChange={(e) => {
                                      const newStats = [...localStats];
                                      const idx = newStats.findIndex(s => s.id === stat.id);
                                      newStats[idx] = { ...newStats[idx], cardBgGradFrom: e.target.value };
                                      setLocalStats(newStats);
                                    }}
                                    className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                  />
                                  <input 
                                    type="text" 
                                    value={stat.cardBgGradFrom || '#2563EB'} 
                                    onChange={(e) => {
                                      const newStats = [...localStats];
                                      const idx = newStats.findIndex(s => s.id === stat.id);
                                      newStats[idx] = { ...newStats[idx], cardBgGradFrom: e.target.value };
                                      setLocalStats(newStats);
                                    }}
                                    className="w-full bg-black/40 border border-white/10 rounded px-1 text-[9px] font-mono text-white"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[8px] font-mono text-white/70">Grad To:</label>
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="color" 
                                    value={stat.cardBgGradTo || '#15304F'} 
                                    onChange={(e) => {
                                      const newStats = [...localStats];
                                      const idx = newStats.findIndex(s => s.id === stat.id);
                                      newStats[idx] = { ...newStats[idx], cardBgGradTo: e.target.value };
                                      setLocalStats(newStats);
                                    }}
                                    className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                  />
                                  <input 
                                    type="text" 
                                    value={stat.cardBgGradTo || '#15304F'} 
                                    onChange={(e) => {
                                      const newStats = [...localStats];
                                      const idx = newStats.findIndex(s => s.id === stat.id);
                                      newStats[idx] = { ...newStats[idx], cardBgGradTo: e.target.value };
                                      setLocalStats(newStats);
                                    }}
                                    className="w-full bg-black/40 border border-white/10 rounded px-1 text-[9px] font-mono text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Title Settings */}
                          <div className="space-y-1.5 pt-1.5 border-t border-white/10">
                            <span className="block text-[8px] font-mono uppercase text-white/60 font-bold">Title Text Styles</span>
                            <div className="grid grid-cols-3 gap-1.5">
                              <div>
                                <label className="block text-[7px] text-white/50 uppercase">Font</label>
                                <select
                                  value={stat.titleFontFamily || 'font-mono'}
                                  onChange={(e) => {
                                    const newStats = [...localStats];
                                    const idx = newStats.findIndex(s => s.id === stat.id);
                                    newStats[idx] = { ...newStats[idx], titleFontFamily: e.target.value };
                                    setLocalStats(newStats);
                                  }}
                                  className="bg-black/40 text-white text-[8px] rounded p-0.5 w-full border border-white/10 focus:outline-none"
                                >
                                  <option value="font-mono">Mono</option>
                                  <option value="font-sans">Sans</option>
                                  <option value="font-display">Display</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[7px] text-white/50 uppercase">Size</label>
                                <select
                                  value={stat.titleFontSize || 'text-xs'}
                                  onChange={(e) => {
                                    const newStats = [...localStats];
                                    const idx = newStats.findIndex(s => s.id === stat.id);
                                    newStats[idx] = { ...newStats[idx], titleFontSize: e.target.value };
                                    setLocalStats(newStats);
                                  }}
                                  className="bg-black/40 text-white text-[8px] rounded p-0.5 w-full border border-white/10 focus:outline-none"
                                >
                                  <option value="text-[10px]">Tiny</option>
                                  <option value="text-xs">Small</option>
                                  <option value="text-sm">Medium</option>
                                  <option value="text-base">Large</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[7px] text-white/50 uppercase">Color</label>
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="color" 
                                    value={stat.titleColor || '#E2E8F0'} 
                                    onChange={(e) => {
                                      const newStats = [...localStats];
                                      const idx = newStats.findIndex(s => s.id === stat.id);
                                      newStats[idx] = { ...newStats[idx], titleColor: e.target.value };
                                      setLocalStats(newStats);
                                    }}
                                    className="w-4 h-4 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Value Settings */}
                          <div className="space-y-1.5 pt-1.5 border-t border-white/10">
                            <span className="block text-[8px] font-mono uppercase text-white/60 font-bold">Audited Value Styles</span>
                            <div className="grid grid-cols-3 gap-1.5">
                              <div>
                                <label className="block text-[7px] text-white/50 uppercase">Font</label>
                                <select
                                  value={stat.valueFontFamily || 'font-display'}
                                  onChange={(e) => {
                                    const newStats = [...localStats];
                                    const idx = newStats.findIndex(s => s.id === stat.id);
                                    newStats[idx] = { ...newStats[idx], valueFontFamily: e.target.value };
                                    setLocalStats(newStats);
                                  }}
                                  className="bg-black/40 text-white text-[8px] rounded p-0.5 w-full border border-white/10 focus:outline-none"
                                >
                                  <option value="font-display">Display</option>
                                  <option value="font-sans">Sans</option>
                                  <option value="font-mono">Mono</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[7px] text-white/50 uppercase">Size</label>
                                <select
                                  value={stat.valueFontSize || 'text-3xl sm:text-4xl'}
                                  onChange={(e) => {
                                    const newStats = [...localStats];
                                    const idx = newStats.findIndex(s => s.id === stat.id);
                                    newStats[idx] = { ...newStats[idx], valueFontSize: e.target.value };
                                    setLocalStats(newStats);
                                  }}
                                  className="bg-black/40 text-white text-[8px] rounded p-0.5 w-full border border-white/10 focus:outline-none"
                                >
                                  <option value="text-2xl">2XL</option>
                                  <option value="text-3xl">3XL</option>
                                  <option value="text-4xl">4XL</option>
                                  <option value="text-5xl">5XL</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[7px] text-white/50 uppercase">Color</label>
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="color" 
                                    value={stat.valueColor || '#FFFFFF'} 
                                    onChange={(e) => {
                                      const newStats = [...localStats];
                                      const idx = newStats.findIndex(s => s.id === stat.id);
                                      newStats[idx] = { ...newStats[idx], valueColor: e.target.value };
                                      setLocalStats(newStats);
                                    }}
                                    className="w-4 h-4 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-end gap-3 bg-paper p-4 border border-line rounded-xl">
                <button
                  onClick={() => {
                    setLocalHero(heroConfig);
                    setLocalStats(statsConfig);
                    showStatus('Reset unsaved changes in visual editor.');
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-line rounded-lg text-xs font-semibold text-ink transition-colors cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  onClick={() => {
                    saveHeroConfig(localHero);
                    saveStatsConfig(localStats);
                    showStatus('Hero section and live statistics saved successfully!');
                  }}
                  className="px-5 py-2 bg-brand-purple hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-brand-purple/20 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Changes</span>
                </button>
              </div>

            </div>
          )}

          {/* SUBSCRIBERS TAB */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-2xl p-4 flex items-start gap-3.5">
                <Users className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-xs text-brand-blue uppercase tracking-wider">Subscribers Database</h4>
                  <p className="text-xs text-ink/80 leading-relaxed">
                    This table displays all verified professional subscriptions received through the <strong>AEO update widgets</strong>.
                    Subscribers are synced in real-time with the secure cloud Firestore database.
                  </p>
                </div>
              </div>

              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-paper p-4 border border-line rounded-xl">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-mut" />
                  <input
                    type="text"
                    placeholder="Search subscribers by email..."
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    className="w-full bg-white border border-line rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                </div>
                <div className="text-xs text-ink2 font-mono font-semibold self-center">
                  Total Subscribers: {subscribers.length}
                </div>
              </div>

              {/* Table / List of subscribers */}
              <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-sm">
                {subLoading ? (
                  <div className="p-12 text-center text-sm font-mono text-mut flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
                    <span>Loading secure database sync...</span>
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="p-12 text-center text-sm text-mut leading-relaxed">
                    No active subscribers found in this region database.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-paper border-b border-line text-[10px] font-mono font-bold text-mut uppercase tracking-wider">
                          <th className="px-6 py-4">Email Address</th>
                          <th className="px-6 py-4">Selected Notification Channels</th>
                          <th className="px-6 py-4">Subscribed Date</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-xs">
                        {subscribers
                          .filter(sub => sub.email?.toLowerCase().includes(subSearch.toLowerCase()))
                          .map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-ink font-mono">{sub.email}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {sub.channels && Array.isArray(sub.channels) ? (
                                    sub.channels.map((chan: string, i: number) => (
                                      <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-brand-blue text-[10px] font-semibold border border-blue-100">
                                        {chan}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-mut italic">No channels</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-mut font-mono">
                                {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={async () => {
                                    if (confirm(`Are you sure you want to remove ${sub.email} from subscribers?`)) {
                                      try {
                                        await deleteDoc(doc(db, 'subscribers', sub.id));
                                        showStatus('Subscriber removed from database.');
                                      } catch (err) {
                                        console.error(err);
                                        alert('Failed to delete subscriber.');
                                      }
                                    }
                                  }}
                                  className="p-1.5 hover:bg-rose-50 text-mut hover:text-rose-600 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                                  title="Remove Subscriber"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        {subscribers.filter(sub => sub.email?.toLowerCase().includes(subSearch.toLowerCase())).length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-mut italic">
                              No subscribers match your search term.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer info line */}
        <div className="bg-paper border-t border-line px-6 py-3 flex items-center justify-between text-[11px] text-mut">
          <span>Athena Election Observatory Core Engine v2.0.4</span>
          <span className="font-mono">Offline-First Local Storage Engine</span>
        </div>

      </div>

    </div>
  );
}
