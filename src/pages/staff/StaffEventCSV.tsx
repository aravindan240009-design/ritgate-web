import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet, Upload, X, CheckCircle2, AlertCircle,
  CalendarDays, MapPin, Calendar, Send, Loader2,
  RefreshCw, Info
} from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useActionLock } from '../../context/ActionLockContext';
import { getStaffEvents, uploadEventCsvPreview, confirmEventCsvUpload } from '../../services/api.service';
import PageHeader from '../../components/common/PageHeader';
import TopRefreshControl from '../../components/common/TopRefreshControl';
import { SkeletonList } from '../../components/ui/Skeleton';
import { cn } from '../../utils/cn';
import type { RITGateEvent } from '../../types';

type View = 'events' | 'upload' | 'preview';

interface ParsedRow {
  full_name: string;
  email: string;
  college_name: string;
  phone: string;
  student_id: string;
  department: string;
  course: string;
  valid: boolean;
  error?: string;
}

export default function StaffEventCSV() {
  usePageTitle('Event CSV Upload');
  const { getUserId } = useAuth();
  const { success: toast, error: toastError } = useToast();
  const { withLock, isLocked } = useActionLock();
  const staffCode = getUserId();

  const [view, setView] = useState<View>('events');
  const [events, setEvents] = useState<RITGateEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<RITGateEvent | null>(null);

  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [csvError, setCsvError] = useState('');
  const [previewing, setPreviewing] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const res = await getStaffEvents(staffCode);
      setEvents((res.events as any[]).filter(e => e.status === 'ACTIVE') as RITGateEvent[]);
    } catch { /* silent */ }
    finally { setLoadingEvents(false); setRefreshing(false); }
  }, [staffCode]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const selectEvent = (event: RITGateEvent) => {
    setSelectedEvent(event);
    setFileName('');
    setParsedRows([]);
    setCsvError('');
    setView('upload');
  };

  const parseCSVLocally = (text: string): ParsedRow[] => {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
    return lines.slice(1).map(line => {
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      const get = (key: string) => parts[headers.indexOf(key)] || '';
      const full_name = get('full_name');
      const valid = full_name.length > 1;
      return {
        full_name,
        email: get('email'),
        college_name: get('college_name'),
        phone: get('phone'),
        student_id: get('student_id'),
        department: get('department'),
        course: get('course'),
        valid,
        error: valid ? undefined : 'full_name is required',
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEvent) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvError('Only .csv files are accepted'); return;
    }
    setCsvError('');
    setFileName(file.name);
    setPreviewing(true);

    const reader = new FileReader();
    reader.onload = async ev => {
      const localRows = parseCSVLocally(ev.target?.result as string);
      setParsedRows(localRows);
      try {
        const res = await uploadEventCsvPreview(selectedEvent.id, staffCode, file);
        if (res.success && res.rows) {
          setParsedRows((res.rows as any[]).map(r => ({
            full_name: r.full_name || '',
            email: r.email || '',
            college_name: r.college_name || '',
            phone: r.phone || '',
            student_id: r.student_id || '',
            department: r.department || '',
            course: r.course || '',
            valid: !!r.full_name,
            error: r.full_name ? undefined : 'full_name is required',
          })));
        }
        setView('preview');
      } catch {
        if (localRows.length > 0) setView('preview');
        else setCsvError('Could not parse CSV — check the file format.');
      } finally { setPreviewing(false); }
    };
    reader.readAsText(file);
  };

  const handleConfirm = async () => {
    if (!selectedEvent) return;
    const valid = parsedRows.filter(r => r.valid);
    if (valid.length === 0) return toastError('No Valid Rows', 'Fix errors in the CSV and re-upload');

    await withLock(async () => {
      const rows = valid.map(({ valid: _v, error: _e, ...rest }) => rest);
      const res = await confirmEventCsvUpload(selectedEvent.id, staffCode, rows);
      if (res.success) {
        toast('Passes Created', `${valid.length} gate pass(es) dispatched for "${selectedEvent.eventName}"`);
        setView('events');
        setSelectedEvent(null);
        setParsedRows([]);
        setFileName('');
        loadEvents();
      } else {
        toastError('Failed', res.message || 'Could not confirm upload');
      }
    }, 'Creating passes...');
  };

  const statusDot = (status: string) =>
    status === 'ACTIVE' ? 'bg-emerald-500' : status === 'COMPLETED' ? 'bg-slate-400' : 'bg-rose-500';
  const statusColor = (status: string) =>
    status === 'ACTIVE' ? 'text-emerald-600' : status === 'COMPLETED' ? 'text-slate-500' : 'text-rose-600';
  const statusBg = (status: string) =>
    status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/20' : status === 'COMPLETED' ? 'bg-slate-50 dark:bg-slate-800/30' : 'bg-rose-50 dark:bg-rose-900/20';

  const validRows = parsedRows.filter(r => r.valid);
  const invalidRows = parsedRows.filter(r => !r.valid);

  // ─── Preview ──────────────────────────────────────────────────────────────────
  if (view === 'preview' && selectedEvent) {
    return (
      <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen">
        <PageHeader title="Review Participants" onBack={() => setView('upload')} />
        <div className="px-5 py-5 pb-28 space-y-5">
          <div className="bg-[var(--color-primary)] rounded-[24px] px-5 py-4 flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-white/70 shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-black text-[15px] truncate">{selectedEvent.eventName}</p>
              <p className="text-white/70 text-[12px] font-bold">{selectedEvent.eventDate} · {selectedEvent.venue || 'No venue'}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center border border-emerald-100 dark:border-emerald-800">
              <p className="text-[28px] font-black text-emerald-600 leading-none">{validRows.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Valid</p>
            </div>
            <div className={cn('flex-1 rounded-2xl p-4 text-center border', invalidRows.length > 0 ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800')}>
              <p className={cn('text-[28px] font-black leading-none', invalidRows.length > 0 ? 'text-rose-500' : 'text-slate-300')}>{invalidRows.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Invalid</p>
            </div>
          </div>

          {invalidRows.length > 0 && (
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl px-4 py-3">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[12px] font-bold text-amber-700 dark:text-amber-400">
                {invalidRows.length} row(s) have errors and will be skipped.
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden max-h-[320px] overflow-y-auto">
            <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 sticky top-0">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Participants ({parsedRows.length})</p>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {parsedRows.map((row, i) => (
                <div key={i} className={cn('flex items-center gap-3 px-5 py-3', !row.valid ? 'bg-rose-50/30 dark:bg-rose-900/10' : '')}>
                  {row.valid
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[13px] font-black truncate', row.valid ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400')}>
                      {row.full_name || '(empty)'}
                    </p>
                    {row.email && <p className="text-[11px] font-bold text-slate-400 truncate">{row.email}</p>}
                    {row.error && <p className="text-[10px] font-bold text-rose-500">{row.error}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isLocked || validRows.length === 0}
            className="w-full h-14 bg-[var(--color-primary)] rounded-2xl text-white font-black text-[14px] uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {isLocked
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <><Send className="w-5 h-5" /> Confirm &amp; Create {validRows.length} Pass{validRows.length !== 1 ? 'es' : ''}</>}
          </button>
        </div>
      </div>
    );
  }

  // ─── Upload ───────────────────────────────────────────────────────────────────
  if (view === 'upload' && selectedEvent) {
    return (
      <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen">
        <PageHeader title="Upload Participants" onBack={() => { setView('events'); setSelectedEvent(null); }} />
        <div className="px-5 py-5 pb-28 space-y-5">
          <div className="bg-[var(--color-primary)] rounded-[24px] px-5 py-4 flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-white/70 shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-black text-[15px] truncate">{selectedEvent.eventName}</p>
              <p className="text-white/70 text-[12px] font-bold">{selectedEvent.eventDate} · {selectedEvent.venue || 'No venue'}</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-[24px] p-4 space-y-2">
            <p className="text-[12px] font-black text-[var(--color-primary)] uppercase tracking-widest">Required CSV Columns</p>
            <div className="flex flex-wrap gap-2">
              {['full_name *', 'email *', 'college_name *', 'phone *', 'student_id', 'department', 'course'].map(col => (
                <span key={col} className={cn('px-2.5 py-1 rounded-lg text-[11px] font-black border',
                  col.includes('*')
                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500')}>
                  {col.replace(' *', '')}{col.includes('*') ? ' *' : ''}
                </span>
              ))}
            </div>
            <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Max 500 rows · Only .csv files accepted</p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">CSV File</label>
            <input type="file" accept=".csv,text/csv" id="csv-input" onChange={handleFileChange} className="hidden" />
            <AnimatePresence mode="wait">
              {previewing ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-12 bg-white dark:bg-slate-900 rounded-[28px] border-2 border-dashed border-[var(--color-primary)]/40">
                  <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
                  <p className="text-[13px] font-black text-[var(--color-primary)] uppercase tracking-widest">Parsing {fileName}…</p>
                </motion.div>
              ) : fileName ? (
                <motion.div key="file" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300 flex-1 truncate">{fileName}</span>
                  <button onClick={() => { setFileName(''); setParsedRows([]); setCsvError(''); }}
                    className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.label key="upload" htmlFor="csv-input" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3 py-12 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[28px] text-slate-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                  <Upload className="w-10 h-10" />
                  <span className="text-[13px] font-black uppercase tracking-widest">Select CSV File</span>
                  <span className="text-[11px] font-medium">Tap to choose from device</span>
                </motion.label>
              )}
            </AnimatePresence>
            {csvError && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <p className="text-[12px] font-bold text-rose-600 dark:text-rose-400">{csvError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Event List ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen">
      <PageHeader title="Event CSV Upload" />
      <TopRefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadEvents(); }}>
        <div className="px-5 pt-5 pb-28 space-y-5">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-[24px] p-4 flex gap-3">
            <Info className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <p className="text-[12px] font-bold text-blue-700 dark:text-blue-400 leading-relaxed">
              Upload a CSV of external participants for events where you are assigned as coordinator by your HOD.
            </p>
          </div>

          {loadingEvents ? (
            <SkeletonList count={3} />
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-5">
                <CalendarDays className="w-10 h-10 text-slate-200 dark:text-slate-800" />
              </div>
              <h5 className="text-[17px] font-black text-slate-900 dark:text-white mb-1.5">No Active Events</h5>
              <p className="text-[13px] font-medium text-slate-400 max-w-[240px] leading-relaxed italic mb-4">
                You haven't been assigned as coordinator for any active events yet.
              </p>
              <button onClick={() => { setRefreshing(true); loadEvents(); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 text-[13px] font-black uppercase tracking-widest">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Assigned Events</p>
              {events.map(event => (
                <motion.button key={event.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => selectEvent(event)}
                  className="w-full bg-white dark:bg-slate-900 rounded-[28px] p-5 border border-slate-100 dark:border-slate-800 shadow-sm text-left active:scale-[0.98] transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center shrink-0">
                        <CalendarDays className="w-6 h-6 text-[var(--color-primary)]" />
                      </div>
                      <h5 className="text-[15px] font-black text-slate-900 dark:text-white truncate">{event.eventName}</h5>
                    </div>
                    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0', statusBg(event.status))}>
                      <div className={cn('w-1.5 h-1.5 rounded-full', statusDot(event.status))} />
                      <span className={cn('text-[10px] font-black uppercase tracking-widest', statusColor(event.status))}>{event.status}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 pl-[3.75rem]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[12px] font-bold text-slate-500">{event.eventDate}</span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[12px] font-bold text-slate-500 truncate">{event.venue}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 h-9 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-[12px] font-black text-[var(--color-primary)] uppercase tracking-widest">Upload Participants CSV</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </TopRefreshControl>
    </div>
  );
}
