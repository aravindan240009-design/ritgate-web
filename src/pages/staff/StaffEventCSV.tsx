import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet, Upload, X, CheckCircle2, AlertCircle,
  CalendarDays, MapPin, Calendar, Send, Loader2,
  RefreshCw, Info, PartyPopper, Pencil, Trash2,
  Users, Share2, UserPlus
} from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useActionLock } from '../../context/ActionLockContext';
import {
  getStaffEvents, uploadEventCsvPreview, confirmEventCsvUpload,
  getEventPasses, addSingleEventPass, deleteEventPass,
} from '../../services/api.service';
import PageHeader from '../../components/common/PageHeader';
import TopRefreshControl from '../../components/common/TopRefreshControl';
import { SkeletonList } from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import VisitorAvatar from '../../components/common/VisitorAvatar';
import { cn } from '../../utils/cn';
import type { RITGateEvent } from '../../types';
import { useAdaptive } from '../../utils/useAdaptive';
import DesktopPageHeader from '../../components/desktop/DesktopPageHeader';
import EmptyState from '../../components/ui/EmptyState';
import { shareVisitorInfo } from '../../utils/share';

type View = 'events' | 'upload' | 'preview' | 'result' | 'visitors';

interface UploadResult {
  total: number;
  issued: number;
  failed: number;
  skipped?: number;
  errors?: { name?: string; email?: string; reason?: string }[];
}

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

interface EventPassItem {
  id: number;
  fullName: string;
  email: string;
  collegeName: string;
  phone: string;
  studentId?: string;
  department?: string;
  course?: string;
  status: string;
  manualEntryCode?: string;
  photoUrl?: string;
}

interface SingleParticipantForm {
  fullName: string;
  email: string;
  collegeName: string;
  phone: string;
  studentId: string;
  department: string;
  course: string;
}

const EMPTY_SINGLE_FORM: SingleParticipantForm = {
  fullName: '', email: '', collegeName: '', phone: '', studentId: '', department: '', course: '',
};

const EMAIL_RE = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function validateRow(row: ParsedRow, allRows: ParsedRow[], index: number): ParsedRow {
  const errors: string[] = [];
  if (!row.full_name?.trim()) errors.push('full_name is required');
  if (!row.college_name?.trim()) errors.push('college_name is required');
  if (!row.phone?.trim()) errors.push('phone is required');
  if (!row.email?.trim()) {
    errors.push('email is required');
  } else if (!EMAIL_RE.test(row.email.trim())) {
    errors.push('invalid email format');
  } else {
    const dupe = allRows.some((r, i) => i !== index && r.email?.trim().toLowerCase() === row.email?.trim().toLowerCase());
    if (dupe) errors.push('duplicate email');
  }
  return { ...row, valid: errors.length === 0, error: errors.length > 0 ? errors.join('; ') : undefined };
}

function revalidateAll(rows: ParsedRow[]): ParsedRow[] {
  return rows.map((r, i) => validateRow(r, rows, i));
}

export default function StaffEventCSV() {
  usePageTitle('Event CSV Upload');
  const { isDesktop } = useAdaptive();
  const { getUserId } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
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
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<ParsedRow | null>(null);

  // ── Add Single Participant ──────────────────────────────────────────────────
  const [singleForm, setSingleForm] = useState<SingleParticipantForm>(EMPTY_SINGLE_FORM);
  const [singleErrors, setSingleErrors] = useState<Partial<Record<keyof SingleParticipantForm, string>>>({});
  const [singleSubmitting, setSingleSubmitting] = useState(false);

  // ── Pre-Registered Visitors list ────────────────────────────────────────────
  const [passes, setPasses] = useState<EventPassItem[]>([]);
  const [loadingPasses, setLoadingPasses] = useState(false);
  const [sharingId, setSharingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<EventPassItem | null>(null);

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
          const rows = (res.rows as any[]).map(r => ({
            full_name: r.fullName ?? r.full_name ?? '',
            email: r.email || '',
            college_name: r.collegeName ?? r.college_name ?? '',
            phone: r.phone || '',
            student_id: r.studentId ?? r.student_id ?? '',
            department: r.department || '',
            course: r.course || '',
            valid: true,
            error: undefined as string | undefined,
          }));
          setParsedRows(revalidateAll(rows));
        } else {
          setParsedRows(revalidateAll(localRows));
        }
        setView('preview');
      } catch {
        if (localRows.length > 0) { setParsedRows(revalidateAll(localRows)); setView('preview'); }
        else setCsvError('Could not parse CSV — check the file format.');
      } finally { setPreviewing(false); }
    };
    reader.readAsText(file);
  };

  const deleteRow = (index: number) => {
    setParsedRows(prev => revalidateAll(prev.filter((_, i) => i !== index)));
  };

  const openEdit = (index: number) => {
    setEditIndex(index);
    setEditDraft({ ...parsedRows[index] });
  };

  const saveEdit = () => {
    if (editIndex === null || !editDraft) return;
    setParsedRows(prev => revalidateAll(prev.map((r, i) => (i === editIndex ? editDraft : r))));
    setEditIndex(null);
    setEditDraft(null);
  };

  // ── Add Single Participant ──────────────────────────────────────────────────
  const validateSingleForm = (): boolean => {
    const errs: Partial<Record<keyof SingleParticipantForm, string>> = {};
    if (!singleForm.fullName.trim()) errs.fullName = 'Full name is required';
    if (!singleForm.email.trim()) errs.email = 'Email is required';
    else if (!EMAIL_RE.test(singleForm.email.trim())) errs.email = 'Invalid email format';
    if (!singleForm.collegeName.trim()) errs.collegeName = 'College name is required';
    if (!singleForm.phone.trim()) errs.phone = 'Phone is required';
    setSingleErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSingleParticipant = async () => {
    if (!selectedEvent || singleSubmitting) return;
    if (!validateSingleForm()) return;

    setSingleSubmitting(true);
    try {
      const res = await addSingleEventPass(selectedEvent.id, staffCode, {
        fullName: singleForm.fullName.trim(),
        email: singleForm.email.trim(),
        collegeName: singleForm.collegeName.trim(),
        phone: singleForm.phone.trim(),
        studentId: singleForm.studentId.trim() || undefined,
        department: singleForm.department.trim() || undefined,
        course: singleForm.course.trim() || undefined,
      });
      if (res.success) {
        toastSuccess('Pass Issued', `${singleForm.fullName} has been emailed their QR pass.`);
        setSingleForm(EMPTY_SINGLE_FORM);
        setSingleErrors({});
      } else {
        toastError('Could Not Issue Pass', res.message || 'Please check the details and try again.');
      }
    } catch {
      toastError('Could Not Issue Pass', 'Something went wrong. Please try again.');
    } finally {
      setSingleSubmitting(false);
    }
  };

  // ── Pre-Registered Visitors list ────────────────────────────────────────────
  const viewVisitors = async (event: RITGateEvent) => {
    setSelectedEvent(event);
    setView('visitors');
    setLoadingPasses(true);
    try {
      const res = await getEventPasses(event.id);
      if (res.success) setPasses(res.passes as EventPassItem[]);
      else toastError('Could Not Load', res.message || 'Failed to load pre-registered visitors.');
    } finally {
      setLoadingPasses(false);
    }
  };

  const handleShare = async (pass: EventPassItem) => {
    if (!selectedEvent || sharingId !== null) return;
    setSharingId(pass.id);
    try {
      const result = await shareVisitorInfo({
        name: pass.fullName,
        eventName: selectedEvent.eventName,
        eventDate: selectedEvent.eventDate,
        venue: selectedEvent.venue,
        manualEntryCode: pass.manualEntryCode,
      });
      if (result === 'shared') toastSuccess('Shared', `${pass.fullName}'s pass details were shared.`);
      else if (result === 'copied') toastSuccess('Copied to Clipboard', `${pass.fullName}'s pass details were copied.`);
      else if (result === 'unavailable') toastError('Share Unavailable', 'Sharing is not supported on this device or browser.');
      else if (result === 'error') toastError('Share Failed', 'Could not share the pass details.');
      // 'cancelled' → user backed out of the native share sheet, no feedback needed
    } finally {
      setSharingId(null);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete || !selectedEvent) return;
    setDeletingId(confirmDelete.id);
    try {
      const res = await deleteEventPass(selectedEvent.id, confirmDelete.id, staffCode);
      if (res.success) {
        setPasses(prev => prev.filter(p => p.id !== confirmDelete.id));
        toastSuccess('Deleted', `${confirmDelete.fullName}'s pre-registration was deleted.`);
      } else {
        toastError('Delete Failed', res.message || 'Could not delete pre-registration.');
      }
    } catch {
      toastError('Delete Failed', 'Could not delete pre-registration.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handleConfirm = async () => {
    if (!selectedEvent) return;
    const valid = parsedRows.filter(r => r.valid);
    if (valid.length === 0) return toastError('No Valid Rows', 'Fix errors in the CSV and re-upload');

    await withLock(async () => {
      const rows = valid.map(r => ({
        fullName: r.full_name,
        email: r.email,
        collegeName: r.college_name,
        phone: r.phone,
        studentId: r.student_id || undefined,
        department: r.department || undefined,
        course: r.course || undefined,
      }));
      const res = await confirmEventCsvUpload(selectedEvent.id, staffCode, rows);
      if (res.success) {
        const result = (res as any).result || {};
        const total = result.total ?? valid.length;
        const failed = result.failed ?? 0;
        setUploadResult({
          total,
          issued: result.issued ?? (total - failed),
          failed,
          skipped: result.skipped ?? 0,
          errors: result.errors || [],
        });
        setView('result');
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

  // ─── Result ───────────────────────────────────────────────────────────────────
  if (view === 'result' && selectedEvent && uploadResult) {
    const allIssued = uploadResult.failed === 0;
    return (
      <div className="min-h-screen lg:bg-transparent lg:min-h-0 bg-[#F8FAFC] dark:bg-slate-950">
        <PageHeader title="Upload Complete" onBack={() => { setView('events'); setSelectedEvent(null); setUploadResult(null); }} />
        {isDesktop && <DesktopPageHeader title="Upload Complete" subtitle="Review event visitor pass creation results" />}
        <div className="px-5 py-5 pb-28 space-y-5 lg:px-0 lg:py-0 lg:max-w-none">
          <div className="flex flex-col items-center pt-6 pb-2 gap-4">
            <div className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center shadow-lg',
              allIssued
                ? 'bg-emerald-500 shadow-emerald-200 dark:shadow-none'
                : 'bg-amber-500 shadow-amber-200 dark:shadow-none'
            )}>
              {allIssued
                ? <PartyPopper className="w-12 h-12 text-white" />
                : <AlertCircle className="w-12 h-12 text-white" />}
            </div>
            <div className="text-center">
              <h2 className="text-[22px] font-black text-slate-900 dark:text-white leading-none mb-2">
                {allIssued ? 'All Passes Issued!' : 'Partially Complete'}
              </h2>
              <p className="text-[14px] font-bold text-slate-500">{selectedEvent.eventName}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex">
            <div className="flex-1 py-5 flex flex-col items-center gap-1.5 border-r border-slate-100 dark:border-slate-800">
              <span className="text-[28px] font-black text-slate-900 dark:text-white leading-none">{uploadResult.total}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
            </div>
            <div className="flex-1 py-5 flex flex-col items-center gap-1.5 border-r border-slate-100 dark:border-slate-800">
              <span className="text-[28px] font-black text-emerald-600 leading-none">{uploadResult.issued}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issued</span>
            </div>
            <div className={cn('flex-1 py-5 flex flex-col items-center gap-1.5', !!uploadResult.skipped && 'border-r border-slate-100 dark:border-slate-800')}>
              <span className={cn(
                'text-[28px] font-black leading-none',
                uploadResult.failed > 0 ? 'text-rose-500' : 'text-slate-300 dark:text-slate-700'
              )}>
                {uploadResult.failed}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Failed</span>
            </div>
            {!!uploadResult.skipped && (
              <div className="flex-1 py-5 flex flex-col items-center gap-1.5">
                <span className="text-[28px] font-black text-amber-500 leading-none">{uploadResult.skipped}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skipped</span>
              </div>
            )}
          </div>
          {!!uploadResult.skipped && (
            <p className="text-[11px] font-bold text-slate-400 -mt-3 px-1">
              {uploadResult.skipped} duplicate email{uploadResult.skipped !== 1 ? 's were' : ' was'} already registered and skipped.
            </p>
          )}

          {uploadResult.failed > 0 && uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-rose-50/70 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-800/50">
                <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                  Failed Entries ({uploadResult.failed})
                </p>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50 max-h-[240px] overflow-y-auto">
                {uploadResult.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      {err.name && <p className="text-[13px] font-black text-slate-900 dark:text-white truncate">{err.name}</p>}
                      {err.email && <p className="text-[11px] font-bold text-slate-400 truncate">{err.email}</p>}
                      {err.reason && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{err.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl px-4 py-3">
            <Info className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <p className="text-[12px] font-bold text-blue-700 dark:text-blue-400 leading-relaxed">
              Each participant has received an email with their unique QR code. Passes are valid until midnight on {selectedEvent.eventDate}.
            </p>
          </div>

          <button
            onClick={() => { setView('events'); setSelectedEvent(null); setUploadResult(null); }}
            className="w-full h-14 bg-[var(--color-primary)] rounded-2xl text-white font-black text-[14px] uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none flex items-center justify-center active:scale-[0.98] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ─── Pre-Registered Visitors ────────────────────────────────────────────────
  if (view === 'visitors' && selectedEvent) {
    return (
      <div className="min-h-screen lg:bg-transparent lg:min-h-0 bg-[#F8FAFC] dark:bg-slate-950">
        <PageHeader title="Pre-Registered Visitors" onBack={() => { setView('events'); setSelectedEvent(null); setPasses([]); }} />
        {isDesktop && <DesktopPageHeader title="Pre-Registered Visitors" subtitle={`${selectedEvent.eventName} · ${passes.length} issued`} />}
        <div className="px-5 py-5 pb-28 space-y-4 lg:px-0 lg:py-0 lg:max-w-none">
          <div className="bg-[var(--color-primary)] rounded-[24px] px-5 py-4 flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-white/70 shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-black text-[15px] truncate">{selectedEvent.eventName}</p>
              <p className="text-white/70 text-[12px] font-bold">
                {passes.length} pre-registered visitor{passes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {loadingPasses ? (
            <SkeletonList count={4} />
          ) : passes.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No Visitors Yet"
              description="Upload a CSV or add a single participant to issue passes."
              action={<button onClick={() => setView('upload')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] rounded-2xl text-white text-[13px] font-black uppercase tracking-widest">
                <UserPlus className="w-4 h-4" /> Add Participants
              </button>}
            />
          ) : (
            <div className="space-y-3">
              {passes.map(pass => (
                <motion.div key={pass.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-slate-100 dark:border-slate-800">
                  <VisitorAvatar name={pass.fullName} photoUrl={pass.photoUrl} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-black text-slate-900 dark:text-white truncate">{pass.fullName}</p>
                      {pass.status === 'EMAIL_FAILED' && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase tracking-wide">
                          Email Failed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 truncate">
                      {pass.collegeName}{pass.department ? ` · ${pass.department}` : ''}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 truncate">{pass.email}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleShare(pass)}
                      disabled={sharingId === pass.id}
                      aria-label={`Share ${pass.fullName}'s pass`}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 active:scale-90 transition-all disabled:opacity-50"
                    >
                      {sharingId === pass.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Share2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(pass)}
                      disabled={deletingId === pass.id}
                      aria-label={`Delete ${pass.fullName}'s pre-registration`}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 active:scale-90 transition-all disabled:opacity-50"
                    >
                      {deletingId === pass.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <ConfirmationModal
          visible={!!confirmDelete}
          title="Delete Pre-Registration?"
          message={confirmDelete ? `This will permanently delete ${confirmDelete.fullName}'s pass and QR code. This cannot be undone.` : ''}
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="bg-rose-500 hover:bg-rose-600"
          icon={<Trash2 className="w-9 h-9 text-rose-600" />}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    );
  }

  // ─── Preview ──────────────────────────────────────────────────────────────────
  if (view === 'preview' && selectedEvent) {
    return (
      <div className="min-h-screen lg:bg-transparent lg:min-h-0 bg-[#F8FAFC] dark:bg-slate-950">
        <PageHeader title="Review Participants" onBack={() => setView('upload')} />
        {isDesktop && <DesktopPageHeader title="Review Participants" subtitle="Validate participant rows before issuing passes" />}
        <div className="px-5 py-5 pb-28 space-y-5 lg:px-0 lg:py-0 lg:max-w-none">
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
                <div key={i} className={cn('flex items-start gap-3 px-5 py-3', !row.valid ? 'bg-rose-50/30 dark:bg-rose-900/10' : '')}>
                  {row.valid
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[13px] font-black truncate', row.valid ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400')}>
                      {row.full_name || '(empty)'}
                    </p>
                    {row.email && <p className="text-[11px] font-bold text-slate-400 truncate">{row.email}</p>}
                    {(row.college_name || row.phone) && (
                      <p className="text-[11px] font-bold text-slate-400 truncate">{row.college_name}{row.college_name && row.phone ? ' · ' : ''}{row.phone}</p>
                    )}
                    {row.error && <p className="text-[10px] font-bold text-rose-500 mt-0.5">{row.error}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(i)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 active:scale-90 transition-all"
                      aria-label="Edit row"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRow(i)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 active:scale-90 transition-all"
                      aria-label="Delete row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {parsedRows.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-[12px] font-bold text-slate-400">No participants left. Go back and re-upload.</p>
                </div>
              )}
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

        <Modal
          isOpen={editIndex !== null && !!editDraft}
          onClose={() => { setEditIndex(null); setEditDraft(null); }}
          title={`Edit Row ${editIndex !== null ? editIndex + 1 : ''}`}
          size="md"
        >
          {editDraft && (
            <div className="space-y-3.5">
              {([
                { key: 'full_name', label: 'Full Name *' },
                { key: 'email', label: 'Email *' },
                { key: 'college_name', label: 'College Name *' },
                { key: 'phone', label: 'Phone *' },
                { key: 'student_id', label: 'Student ID' },
                { key: 'department', label: 'Department' },
                { key: 'course', label: 'Course' },
              ] as { key: keyof ParsedRow; label: string }[]).map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
                  <input
                    value={(editDraft[key] as string) || ''}
                    onChange={e => setEditDraft(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3.5 text-[13px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setEditIndex(null); setEditDraft(null); }}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[13px]"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 h-11 rounded-xl bg-[var(--color-primary)] text-white font-black text-[13px] uppercase tracking-widest"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // ─── Upload ───────────────────────────────────────────────────────────────────
  if (view === 'upload' && selectedEvent) {
    return (
      <div className="min-h-screen lg:bg-transparent lg:min-h-0 bg-[#F8FAFC] dark:bg-slate-950">
        <PageHeader
          title="Upload Participants"
          onBack={() => { setView('events'); setSelectedEvent(null); }}
          right={
            <button
              onClick={() => viewVisitors(selectedEvent)}
              className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-white active:scale-90 transition-transform"
              aria-label="View pre-registered visitors"
            >
              <Users className="w-5 h-5" />
            </button>
          }
        />
        {isDesktop && (
          <DesktopPageHeader
            title="Upload Participants"
            subtitle="Upload and manage event visitor/pass data"
            action={
              <button
                onClick={() => viewVisitors(selectedEvent)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 text-[13px] font-black uppercase tracking-widest"
              >
                <Users className="w-4 h-4" /> View Visitors
              </button>
            }
          />
        )}
        <div className="px-5 py-5 pb-28 space-y-5 lg:px-0 lg:py-0 lg:max-w-none">
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
            <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
              Max 500 rows · Can upload multiple times · Duplicate emails are skipped automatically
            </p>
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

          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[var(--color-primary)]" />
              <p className="text-[14px] font-black text-slate-900 dark:text-white">Add Single Participant</p>
            </div>
            <p className="text-[11px] font-bold text-slate-400 -mt-2">
              Type in details directly to issue a single QR pass. Duplicate emails are rejected.
            </p>

            <div className="space-y-3.5">
              {([
                { key: 'fullName', label: 'Full Name *', placeholder: 'Full Name' },
                { key: 'email', label: 'Email *', placeholder: 'Email' },
                { key: 'collegeName', label: 'College Name *', placeholder: 'College Name' },
                { key: 'phone', label: 'Phone *', placeholder: 'Phone' },
                { key: 'studentId', label: 'Student ID', placeholder: 'Student ID (optional)' },
                { key: 'department', label: 'Department', placeholder: 'Department (optional)' },
                { key: 'course', label: 'Course', placeholder: 'Course (optional)' },
              ] as { key: keyof SingleParticipantForm; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
                  <input
                    value={singleForm[key]}
                    disabled={singleSubmitting}
                    onChange={e => setSingleForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={cn(
                      'w-full h-11 bg-slate-50 dark:bg-slate-800 border rounded-xl px-3.5 text-[13px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all disabled:opacity-60',
                      singleErrors[key]
                        ? 'border-rose-300 focus:border-rose-400'
                        : 'border-slate-100 dark:border-slate-700 focus:border-[var(--color-primary)]'
                    )}
                  />
                  {singleErrors[key] && (
                    <p className="text-[10px] font-bold text-rose-500 ml-1">{singleErrors[key]}</p>
                  )}
                </div>
              ))}

              <button
                onClick={handleAddSingleParticipant}
                disabled={singleSubmitting}
                className="w-full h-12 bg-[var(--color-primary)] rounded-xl text-white font-black text-[13px] uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all"
              >
                {singleSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Issuing…</>
                  : <><Send className="w-4 h-4" /> Issue Pass &amp; Send Email</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Event List ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen lg:bg-transparent lg:min-h-0 bg-[#F8FAFC] dark:bg-slate-950">
      <PageHeader title="Event CSV Upload" />
      {isDesktop && <DesktopPageHeader title="Event CSV" subtitle="Upload and manage event visitor/pass data" />}
      <TopRefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadEvents(); }}>
        <div className="px-5 pt-5 pb-28 space-y-5 lg:px-0 lg:pt-0 lg:pb-8 lg:max-w-none">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-[24px] p-4 flex gap-3 lg:desktop-card lg:p-5">
            <Info className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <p className="text-[12px] font-bold text-blue-700 dark:text-blue-400 leading-relaxed">
              Upload a CSV of external participants for events where you are assigned as coordinator by your HOD.
            </p>
          </div>

          {loadingEvents ? (
            <SkeletonList count={3} />
          ) : events.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="w-8 h-8" />}
              title="No Active Events"
              description="You haven't been assigned as coordinator for any active events yet."
              action={<button onClick={() => { setRefreshing(true); loadEvents(); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 text-[13px] font-black uppercase tracking-widest">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Assigned Events</p>
              {events.map(event => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-white dark:bg-slate-900 rounded-[28px] p-5 border border-slate-100 dark:border-slate-800 shadow-sm text-left">
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
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => selectEvent(event)}
                      className="flex-1 h-9 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Upload className="w-4 h-4 text-[var(--color-primary)]" />
                      <span className="text-[12px] font-black text-[var(--color-primary)] uppercase tracking-widest">Upload</span>
                    </button>
                    <button
                      onClick={() => viewVisitors(event)}
                      className="flex-1 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Users className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      <span className="text-[12px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Visitors</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </TopRefreshControl>
    </div>
  );
}
