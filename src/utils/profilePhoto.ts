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
  'photo',
  'image',
  'imageUrl',
  'imagePath',
  'photoPath',
  'photoName',
  'imageName',
  'picture',
  'avatar',
  'studentPhoto',
  'studentImage',
  'staffPhoto',
  'staffImage',
  'studentProfilePhoto',
  'requesterPhoto',
  'requesterProfilePhoto',
  'visitorPhoto',
  // snake_case variants, in case the API isn't camelCasing consistently
  'profile_photo',
  'profile_image',
  'photo_url',
  'image_url',
  'image_path',
  'photo_path',
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

// Photos live on the IMS host, not the gate-pass API. Overridable per
// environment so this never has to be edited in code.
const IMS_PHOTO_BASE = (
  import.meta.env.VITE_IMS_PHOTO_BASE_URL || 'https://ims.ritchennai.edu.in/studentImages'
).replace(/\/+$/, '');

// Base64 image payloads identified by their magic bytes, so a raw blob with no
// data: prefix can still be rendered. Backends that return bytes from a BLOB
// column commonly omit the prefix.
const BASE64_SIGNATURES: ReadonlyArray<[RegExp, string]> = [
  [/^\/9j\//, 'image/jpeg'],
  [/^iVBORw0KGgo/, 'image/png'],
  [/^R0lGOD/, 'image/gif'],
  [/^UklGR/, 'image/webp'],
  [/^Qk/, 'image/bmp'],
];

const detectBase64Image = (value: string): string | undefined => {
  // Real URLs and filenames are short and contain separators; base64 payloads
  // are long and restricted to the base64 alphabet.
  if (value.length < 100 || !/^[A-Za-z0-9+/\r\n]+={0,2}$/.test(value)) return undefined;
  const compact = value.replace(/\s+/g, '');
  const match = BASE64_SIGNATURES.find(([signature]) => signature.test(compact));
  return match ? `data:${match[1]};base64,${compact}` : undefined;
};

/**
 * Turns whatever shape the backend sends into something an <img> can load.
 *
 * Absolute URLs pass through untouched, including any query string — that is
 * what lets a re-upload bust the browser cache. Root-relative paths are left
 * for the browser to resolve against the current origin. Raw base64 gets the
 * data: prefix it's missing.
 *
 * A bare filename ("a20ee569….PNG") is resolved against the IMS photo host. If
 * that guess is wrong the image simply 404s and the avatar falls back to
 * initials, so this is safe to attempt rather than dropping the value.
 */
function normalizePhotoUrl(value: string): string | undefined {
  if (/^(https?:)?\/\//i.test(value)) return value;
  if (/^(data|blob):/i.test(value)) return value;

  // Must precede the filename fallback, or a base64 blob would get the IMS host
  // glued onto the front of it.
  const base64Image = detectBase64Image(value);
  if (base64Image) return base64Image;

  if (value.startsWith('/')) return value;
  return `${IMS_PHOTO_BASE}/${value.replace(/^\.?\//, '')}`;
}
