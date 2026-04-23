/** Format date to IST display string */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/** Format time to IST display string */
export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

/** Format date + time */
export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

/** Format date + time (short version) */
export function formatDateTimeShort(date: string | Date): string {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  });
  const timeStr = formatTime(date);
  return `${dateStr}, ${timeStr}`;
}

/** Get relative time (e.g., "2 min ago") */
export function relativeTime(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatDate(date);
}

/** Get relative time (alias for compatibility) */
export function getRelativeTime(date: string | Date): string {
  return relativeTime(date);
}

/** Check if date is today (IST) */
export function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const now = new Date();
  const ist = (dt: Date) => new Date(dt.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const dIST = ist(d);
  const nowIST = ist(now);
  return (
    dIST.getFullYear() === nowIST.getFullYear() &&
    dIST.getMonth() === nowIST.getMonth() &&
    dIST.getDate() === nowIST.getDate()
  );
}

/** Check if current time is past 3 PM IST */
export function isPast3PM(): boolean {
  const now = new Date();
  const istHour = parseInt(
    now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' })
  );
  return istHour >= 15;
}

/** Get today's date in YYYY-MM-DD format (IST) */
export function getTodayIST(): string {
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return istDate.toISOString().split('T')[0];
}

/** Get formatted date for API request */
export function getRequestDate(): string {
  return getTodayIST();
}

/** Time headers for API requests */
export function timeHeaders(): Record<string, string> {
  const now = new Date();
  return {
    'X-Client-Time': now.toISOString(),
    'X-Client-Timezone': 'Asia/Kolkata',
  };
}
