import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  className?: string;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-full mx-4',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true, className }: ModalProps) {
  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[7px]"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 22, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative w-full bg-white/88 dark:bg-slate-900/90 shadow-[0_28px_90px_-32px_rgba(37,99,235,0.65)] z-10 backdrop-blur-2xl border border-white/55 dark:border-slate-700/70',
              'sm:rounded-[24px] rounded-t-[24px]',
              'max-h-[90vh] flex flex-col',
              'safe-area-bottom',
              sizes[size],
              className,
            )}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center py-2 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
            </div>

            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80 dark:border-slate-800">
                {title && <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">{title}</h2>}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-full bg-slate-50 text-slate-500 ring-1 ring-slate-100 transition-all hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto scroll-momentum px-6 py-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
