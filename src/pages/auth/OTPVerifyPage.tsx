import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Fingerprint, 
  Scan, 
  Zap, 
  Mail, 
  RefreshCw 
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { OTP_CONFIG } from '../../config/api.config';
import RITLogo from '../../components/common/RITLogo';
import { cn } from '../../utils/cn';
import type { UserRole } from '../../types';
import { transitions } from '../../design-system/animations';

export default function OTPVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, role, maskedEmail } = (location.state as { userId: string; role: UserRole; maskedEmail?: string }) || {};
  const { verifyOTPRequest, sendOTPRequest } = useAuth();
  const { success: showSuccess, error: showError, info } = useToast();

  const [otp, setOtp] = useState<string[]>(Array(OTP_CONFIG.LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(OTP_CONFIG.RESEND_DELAY_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!userId || !role) navigate('/login', { replace: true });
  }, [userId, role, navigate]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_CONFIG.LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d) && newOtp.join('').length === OTP_CONFIG.LENGTH) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== OTP_CONFIG.LENGTH) return;

    setIsLoading(true);
    try {
      const res = await verifyOTPRequest(userId, code, role);
      if (res.success) {
        showSuccess('Verified', 'Identity confirmed successfully');
        navigate('/dashboard', { replace: true });
      } else {
        showError('Verification Failed', res.message || 'Invalid code');
        setOtp(Array(OTP_CONFIG.LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      showError('Error', 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await sendOTPRequest(userId, role);
      if (res.success) {
        info('New Code Sent', 'Check your email');
        setResendTimer(OTP_CONFIG.RESEND_DELAY_SECONDS);
      } else {
        showError('Request Failed', res.message);
      }
    } catch {
      showError('Error', 'Could not resend code');
    } finally {
      setIsResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center bg-[#F8FAFF] overflow-hidden px-6 pt-6 pb-6">
      {/* 1. Top Header Bar */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* 2. Top Branding Section */}
      <motion.div
        initial={transitions.page.initial}
        animate={transitions.page.animate}
        className="w-full max-w-sm flex flex-col items-center mb-6"
      >
        <RITLogo size={72} className="mb-3 shadow-xl" />
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">
          RIT GATE
        </h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
          SECURE ACCESS CONTROL SYSTEM
        </p>

        {/* Action Pills */}
        <div className="flex gap-2 mt-4">
          {[
            { icon: Fingerprint, label: 'Biometric' },
            { icon: Scan, label: 'Badge Scan' },
            { icon: Zap, label: 'Instant' },
          ].map((pill, i) => (
            <button 
              key={i} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF3F9] rounded-full border border-[#DCE4ED] transition-all shadow-sm"
            >
              <pill.icon className="w-3 h-3 text-slate-600" />
              <span className="text-[9px] font-bold text-slate-700 uppercase tracking-tight">{pill.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* 3. Verification Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-[2rem] p-7 shadow-[0_30px_60px_-15px_rgba(37,99,235,0.06)] border border-slate-50">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 leading-none">Verify Identity</h2>
            <p className="text-sm font-medium text-slate-500 mt-2">Enter the one-time password sent to your email.</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">
                VERIFICATION CODE
              </label>
              <div className="grid grid-cols-6 gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    placeholder=" "
                    className={cn(
                      "w-full aspect-[2/3] text-center text-xl font-bold rounded-xl border-2 transition-all outline-none",
                      digit ? "border-blue-600 bg-white ring-4 ring-blue-500/5 text-slate-900" : "border-slate-100 bg-[#F8FAFF] text-slate-900"
                    )}
                  />
                ))}
              </div>
            </div>

            {maskedEmail && (
              <p className="text-[11px] font-medium text-slate-500 text-center uppercase tracking-tight">
                Sent to <span className="text-slate-900 font-bold">{maskedEmail}</span>
              </p>
            )}

            <div className="flex items-center justify-between px-1">
              {resendTimer > 0 ? (
                <span className="text-xs font-bold text-slate-400 leading-none">
                  Resend in <span className="text-slate-700">{formatTimer(resendTimer)}</span>
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors leading-none"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isResending && "animate-spin")} />
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-bold text-slate-900 leading-none"
              >
                Change ID
              </button>
            </div>

            <Button
              fullWidth
              size="lg"
              isLoading={isLoading}
              onClick={() => handleVerify()}
              disabled={otp.some(d => !d)}
              className="h-13 font-black tracking-widest rounded-xl bg-[#202939] hover:bg-[#151B26] text-white uppercase shadow-lg shadow-slate-200"
            >
              Verify & Login
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Footer System Indicator */}
      <div className="mt-auto">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Access Verification System</p>
      </div>
    </div>
  );
}
