import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, QrCode, FileText, Clock, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { SkeletonList, Skeleton } from '../../components/ui/Skeleton';
import QRCodeModal from '../../components/common/QRCodeModal';
import Modal from '../../components/ui/Modal';
import RequestTimeline from '../../components/common/RequestTimeline';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getNTFOwnRequests, getGatePassQRCode } from '../../services/api.service';
import { cn } from '../../utils/cn';
import { transitions } from '../../design-system/animations';
import type { GatePassRequest } from '../../types';

const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } };
const relTime = (d: string) => { try { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000); if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s/60)}m ago`; if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; } catch { return ''; } };

interface AdminMyRequestsProps {
  onBack?: () => void;
}

export default function AdminMyRequests({ onBack }: AdminMyRequestsProps = {}) {
  const { getUserId, user } = useAuth();
  const { error: showError } = useToast();
  const adminCode = getUserId();
  const adminName = (user as any)?.staffName || (user as any)?.name || 'Admin';
  const initials = adminName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const [requests, setRequests] = useState<GatePassRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState({ qrCode: '', manualCode: '' });
  const [selectedRequest, setSelectedRequest] = useState<GatePassRequest | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await getNTFOwnRequests(adminCode);
      if (res.success) setRequests(res.requests || []);
      else setHasError(true);
    } catch { setHasError(true); }
    finally { setIsLoading(false); }
  }, [adminCode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = requests.filter(r =>
    searchQuery === '' ||
    (r.purpose || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(r.id || '').includes(searchQuery)
  ).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const handleViewQR = async (req: GatePassRequest) => {
    if (req.status !== 'APPROVED') return;
    setQrData({ qrCode: '', manualCode: '' });
    setShowQR(true);
    const res = await getGatePassQRCode(req.id!, adminCode);
    if (res.success && res.qrCode) {
      setQrData({ qrCode: res.qrCode, manualCode: res.manualCode || '' });
    } else {
      setShowQR(false);
      showError('Access Blocked', res.message || 'QR not ready.');
    }
  };

  if (isLoading && requests.length === 0) {
    return (
      <div className="space-y-4 animate-pulse text-left">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-40" /></div>
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <SkeletonList count={4} />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-left">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 uppercase">Sync Failed</h3>
        <Button onClick={fetchData} variant="secondary" size="sm" className="rounded-xl px-6">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-base shrink-0 border border-indigo-200 dark:border-indigo-800">{initials}</div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Personal Requests</p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight uppercase mt-1">{adminName}</h2>
          </div>
        </div>
        <button onClick={fetchData} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <RefreshCw className={cn('w-4 h-4 text-slate-500', isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="SEARCH YOUR REQUESTS..." value={searchQuery} onChange={e => setSearchQuery(e.target.value.toUpperCase())}
          className="w-full pl-11 pr-4 h-11 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-300 outline-none uppercase tracking-widest" />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <FileText className="w-12 h-12 text-slate-200" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No personal requests found</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((req, i) => {
              const dateStr = req.createdAt || req.requestDate || '';
              return (
                <motion.div key={req.id || i} layout initial={transitions.page.initial} animate={transitions.page.animate}>
                  <Card hover onClick={() => { setSelectedRequest(req); setShowDetail(true); }} className="border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-100 dark:border-slate-800 shrink-0 uppercase">{initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white uppercase truncate">{req.purpose || 'Gate Pass'}</p>
                          <Badge status={req.status} size="sm" />
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest tabular-nums">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(dateStr)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {relTime(dateStr)}</span>
                        </div>
                        {req.status === 'APPROVED' && (
                          <button onClick={e => { e.stopPropagation(); handleViewQR(req); }}
                            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-indigo-600 rounded-lg text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                            <QrCode className="w-3.5 h-3.5" /> SHOW QR CODE
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="REQUEST DETAILS" size="lg">
        {selectedRequest && (
          <div className="space-y-6 pt-2 text-left">
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 space-y-4 border border-slate-100 dark:border-slate-900">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">PURPOSE</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedRequest.purpose}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">REASON</span>
                <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"{selectedRequest.reason}"</span>
              </div>
            </div>
            <RequestTimeline request={selectedRequest} />
            {selectedRequest.status === 'APPROVED' && (
              <Button fullWidth onClick={() => { setShowDetail(false); handleViewQR(selectedRequest); }}
                className="py-4 bg-indigo-600 rounded-2xl text-white font-black text-xs uppercase tracking-widest gap-2">
                <QrCode className="w-5 h-5" /> GENERATE QR CODE
              </Button>
            )}
          </div>
        )}
      </Modal>

      <QRCodeModal isOpen={showQR} onClose={() => setShowQR(false)} qrCode={qrData.qrCode} manualCode={qrData.manualCode}
        userName={adminName} idNumber={adminCode} title="ADMIN PASS" />
    </div>
  );
}
