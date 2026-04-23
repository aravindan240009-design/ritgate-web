import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SafeBackNavigationOptions {
  /** The path of the root home screen for your stack */
  homePath?: string;
  /** Whether to show a confirmation dialog when pressing back on the Home screen */
  requireExitConfirmation?: boolean;
  /** Provide an array of active root paths where back should potentially prompt exit */
  rootPaths?: string[];
  /** Callback to trigger a custom exit modal */
  onShowExitConfirm?: () => void;
}

/**
 * Hook to safely control back navigation on web.
 * - Prevents users from accidentally navigating away from important forms.
 * - Ensures a 'back' action leads to a predictable state (like Dashboard).
 */
export const useSafeBackNavigation = (options?: SafeBackNavigationOptions) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const homePath = options?.homePath || '/dashboard';
  const rootPaths = options?.rootPaths || [homePath];
  const requireExitConfirmation = options?.requireExitConfirmation ?? false;

  const [isExitModalVisible, setIsExitModalVisible] = useState(false);

  const handleBackPress = useCallback(() => {
    const isRootPath = rootPaths.includes(location.pathname);

    if (isRootPath) {
      if (requireExitConfirmation) {
        if (options?.onShowExitConfirm) {
          options.onShowExitConfirm();
        } else {
          setIsExitModalVisible(true);
        }
        return; // In browser, we can't truly block the close/back but we can warn
      }
      return; 
    }

    // Default behavior for web: navigate to the designated home path
    // Ensures we don't end up on a login screen or outside the app
    navigate(homePath);
  }, [location.pathname, rootPaths, navigate, homePath, requireExitConfirmation, options]);

  // Handle browser back button (limited control compared to mobile)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If we want to intercept, we'd need a more complex history-blocking strategy
      // For now, this hook primarily provides a programmatic 'safeBack' function
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    isExitModalVisible,
    showExitModal: () => setIsExitModalVisible(true),
    hideExitModal: () => setIsExitModalVisible(false),
    confirmExit: () => {
      // Browsers don't support window.close() unless opened by script
      // Usually we redirect to a landing page or logout
      window.location.href = '/login';
    },
    handleBackPress,
    safeBack: handleBackPress
  };
};
