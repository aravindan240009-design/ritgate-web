import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ExitConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

/**
 * Exit confirmation modal for web
 * Used when user tries to close the app or navigate away
 */
export default function ExitConfirmModal({
  visible,
  onCancel,
  onConfirm,
  title = 'Exit App',
  message = 'Are you sure you want to exit the application?',
}: ExitConfirmModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-4 z-50"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 flex flex-col items-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mb-4">
                <LogOut className="w-7 h-7 text-rose-600 dark:text-rose-400" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                {title}
              </h3>

              {/* Message */}
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed px-2">
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={onCancel}
                  className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Stay
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
                >
                  Exit
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
