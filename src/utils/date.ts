// Single source of truth for date formatting is src/utils/dateUtils.ts.
// These re-exports keep the older `utils/date` import path working while
// guaranteeing consistent IST parsing (no browser-timezone drift, no
// double +5:30 conversion).
export { formatDate, formatDateShort, getRelativeTime as formatRelativeTime } from './dateUtils';
