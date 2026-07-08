export interface ShareVisitorInfo {
  name: string;
  eventName: string;
  eventDate?: string;
  venue?: string;
  manualEntryCode?: string;
}

export function buildVisitorShareText(info: ShareVisitorInfo): string {
  const lines = [
    `${info.name} — Event Pass`,
    info.eventName ? `Event: ${info.eventName}${info.eventDate ? ` (${info.eventDate})` : ''}` : '',
    info.venue ? `Venue: ${info.venue}` : '',
    info.manualEntryCode ? `Entry Code: ${info.manualEntryCode}` : '',
    'Show the QR code from your registration email at the gate for entry.',
  ].filter(Boolean);
  return lines.join('\n');
}

export type ShareResult = 'shared' | 'copied' | 'unavailable' | 'cancelled' | 'error';

export async function shareVisitorInfo(info: ShareVisitorInfo): Promise<ShareResult> {
  const text = buildVisitorShareText(info);
  const title = `${info.name} — ${info.eventName}`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch (e: any) {
      if (e?.name === 'AbortError') return 'cancelled';
      // fall through to clipboard fallback
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      return 'error';
    }
  }

  return 'unavailable';
}
