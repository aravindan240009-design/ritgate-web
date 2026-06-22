// Helper functions for gate pass request status
import { getStatusMeta } from './statusUtils';

export interface RequestStatusResult {
  text: string;
  color: string;
  bgColor: string;
}

export const getRequestStatus = (request: any, theme: any): RequestStatusResult => {
  const meta = getStatusMeta(request);
  const palette: Record<string, string> = {
    emerald: theme.success,
    green: theme.success,
    red: theme.error,
    danger: theme.error,
    amber: theme.warning,
    orange: theme.warning,
    warning: theme.warning,
    blue: theme.primary || theme.info || theme.warning,
    gray: theme.textSecondary,
  };
  const color = palette[meta.variant] || theme.textSecondary;

  return {
    text: meta.label,
    color,
    bgColor: color + '15',
  };
};
