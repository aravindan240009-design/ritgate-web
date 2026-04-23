import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Layout, 
  AlignLeft, 
  Paperclip, 
  X, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useActionLock } from '../../context/ActionLockContext';
import { submitStudentGatePass } from '../../services/api.service';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import SuccessModal from '../../components/common/SuccessModal';
import ErrorModal from '../../components/common/ErrorModal';
import { cn } from '../../utils/cn';
import { getRequestDate } from '../../utils/dateUtils';
import type { Student } from '../../types';

export default function NewRequest() {
  const navigate = useNavigate();
  const { user: rawUser } = useAuth();
  const user = rawUser as Student;
  const { success: showToastSuccess, error: showToastError } = useToast();
  const { withLock, isLocked } = useActionLock();

  const [purpose, setPurpose] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<{ name: string; uri: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isFormValid = purpose.trim() && reason.trim();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToastError('File Too Large', 'Maximum attachment size is 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (prev) => {
      setAttachment({
        name: file.name,
        uri: prev.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    await withLock(async () => {
      try {
        const response = await submitStudentGatePass({
          regNo: user?.regNo || '',
          purpose: purpose.trim(),
          reason: reason.trim(),
          requestDate: getRequestDate(),
          ...(attachment ? { attachmentUri: attachment.uri } : {})
        });

        if (response.success) {
          setShowSuccess(true);
        } else {
          setErrorMessage(response.message || 'Could not submit request');
          setShowError(true);
        }
      } catch (err) {
        setErrorMessage('Network error occurred. Please try again.');
        setShowError(true);
      }
    }, 'Submitting Request...');
  };

  const handleGoBack = () => {
    if (purpose || reason || attachment) {
      if (window.confirm('Discard changes and go back?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-4 h-[64px] flex items-center">
          <button
            onClick={handleGoBack}
            className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white active:scale-90 transition-transform mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[16px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Apply for Gate Pass
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-6 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          {/* Profile Banner */}
          <div className="bg-indigo-600 rounded-[28px] p-5 flex items-center gap-4 shadow-lg shadow-indigo-200 dark:shadow-none">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white text-[22px] font-black">
              {user?.firstName?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
               <h2 className="text-white text-[17px] font-black tracking-tight leading-none mb-1.5 truncate">
                 {user?.firstName} {user?.lastName}
               </h2>
               <div className="flex items-center gap-2">
                 <span className="px-2 py-0.5 bg-white/10 rounded-lg text-white/80 text-[10px] font-bold uppercase tracking-wider">
                   {user?.department}
                 </span>
                 <span className="text-white/60 text-[11px] font-bold tracking-widest">{user?.regNo}</span>
               </div>
            </div>
            <ShieldCheck className="w-8 h-8 text-white/30" />
          </div>

          <div className="space-y-6">
            {/* Purpose Input */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-1">
                PURPOSE OF VISIT
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <Layout className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  placeholder="e.g. Hospital, Personal Work"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[15px] font-bold text-slate-900 dark:text-white placeholder:text-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Detailed Reason */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-1">
                DETAILED REASON
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <AlignLeft className="w-5 h-5" />
                </div>
                <textarea 
                  rows={4}
                  placeholder="Please provide specific details for your outing..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[15px] font-bold text-slate-900 dark:text-white placeholder:text-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Attachment Picker */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-1">
                ATTACHMENT PROOF (OPTIONAL)
              </label>
              
              {!attachment ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[28px] flex flex-col items-center justify-center gap-3 active:scale-[0.98] transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <Paperclip className="w-6 h-6" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-500 group-hover:text-indigo-600">Upload Image or PDF</span>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                </button>
              ) : (
                <div className="relative bg-white dark:bg-slate-900 rounded-[28px] p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{attachment.name}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Proof Attached</p>
                  </div>
                  <button 
                    onClick={() => setAttachment(null)}
                    className="w-9 h-9 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center text-rose-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-40">
        <button 
          onClick={() => setShowConfirmSubmit(true)}
          disabled={!isFormValid || isLocked}
          className={cn(
            "w-full h-15 bg-slate-950 dark:bg-indigo-600 rounded-2xl flex items-center justify-center gap-3 text-white active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none",
            (!isFormValid || isLocked) && "opacity-60 saturate-50 cursor-not-allowed"
          )}
        >
          {isLocked ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <span className="text-[16px] font-black uppercase tracking-[0.2em]">Submit Request</span>
          )}
        </button>
      </div>

      {/* Modals */}
      <ConfirmationModal 
        visible={showConfirmSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
        onConfirm={() => {
          setShowConfirmSubmit(false);
          handleSubmit();
        }}
        title="Submit Request"
        message="Are you sure you want to submit this gate pass request for authorization?"
        confirmText="Yes, Submit"
      />

      <SuccessModal 
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate('/dashboard');
        }}
        title="Request Dispatched"
        message="Your gate pass request has been successfully submitted and is awaiting staff authorization."
      />

      <ErrorModal 
        visible={showError}
        type="general"
        onClose={() => setShowError(false)}
        title="Submission Failed"
        message={errorMessage}
      />
    </div>
  );
}
