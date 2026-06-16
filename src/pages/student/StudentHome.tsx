import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardList,
  ShieldCheck,
  QrCode,
  AlertCircle,
  FileText,
  Ban,
  UserCheck
} from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAuth } from '../../context/AuthContext';
import { useRefresh } from '../../context/RefreshContext';
import { useToast } from '../../context/ToastContext';
import { getStudentGatePassRequests, getGatePassQRCode } from '../../services/api.service';
import TopMenuBar from '../../components/common/TopMenuBar';
import TopRefreshControl from '../../components/common/TopRefreshControl';
import { SkeletonList } from '../../components/ui/Skeleton';
import GatePassQRModal from '../../components/common/GatePassQRModal';
import RequestDetailsModal from '../../components/common/RequestDetailsModal';
import { cn } from '../../utils/cn';
import type { Student } from '../../types';
import { formatDateTime, isToday } from '../../utils/dateUtils';
import { useAdaptive } from '../../utils/useAdaptive';
import DesktopPageHeader from '../../components/desktop/DesktopPageHeader';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

/** Returns current time in IST (UTC+5:30) */
const getISTTime = () => {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istMs = utcMs + 5.5 * 60 * 60 * 1000;
  const ist = new Date(istMs);
  return { hours: ist.getHours(), minutes: ist.getMinutes() };
};

/** Students: gate pass disabled after 15:00 IST */
const isStudentPassDisabled = () => {
  const { hours } = getISTTime();
  return hours >= 15;
};

export default function StudentHome() {
  usePageTitle('Dashboard');
  const { user: rawUser, logout } = useAuth();
  const { isDesktop } = useAdaptive();
  const user = rawUser as Student;
  const { refreshCount } = useRefresh();
  const { success: showSuccess, error: showError } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [qrData, setQrData] = useState<{ code: string; manual: string | undefined; expires: string | undefined } | null>(null);

  useEffect(() => {
    loadData();
  }, [refreshCount]);

  const loadData = async () => {
    if (!user?.regNo) return;
    try {
      const response = await getStudentGatePassRequests(user.regNo);
      if (response.success) {
        // Filter for today's requests for the dashboard
        const filtered = response.requests
          .filter((r: any) => isToday(r.requestDate || r.createdAt))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRequests(filtered);
      }
    } catch (err) {
      console.error('Failed to load student requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING,';
    if (hour < 17) return 'GOOD AFTERNOON,';
    return 'GOOD EVENING,';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED': case 'APPROVED_BY_HOD':
        return { label: 'APPROVED', color: 'bg-emerald-500' };
      case 'REJECTED':
        return { label: 'REJECTED', color: 'bg-rose-500' };
      case 'PENDING_HOD':
        return { label: 'AWAITING HOD', color: 'bg-blue-500' };
      case 'PENDING_STAFF':
        return { label: 'AWAITING STAFF', color: 'bg-amber-500' };
      case 'USED':
        return { label: 'USED', color: 'bg-slate-400' };
      default:
        return { label: status || 'PENDING', color: 'bg-amber-500' };
    }
  };

  const handleViewQR = async (request: any) => {
    if (request.status !== 'APPROVED') {
       showError('Wait for Approval', 'This request is not fully approved yet');
       return;
    }
    setSelectedRequest(request);
    setShowQRModal(true);
    try {
      const res = await getGatePassQRCode(request.id, user?.regNo || '');
      if (res.success) {
        setQrData({
          code: res.qrCode || '',
          manual: res.manualCode,
          expires: res.qrExpiresAt
        });
      } else {
        showError('QR Error', res.message || 'Could not fetch QR code');
        setShowQRModal(false);
      }
    } catch {
      showError('Error', 'Network error while fetching QR');
      setShowQRModal(false);
    }
  };

  const filteredRequests = requests;

  const gatePassDisabled = isStudentPassDisabled();
  const displayName = `${user?.firstName || 'Student'} ${user?.lastName || ''}`.trim();
  const pendingCount = filteredRequests.filter((request) => {
    const status = request.status || '';
    return status.includes('PENDING') || status.startsWith('APPROVED_BY');
  }).length;
  const approvedCount = filteredRequests.filter((request) => request.status === 'APPROVED').length;
  const latestRequest = filteredRequests[0];
  const campusStatus = user?.currentStatus || 'INSIDE';

  const renderModals = () => (
    selectedRequest ? (
      <>
        <GatePassQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          qrCodeData={qrData?.code || ''}
          personName={displayName}
          personId={user?.regNo || ''}
          manualCode={qrData?.manual}
          validUntil={qrData?.expires}
        />
        <RequestDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          request={selectedRequest}
          student={user}
        />
      </>
    ) : null
  );

  if (isDesktop) {
    const statusCards = [
      {
        label: 'Today Requests',
        value: filteredRequests.length,
        hint: filteredRequests.length === 1 ? 'Request created today' : 'Requests created today',
        icon: ClipboardList,
        accent: 'text-blue-700 bg-blue-50 border-blue-100 dark:text-blue-300 dark:bg-blue-950/35 dark:border-blue-900/50',
      },
      {
        label: 'Approved',
        value: approvedCount,
        hint: 'Ready for QR access',
        icon: CheckCircle2,
        accent: 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-900/50',
      },
      {
        label: 'Pending',
        value: pendingCount,
        hint: 'Awaiting approval',
        icon: Clock,
        accent: 'text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-300 dark:bg-amber-950/30 dark:border-amber-900/50',
      },
      {
        label: 'Campus Status',
        value: campusStatus,
        hint: user?.department || 'Student profile',
        icon: UserCheck,
        accent: 'text-cyan-700 bg-cyan-50 border-cyan-100 dark:text-cyan-300 dark:bg-cyan-950/30 dark:border-cyan-900/50',
      },
    ];

    return (
      <div className="student-desktop-dashboard">
        <DesktopPageHeader
          eyebrow={getGreeting().replace(',', '')}
          title={displayName}
          subtitle="Request, track, and access your gate pass approvals from one clean workspace."
          action={
            <Button
              size="md"
              disabled={gatePassDisabled}
              onClick={() => !gatePassDisabled && (window.location.href = '/new-request')}
              icon={gatePassDisabled ? <Ban className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              {gatePassDisabled ? 'Window Closed' : 'New Request'}
            </Button>
          }
        />

        <TopRefreshControl refreshing={refreshing} onRefresh={handleRefresh}>
          <div className="space-y-5">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <motion.button
                type="button"
                whileHover={{ y: gatePassDisabled ? 0 : -2 }}
                whileTap={{ scale: gatePassDisabled ? 1 : 0.99 }}
                onClick={() => !gatePassDisabled && (window.location.href = '/new-request')}
                className={cn(
                  'desktop-card group overflow-hidden text-left transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30',
                  gatePassDisabled ? 'cursor-default' : 'hover:border-blue-300/80 hover:shadow-[0_18px_45px_-26px_rgba(37,99,235,0.55)]',
                )}
              >
                <div className="flex min-h-[178px] flex-col justify-between gap-6 p-6 xl:flex-row xl:items-center xl:p-7">
                  <div className="flex min-w-0 items-start gap-5">
                    <div className={cn(
                      'flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border',
                      gatePassDisabled
                        ? 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        : 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/35 dark:text-blue-300',
                    )}>
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <div className="min-w-0">
                      <div className={cn(
                        'mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold',
                        gatePassDisabled
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
                      )}>
                        <span className={cn(
                          'h-2 w-2 rounded-full',
                          gatePassDisabled ? 'bg-rose-500' : 'bg-emerald-500',
                        )} />
                        {gatePassDisabled ? 'Request window closed' : 'Request window open'}
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                        Gate Pass Request
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-400">
                        {gatePassDisabled
                          ? 'Student gate pass requests are not available after 3:00 PM IST. You can still review your request history.'
                          : 'Create a new student gate pass request and follow each approval stage without leaving the dashboard.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 xl:inline-flex">
                      Closes at 3:00 PM
                    </span>
                    <span className={cn(
                      'inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-bold',
                      gatePassDisabled
                        ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                        : 'bg-blue-700 text-white shadow-sm shadow-blue-700/20 group-hover:bg-blue-800',
                    )}>
                      {gatePassDisabled ? <Ban className="h-5 w-5" /> : 'Apply Now'}
                    </span>
                  </div>
                </div>
              </motion.button>

              <aside className="desktop-card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      Latest Activity
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                      {latestRequest ? latestRequest.purpose || 'Gate Pass Request' : 'No activity today'}
                    </h3>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Request status</span>
                    <span className="text-right text-sm font-bold text-slate-950 dark:text-white">
                      {latestRequest ? getStatusConfig(latestRequest.status).label : 'Clear'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pass window</span>
                    <span className="text-right text-sm font-bold text-slate-950 dark:text-white">
                      {gatePassDisabled ? 'Closed after 3:00 PM' : 'Open now'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Student ID</span>
                    <span className="text-right text-sm font-bold text-slate-950 dark:text-white">
                      {user?.regNo || 'Not available'}
                    </span>
                  </div>
                </div>
              </aside>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statusCards.map((card) => (
                <div key={card.label} className="desktop-metric-card">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg border', card.accent)}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      {card.label}
                    </p>
                    <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {card.value}
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                      {card.hint}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="desktop-card overflow-hidden">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      Recent Requests
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                      Today&apos;s gate pass activity
                    </h3>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => (window.location.href = '/requests')}>
                    View All
                  </Button>
                </div>

                {loading ? (
                  <div className="p-6">
                    <SkeletonList count={3} />
                  </div>
                ) : filteredRequests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="desktop-table">
                      <thead>
                        <tr>
                          <th>Request</th>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((request) => {
                          const status = getStatusConfig(request.status);
                          return (
                            <tr
                              key={request.id}
                              className="cursor-pointer hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/35"
                              onClick={() => { setSelectedRequest(request); setShowDetailsModal(true); }}
                            >
                              <td>
                                <p className="font-bold text-slate-950 dark:text-white">{request.purpose || 'Gate Pass Request'}</p>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Request #{request.id}</p>
                              </td>
                              <td>{request.passType === 'BULK' ? 'Bulk Pass' : 'Single Pass'}</td>
                              <td>{formatDateTime(request.requestDate || request.createdAt)}</td>
                              <td>
                                <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase text-white', status.color)}>
                                  {status.label}
                                </span>
                              </td>
                              <td className="text-right">
                                {request.status === 'APPROVED' && request.passType !== 'BULK' ? (
                                  <Button size="sm" onClick={(e) => { e.stopPropagation(); handleViewQR(request); }} icon={<QrCode className="w-4 h-4" />}>View QR</Button>
                                ) : (
                                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); setShowDetailsModal(true); }}>View</Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    title="No recent requests"
                    description="Requests created today will appear here with approval status and QR actions."
                    icon={<FileText className="w-7 h-7" />}
                    className="border-0 shadow-none lg:rounded-none lg:py-14"
                    action={
                      <Button
                        size="sm"
                        disabled={gatePassDisabled}
                        onClick={() => !gatePassDisabled && (window.location.href = '/new-request')}
                      >
                        {gatePassDisabled ? 'Request window closed' : 'Create request'}
                      </Button>
                    }
                  />
                )}
              </div>

              <aside className="desktop-card p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  Approval Flow
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                  What happens next
                </h3>
                <div className="mt-6 space-y-5">
                  {['Submit request', 'Staff review', 'HOD approval', 'QR available'].map((step, index) => (
                    <div key={step} className="flex gap-3">
                      <div className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        index === 0 ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-950 dark:text-white">{step}</p>
                        <p className="mt-0.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {index === 0 && 'Create the request before the daily cutoff.'}
                          {index === 1 && 'Your assigned staff member checks the details.'}
                          {index === 2 && 'Department approval unlocks pass readiness.'}
                          {index === 3 && 'Open the approved request to show the QR at the gate.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </section>
          </div>
        </TopRefreshControl>

        {renderModals()}
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen lg:bg-transparent lg:min-h-0">
      <TopMenuBar
        greeting={getGreeting()}
        title={`${user?.firstName} ${user?.lastName || ''}`.toUpperCase()}
      />

      <div className="px-4 pt-4 lg:px-0 lg:pt-0 lg:space-y-5">
      </div>

      <TopRefreshControl refreshing={refreshing} onRefresh={handleRefresh}>
        <div className="px-4 pt-4 pb-28 lg:px-0 lg:pt-6 lg:pb-8">
          {/* Main Action Card */}
          <motion.div 
            whileTap={{ scale: gatePassDisabled ? 1 : 0.98 }}
            onClick={() => !gatePassDisabled && (window.location.href = '/new-request')}
            className="rounded-[24px] overflow-hidden shadow-md shadow-indigo-500/10 border border-slate-100 dark:border-indigo-900/20 lg:desktop-card lg:grid lg:grid-cols-[minmax(260px,420px)_1fr] lg:rounded-[28px]"
          >
            <div className={cn(
              "h-40 flex items-center justify-center relative overflow-hidden lg:h-56",
              gatePassDisabled ? "bg-slate-400" : "bg-[var(--color-primary)]"
            )}>
              <ShieldCheck className="w-24 h-24 text-white/20 absolute" />
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-40 h-40 bg-white/10 rounded-full blur-3xl absolute"
              />
              <ShieldCheck className="w-10 h-10 text-white relative z-10" />
            </div>
            
            <div className="bg-white dark:bg-slate-900 px-5 py-4 flex items-center justify-between lg:p-8">
              <div className="flex-1">
                <h3 className="text-[17px] font-black text-slate-900 dark:text-white leading-tight lg:text-2xl">
                  Request Gate Pass
                </h3>
                {gatePassDisabled && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">
                      Not available after 3:00 PM
                    </span>
                  </div>
                )}
              </div>
              <button 
                disabled={gatePassDisabled}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all lg:h-12 lg:px-7",
                  gatePassDisabled ? "bg-slate-100 text-slate-400" : "bg-[var(--color-primary)] text-white shadow-lg shadow-blue-200 dark:shadow-none active:scale-95"
                )}
              >
                {gatePassDisabled ? <Ban className="w-5 h-5" /> : 'Apply Now'}
              </button>
            </div>
          </motion.div>

          {/* Section Header */}
          <div className="mt-8 mb-3 px-1 lg:mt-0">
            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Recent Requests
            </h4>
          </div>

          {/* Requests List */}
          {loading ? (
            <SkeletonList count={3} />
          ) : isDesktop && filteredRequests.length > 0 ? (
            <section className="desktop-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">Recent Requests</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Today&apos;s gate pass activity</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">{filteredRequests.length} Requests</span>
              </div>
              <div className="overflow-x-auto">
                <table className="desktop-table">
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => {
                      const status = getStatusConfig(request.status);
                      return (
                        <tr key={request.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/35" onClick={() => { setSelectedRequest(request); setShowDetailsModal(true); }}>
                          <td>
                            <p className="font-bold text-slate-950 dark:text-white">{request.purpose || 'Gate Pass Request'}</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Request #{request.id}</p>
                          </td>
                          <td>{request.passType === 'BULK' ? 'Bulk Pass' : 'Single Pass'}</td>
                          <td>{formatDateTime(request.requestDate || request.createdAt)}</td>
                          <td>
                            <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase text-white', status.color)}>
                              {status.label}
                            </span>
                          </td>
                          <td className="text-right">
                            {request.status === 'APPROVED' && request.passType !== 'BULK' ? (
                              <Button size="sm" onClick={(e) => { e.stopPropagation(); handleViewQR(request); }} icon={<QrCode className="w-4 h-4" />}>View QR</Button>
                            ) : (
                              <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); setShowDetailsModal(true); }}>View</Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : filteredRequests.length > 0 ? (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const status = getStatusConfig(request.status);
                return (
                  <motion.div
                    key={request.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailsModal(true);
                    }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm active:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn(
                        "px-2.5 py-1 rounded-md",
                        request.passType === 'BULK'
                          ? "bg-blue-50 dark:bg-indigo-900/20"
                          : "bg-emerald-50 dark:bg-emerald-900/20"
                      )}>
                        <span className={cn(
                          "text-[10px] font-bold",
                          request.passType === 'BULK'
                            ? "text-[var(--color-primary)] dark:text-blue-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {request.passType === 'BULK' ? 'Bulk Pass' : 'Single Pass'}
                        </span>
                      </div>
                      <div className={cn("px-2.5 py-1 rounded-md", status.color)}>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <h5 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1 truncate">
                      {request.purpose || 'Gate Pass Request'}
                    </h5>
                    <p className="text-[12px] text-slate-400 mb-3">
                      {formatDateTime(request.requestDate || request.createdAt)}
                    </p>

                    {request.status === 'APPROVED' && request.passType !== 'BULK' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewQR(request); }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-[var(--color-primary)] rounded-xl text-white active:scale-95 transition-transform"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-bold">View QR Code</span>
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <FileText className="w-8 h-8 text-slate-200 dark:text-slate-700" />
              </div>
              <h5 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">No recent requests</h5>
            </div>
          )}
        </div>
      </TopRefreshControl>

      {renderModals()}
    </div>
  );
}
