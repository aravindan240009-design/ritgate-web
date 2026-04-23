import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionLockContextType {
  isLocked: boolean;
  lockMessage: string;
  lock: (message?: string) => void;
  unlock: () => void;
  withLock: <T>(fn: () => Promise<T>, message?: string) => Promise<T>;
}

const ActionLockContext = createContext<ActionLockContextType | undefined>(undefined);

export const ActionLockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('Processing...');

  const lock = useCallback((message = 'Processing...') => {
    setLockMessage(message);
    setIsLocked(true);
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
    setLockMessage('Processing...');
  }, []);

  const withLock = useCallback(async <T,>(fn: () => Promise<T>, message = 'Processing...'): Promise<T> => {
    lock(message);
    try {
      return await fn();
    } finally {
      unlock();
    }
  }, [lock, unlock]);

  return (
    <ActionLockContext.Provider value={{ isLocked, lockMessage, lock, unlock, withLock }}>
      {children}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-100 dark:border-slate-700"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 dark:border-slate-700 rounded-full" />
                <motion.div
                  className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {lockMessage}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Please wait, do not close the app
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ActionLockContext.Provider>
  );
};

export const useActionLock = (): ActionLockContextType => {
  const ctx = useContext(ActionLockContext);
  if (!ctx) throw new Error('useActionLock must be used within ActionLockProvider');
  return ctx;
};
