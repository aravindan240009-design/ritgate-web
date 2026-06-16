import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  QrCode, 
  CheckCircle, 
  Info, 
  Loader2, 
  Copy, 
  Check, 
  ArrowLeft,
  Smartphone,
  Users,
  ShieldCheck,
  Calendar,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useActionLock } from '../../context/ActionLockContext';
import { createInstantGuestPass, getStaffDirectory } from '../../services/api.service';
import GatePassQRModal from '../../components/common/GatePassQRModal';
import { cn } from '../../utils/cn';

interface GuestPreRequestProps {
  onBack?: () => void;
  embedded?: boolean;
}

export default function GuestPreRequest({ onBack, embedded = false }: GuestPreRequestProps = {}) {
  const navigate = useNavigate();
  const { getUserId, user, role } = useAuth();
  const { success: showToastSuccess, error: showToastError } = useToast();
  const { withLock } = useActionLock();
  const staffCode = getUserId();

  const creatorName = (() => {
    const u = user as any;
    return u?.staffName || u?.hodName || u?.hrName || u?.name || 'Staff Member';
  })();
  const creatorDeptProp = (user as any)?.department || (user as any)?.branch || '';

  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('1');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creatorDepartment, setCreatorDepartment] = useState(creatorDeptProp);
  const [loadingCreator, setLoadingCreator] = useState(!creatorDeptProp);

  // QR result state
  const [qrData, setQrData] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);

  // Load department if not provided
  useEffect(() => {
    if (creatorDeptProp) { setCreatorDepartment(creatorDeptProp); setLoadingCreator(false); return; }
    (async () => {
      setLoadingCreator(true);
      try {
        const dir = await getStaffDirectory();
        const list = Array.isArray(dir) ? dir : [];
        const creator = list.find((s: any) => {
          const id = s.staffId ?? s.staffCode ?? s.staff_id ?? s.id ?? '';
          return String(id) === String(staffCode);
        });
        if (creator?.department) {
          setCreatorDepartment(creator.department);
        }
      } catch {
        showToastError('System Error', 'Could not load staff directory');
      } finally {
        setLoadingCreator(false);
      }
    })();
  }, [staffCode, creatorDeptProp]);

  const handleSubmit = async () => {
    if (!visitorName.trim() || !phone.trim() || phone.replace(/\D/g, '').length < 10 || !purpose.trim()) {
      showToastError('Missing Fields', 'Please enter valid guest details and purpose');
      return;
    }

    await withLock(async () => {
      setIsSubmitting(true);
      try {
        const res = await createInstantGuestPass({
          name: visitorName.trim(),
          email: `${phone.replace(/\D/g, '')}@rit.guest`,
          phone: phone.trim(),
          department: creatorDepartment || 'GENERAL',
          staffCode,
          purpose: purpose.trim(),
          creatorStaffCode: staffCode,
          creatorRole: role || 'STAFF'
        });
        if (res.success) {
          showToastSuccess('Pass Generated', 'Visitor pass has been provisioned successfully');
          setQrData({
            qrCode: res.qrCode,
            manualCode: res.manualCode,
            name: visitorName,
            id: res.id
          });
          setShowQR(true);
          resetForm();
        } else showToastError('Failed', res.message);
      } catch { showToastError('Error', 'Network propagation failed'); }
      finally { setIsSubmitting(false); }
    }, 'Provisioning Credentials...');
  };

  const resetForm = () => {
    setVisitorName(''); setPhone(''); setNumberOfPeople('1'); setPurpose('');
  };

  return (
    <div className={embedded ? "contents" : "flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950"}>
      {/* Header — mobile only (dashboard uses the AppLayout header) */}
      {!embedded && (
        <header
          className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0 lg:hidden"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="px-4 h-[72px] flex items-center justify-between">
            <button
              onClick={onBack ?? (() => navigate(-1))}
              className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[16px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Guest Registration</h1>
            <div className="w-10 h-10" />
          </div>
        </header>
      )}

      <main className={embedded ? "w-full" : "flex-1 overflow-y-auto px-5 py-6"}>
        <div className={cn("space-y-6 pb-32 lg:pb-12", embedded ? "w-full lg:max-w-5xl lg:mx-auto" : "max-w-lg mx-auto lg:max-w-5xl")}>
           {/* Banner */}
           <div className="bg-emerald-600 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-100 dark:shadow-none lg:p-8">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <UserPlus className="w-7 h-7 text-white" />
                 </div>
                 <div>
                    <h3 className="text-[18px] font-black leading-none mb-1">Instant Clearance</h3>
                    <p className="text-[13px] font-bold text-emerald-100 opacity-90 uppercase tracking-widest leading-none">Security Perimeter</p>
                 </div>
              </div>
              <p className="text-[12px] font-medium leading-relaxed opacity-80 italic">
                Authorized visitors will receive immediate digital clearance for campus entry on your behalf.
              </p>
           </div>

           {/* Creator Info Card */}
           <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 lg:desktop-card">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 font-black text-[20px]">
                 {creatorName.charAt(0)}
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registering on behalf of</p>
                 <h4 className="text-[16px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight leading-none mt-1">{creatorName}</h4>
                 <p className="text-[11px] font-bold text-slate-400 uppercase mt-1 opacity-80">{creatorDepartment || 'General Unit'}</p>
              </div>
           </div>

           {/* Form Section */}
           <div className="space-y-5 lg:desktop-card lg:p-6">
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Guest Full Name</label>
                 <input 
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value.toUpperCase())}
                    placeholder="FULL NAME"
                    className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-[15px] font-bold outline-none uppercase shadow-sm"
                 />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                       <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                       <input 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 text-[15px] font-bold outline-none shadow-sm"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Guests</label>
                    <div className="relative">
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                       <input 
                          type="number"
                          value={numberOfPeople}
                          onChange={(e) => setNumberOfPeople(e.target.value)}
                          placeholder="1"
                          className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 text-[15px] font-bold outline-none shadow-sm"
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Objective Detail</label>
                 <div className="relative">
                    <LayoutGrid className="absolute left-4 top-4 w-4.5 h-4.5 text-slate-300" />
                    <textarea 
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value.toUpperCase())}
                        placeholder="PURPOSE OF VISIT..."
                        className="w-full h-28 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-[14px] font-bold outline-none shadow-sm resize-none uppercase"
                    />
                 </div>
              </div>

              <div className="pt-4">
                 <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || loadingCreator}
                    className="w-full h-15 bg-emerald-600 rounded-2xl text-white font-black text-[15px] uppercase tracking-widest shadow-xl shadow-emerald-100 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : (
                       <>
                          <ShieldCheck className="w-6 h-6" />
                          Authorise Clearance
                       </>
                    )}
                 </button>
              </div>
           </div>
        </div>
      </main>

      {/* QR Modal */}
      <AnimatePresence>
         {showQR && qrData && (
            <GatePassQRModal 
              isOpen={showQR}
              onClose={() => setShowQR(false)}
              qrCodeData={qrData.qrCode}
              manualCode={qrData.manualCode}
              personName={qrData.name}
              personId={`ID: ${qrData.id}`}
            />
         )}
      </AnimatePresence>
    </div>
  );
}
