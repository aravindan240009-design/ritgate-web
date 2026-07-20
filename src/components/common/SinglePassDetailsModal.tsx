import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Maximize2,
  FileIcon,
  Loader2,
  ChevronRight,
  Check,
  X,
  Clock,
  QrCode,
  Target,
  CalendarDays,
  StickyNote,
  Paperclip,
  MessageSquare,
  ListChecks
} from 'lucide-react';
import SectionLabel from './SectionLabel';
import { cn } from '../../utils/cn';
import { isPdfAttachment } from '../../utils/attachmentUtils';
import { formatDate } from '../../utils/date';
import { getStatusMeta, normalizeRequestStatus } from '../../utils/statusUtils';
import Button from '../ui/Button';
import ConfirmationModal from './ConfirmationModal';
import GatePassQRModal from './GatePassQRModal';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { getGatePassQRCode } from '../../services/api.service';

interface TimelineStep {
  label: string;
  status: 'done' | 'rejected' | 'pending';
  remark?: string;
}

interface SinglePassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onApprove?: (id: number, remark: string) => void;
  onReject?: (id: number, remark: string) => void;
  showActions?: boolean;
  onViewQR?: (request: any) => void;
  timelineSteps?: TimelineStep[];
  viewerRole?: string;
  processing?: boolean;
}

export default function SinglePassDetailsModal({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  showActions = false,
  onViewQR,
  timelineSteps,
  viewerRole,
  processing: externalProcessing,
}: SinglePassDetailsModalProps) {
  const { getUserId } = useAuth();
  const [remark, setRemark] = useState('');
  const [processing, setProcessing] = useState(false);
  const isProcessing = externalProcessing ?? processing;
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showRemarkError, setShowRemarkError] = useState(false);

  // Internal QR state
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState<{ code: string; manual: string | undefined; expires: string | undefined } | null>(null);
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    if (isOpen && request?.id) {
      setRemark('');
      setQrData(null);
      setQrError('');
    }
  }, [isOpen, request?.id]);

  const handleViewQR = async () => {
    if (onViewQR) { onClose(); onViewQR(request); return; }
    setQrLoading(true);
    setQrError('');
    try {
      // Use the requester's own ID — the API only authorises the pass owner
      const requesterId =
        request.regNo ||
        request.staffCode ||
        request.hodCode ||
        request.hrCode ||
        request.requestedByStaffCode ||
        getUserId();
      const res = await getGatePassQRCode(request.id, requesterId);
      if (res.success && res.qrCode) {
        setQrData({ code: res.qrCode, manual: res.manualCode, expires: res.qrExpiresAt });
        setShowQRModal(true);
      } else {
        setQrError(res.message || 'QR not available yet.');
      }
    } catch {
      setQrError('Network error. Please try again.');
    } finally {
      setQrLoading(false);
    }
  };

  if (!request || !isOpen) return null;

  const status = normalizeRequestStatus(request);
  const statusMeta = getStatusMeta(request);
  const isApproved = status === 'APPROVED';
  const attachmentUri = request.attachmentUri || request.fileUrl;
  const isPdf = isPdfAttachment(attachmentUri);

  const getInitials = (name: string) =>
    (name || 'ST').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const getComputedTimeline = (): TimelineStep[] => {
    if (timelineSteps && timelineSteps.length > 0) return timelineSteps;

    const rawStatus = (request?.status || request?.approvalStatus || '').toUpperCase();

    const isStaffDone =
      rawStatus === 'APPROVED' ||
      rawStatus === 'PENDING_HOD' ||
      rawStatus === 'APPROVED_BY_HOD' ||
      rawStatus === 'USED' ||
      request?.staffStatus === 'APPROVED';

    const isStaffRejected =
      rawStatus === 'REJECTED_BY_STAFF' ||
      (rawStatus === 'REJECTED' && !request?.staffStatus && !request?.hodStatus);

    const isHodDone =
      rawStatus === 'APPROVED' ||
      rawStatus === 'USED' ||
      request?.hodStatus === 'APPROVED';

    const isHodRejected =
      rawStatus === 'REJECTED_BY_HOD' ||
      (rawStatus === 'REJECTED' && isStaffDone);

    const isGateUsed = rawStatus === 'USED' || request?.isUsed;

    return [
      {
        label: 'Staff Authorization',
        status: isStaffDone ? 'done' : isStaffRejected ? 'rejected' : 'pending',
        remark: request?.staffRemark,
      },
      {
        label: 'HOD Authorization',
        status: isHodDone ? 'done' : isHodRejected ? 'rejected' : 'pending',
        remark: request?.hodRemark,
      },
      {
        label: 'Campus Gate Access',
        status: isGateUsed ? 'done' : isHodDone ? 'pending' : 'pending',
        remark: isGateUsed ? 'Gate Pass Verified at Campus Gate' : isHodDone ? 'QR Code ready for gate scanning' : 'Awaiting authorizations',
      },
    ];
  };

  const activeTimeline = getComputedTimeline();

  return createPortal(
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[130] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-0 lg:p-6 overflow-y-auto pt-safe">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="w-full h-full lg:h-auto lg:max-h-[88vh] lg:max-w-2xl bg-[#F8FAFC] dark:bg-slate-950 lg:bg-white lg:dark:bg-slate-900 lg:rounded-[28px] lg:border lg:border-slate-200/80 lg:dark:border-slate-800 lg:shadow-2xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 h-16 flex items-center gap-3 z-20 shrink-0">
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {!showActions ? 'Request Details' : 'Pass Verification'}
            </h1>
            <Badge 
              status={status}
              className="uppercase tracking-widest text-[10px] py-1 px-3.5 font-bold"
            />
            <button
              onClick={onClose}
              className="hidden lg:flex w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors ml-1"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-4">
              {/* Profile Row */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md shrink-0",
                  statusMeta.dotClass
                )}>
                  {getInitials(request.studentName || request.staffName || request.regNo || 'ST')}
                </div>
                <div className="flex-1 min-w-0">
                  {request.requestType === 'VISITOR' && (
                    <div className="bg-[var(--color-primary)] inline-block px-2.5 py-0.5 rounded-md mb-1">
                      <span className="text-[9px] font-black text-white uppercase tracking-wider">
                        {(request.role || 'VISITOR')}
                      </span>
                    </div>
                  )}
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                    {request.studentName || request.staffName || request.regNo}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold truncate uppercase tracking-tight">
                    {request.regNo || request.staffCode} • {request.department || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 shadow-sm">
                <div className="p-5 sm:border-r border-b sm:border-b-0 border-slate-100 dark:border-slate-800">
                  <SectionLabel icon={Target} className="mb-2">
                    {request.requestType === 'VISITOR' ? 'PURPOSE OF VISIT' : 'PURPOSE'}
                  </SectionLabel>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {request.purpose || 'General'}
                  </p>
                </div>
                <div className="p-5">
                  <SectionLabel icon={CalendarDays} className="mb-2">
                    {request.requestType === 'VISITOR' ? 'ENTRY DATE' : 'DATE'}
                  </SectionLabel>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {formatDate(request.visitDate || request.exitDateTime || request.requestDate)}
                  </p>
                </div>
              </div>

              {/* Reason */}
              {request.requestType !== 'VISITOR' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <SectionLabel icon={StickyNote} className="mb-2.5">REASON</SectionLabel>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {request.reason || 'No reason provided.'}
                  </p>
                </div>
              )}

              {/* Attachment Preview */}
              {attachmentUri && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <SectionLabel icon={Paperclip} className="mb-3">PREVIEW</SectionLabel>
                  <div 
                    className="relative w-48 h-28 bg-slate-900 rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                    onClick={() => isPdf ? window.open(attachmentUri, '_blank') : setIsFullScreen(true)}
                  >
                    {isPdf ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-800">
                        <FileIcon className="w-8 h-8 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Open PDF</span>
                      </div>
                    ) : (
                      <>
                        <img src={attachmentUri} alt="Pass Attachment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {(request.staffRemark || request.hodRemark || request.hrRemark) && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                  <SectionLabel icon={MessageSquare} className="mb-1.5">REMARKS</SectionLabel>
                  {request.staffRemark && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-3.5 rounded-r-xl">
                      <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Staff</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">"{request.staffRemark}"</p>
                    </div>
                  )}
                  {request.hodRemark && (
                    <div className="bg-blue-50 dark:bg-indigo-900/10 border-l-4 border-blue-700 p-3.5 rounded-r-xl">
                      <p className="text-[10px] font-black text-[var(--color-primary)] uppercase mb-1">HOD</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">"{request.hodRemark}"</p>
                    </div>
                  )}
                  {request.hrRemark && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 p-3.5 rounded-r-xl">
                      <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">HR</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">"{request.hrRemark}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Approval & Tracking Status Timeline */}
              {!showActions && activeTimeline && activeTimeline.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                  <SectionLabel icon={ListChecks} className="mb-1">APPROVAL & TRACKING STATUS</SectionLabel>
                  <div className="space-y-0 pt-2">
                    {activeTimeline.map((step, idx) => {
                      const isDone = step.status === 'done';
                      const isRejected = step.status === 'rejected';
                      const isLast = idx === activeTimeline.length - 1;

                      return (
                        <div key={idx} className="relative">
                          {!isLast && (
                            <div className={cn(
                              "absolute left-[17px] top-8 w-[2px] h-full transition-colors",
                              isDone ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                            )} />
                          )}
                          <div className="flex gap-4 items-start pb-7 last:pb-0">
                            <div className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-bold transition-all shadow-sm",
                              isDone ? "bg-emerald-500 text-white shadow-emerald-500/20" : 
                              isRejected ? "bg-rose-500 text-white shadow-rose-500/20" : 
                              "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                            )}>
                              {isDone ? <Check className="w-5 h-5 stroke-[2.5]" /> : 
                               isRejected ? <X className="w-5 h-5 stroke-[2.5]" /> : 
                               <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
                                  {step.label}
                                </h4>
                                <span className={cn(
                                  "text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide",
                                  isDone ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : 
                                  isRejected ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" : 
                                  "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                                )}>
                                  {isDone ? '✓ Approved' : isRejected ? '✗ Rejected' : '● Pending'}
                                </span>
                              </div>
                              {step.remark && (
                                <div className="mt-2 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border-l-3 border-amber-500">
                                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-0.5">Note:</p>
                                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 italic">"{step.remark}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 lg:px-6 lg:py-4 pb-safe z-30 shrink-0">
            {showActions ? (
              <div className="space-y-3">
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Add review notes (required for rejection)..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                  rows={2}
                  disabled={processing}
                />
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="danger"
                    size="xl"
                    className="lg:w-36"
                    icon={<XCircle className="w-5 h-5" />}
                    onClick={() => {
                      if (!remark.trim()) setShowRemarkError(true);
                      else setShowRejectConfirm(true);
                    }}
                    disabled={processing}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    size="xl"
                    className="lg:w-36"
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    onClick={() => setShowApproveConfirm(true)}
                    isLoading={processing}
                    disabled={processing}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {qrError && (
                  <p className="text-xs font-bold text-rose-500 text-center mb-1">{qrError}</p>
                )}
                <div className="flex gap-3 justify-end">
                  {isApproved ? (
                    <>
                      <Button
                        variant="primary"
                        size="xl"
                        className="w-full lg:w-36"
                        onClick={onClose}
                      >
                        Close
                      </Button>
                      <Button
                        variant="success"
                        size="xl"
                        className="w-full lg:w-44"
                        icon={qrLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                        onClick={handleViewQR}
                        disabled={qrLoading}
                      >
                        {qrLoading ? 'Loading...' : 'View QR'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="xl"
                      className="w-full lg:w-36"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            )}
          </footer>

          {/* Confirmations */}
          <ConfirmationModal
            visible={showRemarkError}
            title="Remark Required"
            message="Please add a reason for rejection in the review notes before rejecting."
            confirmText="OK"
            cancelText=""
            onConfirm={() => setShowRemarkError(false)}
            onCancel={() => setShowRemarkError(false)}
          />

          <ConfirmationModal
            visible={showApproveConfirm}
            title="Approve Request"
            message="Are you sure you want to approve this gate pass request?"
            confirmText="Approve"
            onConfirm={async () => {
              setShowApproveConfirm(false);
              setProcessing(true);
              if (onApprove) await onApprove(request.id, remark);
              setProcessing(false);
              onClose();
            }}
            onCancel={() => setShowApproveConfirm(false)}
          />

          <ConfirmationModal
            visible={showRejectConfirm}
            title="Reject Request"
            message="Are you sure you want to reject this request?"
            confirmText="Reject"
            confirmColor="bg-rose-500 hover:bg-rose-600"
            onConfirm={async () => {
              setShowRejectConfirm(false);
              setProcessing(true);
              if (onReject) await onReject(request.id, remark);
              setProcessing(false);
              onClose();
            }}
            onCancel={() => setShowRejectConfirm(false)}
          />

          {/* Fullscreen Preview */}
          <AnimatePresence>
            {isFullScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 pt-safe"
                onClick={() => setIsFullScreen(false)}
              >
                <button 
                  className="absolute top-10 right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-6 h-6" />
                </button>
                <img 
                  src={attachmentUri} 
                  alt="Fullscreen Attachment" 
                  className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Internal QR Modal */}
          {qrData && (
            <GatePassQRModal
              isOpen={showQRModal}
              onClose={() => setShowQRModal(false)}
              qrCodeData={qrData.code}
              personName={request.studentName || request.staffName || request.regNo || ''}
              personId={request.regNo || request.staffCode || ''}
              manualCode={qrData.manual}
              validUntil={qrData.expires}
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
