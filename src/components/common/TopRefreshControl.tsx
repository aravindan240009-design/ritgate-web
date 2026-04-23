import React from 'react';

/**
 * Simplified TopRefreshControl — no touch event interception.
 * Pull-to-refresh was blocking native scroll on mobile browsers.
 * Now it's a transparent passthrough wrapper.
 * Refresh is triggered via the RefreshContext (polling) instead.
 */
interface TopRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  pullEnabled?: boolean;
}

export default function TopRefreshControl({
  children,
}: TopRefreshControlProps) {
  return <>{children}</>;
}
