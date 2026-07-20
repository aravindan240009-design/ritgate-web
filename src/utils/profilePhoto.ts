// ── Profile photo resolution ──────────────────────────────────────────────────
// The backend is inconsistent about which key carries a person's photo: visitor
// payloads use profilePhoto/visitorPhoto, student pass requests use
// studentPhoto/requesterPhoto, and the active-persons feed uses profileImage.
// Each screen used to inline its own precedence list, so a field one screen knew
// about was a silent placeholder on another. This is the single list.
const PHOTO_FIELDS = [
  'profilePhoto',
  'profileImage',
  'photoUrl',
  'studentPhoto',
  'studentProfilePhoto',
  'requesterPhoto',
  'requesterProfilePhoto',
  'visitorPhoto',
] as const;

// JSON nulls routinely arrive as the strings "null"/"undefined", and an empty
// src makes the browser re-request the current page and fire onError. Treat all
// of these as "no photo" so the avatar falls back instead of showing a broken
// image icon.
const isUsable = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined';
};

/**
 * Picks the first usable photo URL off an API record.
 *
 * Returns `undefined` when the person genuinely has no photo, which is the only
 * case where callers should render the initials placeholder.
 */
export function resolveProfilePhoto(source: any): string | undefined {
  if (!source) return undefined;

  for (const field of PHOTO_FIELDS) {
    const value = source[field];
    if (isUsable(value)) return normalizePhotoUrl(value.trim());
  }

  return undefined;
}

/**
 * Photos are served from the IMS host, not the gate-pass API, so the backend
 * sends absolute URLs and we pass them through untouched — including any query
 * string, which is what lets a re-upload bust the browser cache.
 *
 * Protocol-relative and root-relative paths are left as-is too: the browser
 * resolves them against the current origin. A bare filename can't be resolved
 * without inventing a host, so it's rejected rather than turned into a
 * guaranteed 404 against our own origin.
 */
function normalizePhotoUrl(value: string): string | undefined {
  if (/^(https?:)?\/\//i.test(value)) return value;
  if (/^(data|blob):/i.test(value)) return value;
  if (value.startsWith('/')) return value;
  return undefined;
}
