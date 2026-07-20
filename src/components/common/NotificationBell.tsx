import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import { relativeTime } from '../../utils/dateUtils';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const bellRef = useRef<HTMLButtonElement>(null);

  // Recalculate position every time the dropdown opens
  useEffect(() => {
    if (open && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,                        // 8px gap below the bell
        right: window.innerWidth - rect.right,       // align right edge with bell
      });
    }
  }, [open]);

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={() => setOpen(v => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/72 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.75)] backdrop-blur-xl transition-all hover:bg-[var(--color-primary-subtle)] dark:border-white/10 dark:bg-white/[0.05] dark:shadow-none dark:hover:border-white/20 dark:hover:bg-white/[0.1]"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-900 dark:text-slate-200" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-[9px] font-black px-1 border-2 border-white dark:border-slate-900"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Portal — renders outside every stacking context */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Invisible full-screen backdrop — catches outside clicks */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0"
                style={{ zIndex: 9990 }}
              />

              {/* Dropdown panel */}
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'fixed',
                  top: dropdownPos.top,
                  right: dropdownPos.right,
                  zIndex: 9991,
                  width: 420,
                  maxWidth: 'calc(100vw - 24px)',
                }}
                className="bg-white/95 dark:bg-[#0b1120]/95 rounded-[24px] border border-slate-200/90 dark:border-slate-800 shadow-[0_32px_96px_-24px_rgba(15,23,42,0.35)] backdrop-blur-2xl overflow-hidden flex flex-col max-h-[540px]"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Notifications</h3>
                    {unreadCount > 0 ? (
                      <span className="min-w-[22px] h-5 px-2 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                        {unreadCount} new
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">All read</span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-xs text-blue-600 dark:text-blue-400 font-extrabold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => { clearAllNotifications(); setOpen(false); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-600 dark:text-rose-400 font-extrabold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-14 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                        <Bell className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No notifications</p>
                      <p className="text-xs font-semibold text-slate-400">You're all caught up for today!</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map(n => {
                      const isUnread = !n.isRead;
                      const isApproved = n.title?.toLowerCase().includes('approved') || n.type === 'APPROVAL';
                      const isRejected = n.title?.toLowerCase().includes('reject') || n.type === 'REJECTION';

                      return (
                        <button
                          key={n.id}
                          onClick={() => { markAsRead(n.id); setOpen(false); }}
                          className={cn(
                            'w-full text-left p-4 transition-all duration-150 flex gap-3.5 items-start relative group',
                            isUnread
                              ? 'bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-900/40'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900/40',
                          )}
                        >
                          {/* Left Accent indicator dot */}
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 absolute left-3 top-5 shadow-sm shadow-blue-500/50" />
                          )}

                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold transition-transform group-hover:scale-105 shadow-sm ml-1",
                            isApproved ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" :
                            isRejected ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400" :
                            isUnread ? "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400" :
                            "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          )}>
                            <Bell className="w-5 h-5 stroke-[2]" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={cn(
                                "text-sm leading-tight tracking-tight truncate",
                                isUnread ? "font-black text-slate-900 dark:text-white" : "font-extrabold text-slate-800 dark:text-slate-200"
                              )}>
                                {n.title}
                              </h4>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                                {relativeTime(n.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
