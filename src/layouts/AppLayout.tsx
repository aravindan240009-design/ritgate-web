import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from '../components/navigation/MobileBottomNav';
import { useNotifications } from '../context/NotificationContext';
import { useAdaptive } from '../utils/useAdaptive';
import { cn } from '../utils/cn';

export default function AppLayout() {
  const { isMobile, isTablet, isDesktop } = useAdaptive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const location = useLocation();
  const { pushEnabled, requestPushPermission } = useNotifications();

  // Auto-collapse sidebar on tablet, expand on desktop
  useEffect(() => {
    if (isTablet) setSidebarCollapsed(true);
    else if (isDesktop) setSidebarCollapsed(false);
  }, [isTablet, isDesktop]);

  // Push notification prompt — only on desktop/tablet
  useEffect(() => {
    if (!isMobile && !pushEnabled && 'Notification' in window && Notification.permission === 'default') {
      const t = setTimeout(() => setShowNotifPrompt(true), 6000);
      return () => clearTimeout(t);
    }
  }, [pushEnabled, isMobile]);

  const handleEnablePush = async () => {
    const ok = await requestPushPermission();
    if (ok) setShowNotifPrompt(false);
  };

  // Sidebar width for margin offset
  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 68 : 256;

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>
        <Outlet />
        <MobileBottomNav />
      </div>
    );
  }

  // ── TABLET / DESKTOP LAYOUT ────────────────────────────────────────────────
  return (
    <div className="min-full-height bg-slate-50 dark:bg-slate-950 flex">
      {/* Fixed sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      {/* Main area — offset by sidebar width */}
      <div
        className="flex flex-col flex-1 min-h-screen transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Sticky top header */}
        <Header
          onMenuClick={() => setSidebarCollapsed(c => !c)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Push notification banner */}
        <AnimatePresence>
          {showNotifPrompt && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden shrink-0"
            >
              <div className="bg-indigo-600 text-white px-6 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 shrink-0" />
                  <p className="text-sm font-medium">
                    Enable push notifications to get gate pass updates instantly.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleEnablePush}
                    className="px-3 py-1 rounded-md bg-white text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition-colors"
                  >
                    Enable
                  </button>
                  <button
                    onClick={() => setShowNotifPrompt(false)}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-white/70" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className={cn(
          'flex-1 overflow-y-auto',
          isDesktop
            ? 'px-8 py-8'
            : 'px-4 py-6', // tablet
        )}>
          <div className="w-full max-w-[1280px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
