/**
 * Color Palette (Slate/Indigo inspired)
 */
export const colors = {
  primary: {
    600: '#6366F1', // Indigo (Mobile Primary)
    700: '#4F46E5',
    800: '#3730A3',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0', // Border
    400: '#94A3B8', // Text Tertiary
    500: '#64748B', // Text Secondary (Greeting)
    900: '#0F172A', // Main Text
  },
  status: {
    success: '#10B981', // Vibrant Green
    warning: '#F59E0B', // Amber
    error: '#EF4444',   // Red
    info: '#3B82F6',    // Blue
  },
  white: '#FFFFFF',
  cardBackground: '#FFFFFF',
};

/**
 * Border Radius Rules
 */
export const radius = {
  base: '12px',   // Cards
  large: '16px',  // Modals
  full: '999px',  // Buttons
};

/**
 * Soft iOS-style elevation
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  premium: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};
