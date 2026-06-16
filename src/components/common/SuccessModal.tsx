import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SuccessModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function SuccessModal({
  visible,
  title = 'Completed Successfully',
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 2000,
}: SuccessModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.max(1, Math.ceil(autoCloseDelay / 1000))
  );

  useEffect(() => {
    if (visible) {
      const initialSeconds = Math.max(1, Math.ceil(autoCloseDelay / 1000));
      setSecondsRemaining(initialSeconds);
      
      if (autoClose) {
        const countdownTimer = setInterval(() => {
          setSecondsRemaining((prev) => Math.max(0, prev - 1));
        }, 1000);
        
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);
        
        return () => {
          clearTimeout(timer);
          clearInterval(countdownTimer);
        };
      }
    }
  }, [visible, autoClose, autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0F172A]/60 backdrop-blur-sm pt-safe">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl overflow-hidden"
            style={{ width: 'calc(100vw - 48px)', maxWidth: 470, boxSizing: 'border-box' }}
          >
            {/* Hero Section */}
            <div className="pt-4.5 pb-1.5 flex flex-col items-center">
              <div className="h-1.5 w-full bg-emerald-500 absolute top-0" />
              
              <div className="mt-4 flex items-center justify-center">
                <div className="w-[82px] h-[82px] rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check className="w-9 h-9 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-7 pt-4.5 pb-2.5 flex flex-col items-center text-center">
              <h3 className="text-[22px] font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-2">
                {title}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px]">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="p-5 pt-2.5">
              <button
                onClick={onClose}
                className="w-full h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2.5 active:scale-95 transition-transform"
              >
                <div className="w-[86%] h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  {autoClose && (
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: autoCloseDelay / 1000, ease: 'linear' }}
                      className="h-full bg-emerald-500"
                    />
                  )}
                </div>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {autoClose ? `OK (${secondsRemaining}s)` : 'OK'}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
