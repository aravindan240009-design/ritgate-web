import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Fingerprint, 
  Scan, 
  Zap, 
  QrCode, 
  ChevronRight,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import RITLogo from '../../components/common/RITLogo';
import { detectRole, verifyOTP } from '../../services/api.service';
import { cn } from '../../utils/cn';
import SuccessModal from '../../components/common/SuccessModal';
import ErrorModal from '../../components/common/ErrorModal';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOTPRequest, login } = useAuth();
  const { error: showError } = useToast();

  const [userId, setUserId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Connecting...');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string } | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ── Handle scanned ID from QR scanner ──────────────────────────────────────
  useEffect(() => {
    const scannedId = (location.state as any)?.scannedId;
    if (scannedId) {
      const id = String(scannedId).trim().toUpperCase();
      setUserId(id);
      // Clear state so back-navigation doesn't re-trigger
      window.history.replaceState({}, '');
      // Auto-submit after a short delay so the UI updates first
      setTimeout(() => {
        triggerSendOTP(id);
      }, 300);
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Extracted so it can be called with a specific id (e.g. from scan)
  const triggerSendOTP = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setLoadingMessage('Detecting role...');
    try {
      const role = await detectRole(id.trim());
      setLoadingMessage('Sending OTP...');
      const res = await sendOTPRequest(id.trim(), role);
      if (res.success) {
        setMaskedEmail(res.email || (res as any).maskedEmail || 'm***@institution.edu');
        setOtpTimer(120);
        setShowSuccess(true);
      } else {
        setErrorInfo({ title: 'OTP Send Failed', message: res.message || 'Failed to send OTP. Please check your ID and try again.' });
      }
    } catch (err: any) {
      setErrorInfo({ title: 'Network Error', message: 'Could not connect to the server. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = () => triggerSendOTP(userId);

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otpDigits.join('');
    if (otpString.length !== 6) return;

    setLoading(true);
    try {
      const role = await detectRole(userId.trim());
      const response = await verifyOTP(userId.trim(), otpString, role);
      if (response.success && response.user) {
        login(response.user, role, response.token || '');
        // Navigation handled by auth provider/guard
      } else {
        setErrorInfo({ title: 'Verification Failed', message: response.message || 'Invalid OTP code. Please try again.' });
      }
    } catch (err: any) {
      setErrorInfo({ title: 'Error', message: 'Verification failed due to a network error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (otpTimer > 0) return;
    setOtpDigits(['', '', '', '', '', '']);
    handleSendOTP();
  };

  return (
    <div
      className="min-h-screen w-screen bg-white dark:bg-slate-950 flex flex-col overflow-x-hidden px-5"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center pt-8 w-full max-w-md mx-auto"
      >
        {/* Back Button (Only in OTP mode) */}
        <AnimatePresence>
          {otpSent && (
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => setOtpSent(false)}
              className="absolute top-4 left-4 w-11 h-11 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full text-slate-800 dark:text-white z-20 active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <div className="w-full flex flex-col items-center mb-10">
          <div className="mb-4">
             <RITLogo size={120} className="shadow-2xl" glow />
          </div>
          <h1 className="text-[36px] font-black text-slate-950 dark:text-white tracking-[0.05em] leading-none mb-2">
            RIT GATE
          </h1>
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Secure Access Control System
          </p>

          <div className="flex gap-2.5 mt-5">
            {[
              { icon: Fingerprint, label: 'Biometric' },
              { icon: Scan, label: 'Badge Scan' },
              { icon: Zap, label: 'Instant' },
            ].map((item, i) => (
              <div 
                key={i}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full shadow-sm"
              >
                <item.icon className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
                <span className="text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login/OTP Card */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mb-1.5">
            {otpSent ? 'Verify Identity' : 'Welcome Back'}
          </h2>
          <p className="text-[13px] font-medium text-slate-500 mb-6 leading-snug">
            {otpSent ? 'Enter the 6-digit code sent to your registered email.' : 'Sign in with your institute credential across all roles.'}
          </p>

          {!otpSent ? (
            <div className="space-y-6">
              <div className="space-y-2.5">
                <label className="block text-[11px] font-black text-slate-950 dark:text-slate-400 uppercase tracking-[0.1em] px-1">
                  IDENTIFICATION
                </label>
                <div className="relative">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                      <ShieldCheck className="w-5 h-5" />
                   </div>
                   <input 
                    type="text" 
                    placeholder="Staff ID / Student Roll No"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value.toUpperCase())}
                    className="w-full h-14 pl-12 pr-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-[15px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleSendOTP}
                disabled={loading || !userId.trim()}
                className={cn(
                  "w-full h-15 bg-slate-950 dark:bg-indigo-600 rounded-2xl flex items-center justify-center gap-3 text-white active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none",
                  (loading || !userId.trim()) && "opacity-70 saturate-50"
                )}
              >
                {loading ? (
                  <div className="flex items-center gap-2.5">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-[15px] font-black uppercase tracking-widest">{loadingMessage}</span>
                  </div>
                ) : (
                  <span className="text-[16px] font-black uppercase tracking-widest">Continue</span>
                )}
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">OR</span>
                <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
              </div>

              <button 
                onClick={() => navigate('/login-scan')}
                className="w-full flex items-center gap-4 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform group"
              >
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  <QrCode className="w-5 h-5 text-slate-900 dark:text-white" />
                </div>
                <span className="flex-1 text-left text-[15px] font-bold text-slate-900 dark:text-white">Scan QR / Barcode</span>
                <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2.5 text-center">
                <label className="block text-[11px] font-black text-slate-950 dark:text-slate-400 uppercase tracking-[0.1em] mb-4">
                  VERIFICATION CODE
                </label>
                <div className="flex justify-between gap-2.5">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={ref => { otpRefs.current[i] = ref; }}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      maxLength={1}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      className={cn(
                        "w-12 h-16 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl text-[24px] font-black text-center text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all",
                        digit ? "border-indigo-600 bg-indigo-50/10" : "border-slate-100 dark:border-slate-800"
                      )}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                <p className="text-[12px] font-medium text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Sent to <span className="font-black text-slate-900 dark:text-white">{maskedEmail}</span>
                </p>
              </div>

              <div className="flex items-center justify-between px-1">
                {otpTimer > 0 ? (
                  <span className="text-[13px] font-bold text-slate-900 dark:text-slate-300">
                    Resend in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                  </span>
                ) : (
                  <button onClick={handleResendOTP} className="text-[13px] font-black text-indigo-600 underline underline-offset-4">
                    Resend OTP
                  </button>
                )}
                <button onClick={() => setOtpSent(false)} className="text-[13px] font-bold text-slate-500">
                  Change ID
                </button>
              </div>

              <button 
                onClick={handleVerifyOTP}
                disabled={loading || otpDigits.join('').length !== 6}
                className={cn(
                  "w-full h-15 bg-slate-900 dark:bg-emerald-600 rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none",
                  (loading || otpDigits.join('').length !== 6) && "opacity-70 saturate-50"
                )}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="text-[16px] font-black uppercase tracking-widest">Verify & Login</span>}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pb-8">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Access Verification System</p>
        </div>
      </motion.div>

      {/* Success Modal Container */}
      <SuccessModal 
        visible={showSuccess}
        onClose={() => { setShowSuccess(false); setOtpSent(true); }}
        title="OTP Sent"
        message={`A 6-digit verification code has been sent to your email:\n${maskedEmail}`}
      />

      {/* Error Modal Container */}
      <ErrorModal 
        visible={!!errorInfo}
        onClose={() => setErrorInfo(null)}
        title={errorInfo?.title || ''}
        message={errorInfo?.message || ''}
        type="auth"
      />
    </div>
  );
}
