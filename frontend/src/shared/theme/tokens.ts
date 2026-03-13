export const tokens = {
  color: {
    // Backgrounds — flat, no gradients
    bgPage: '#F5F6FA',
    bgBase: '#FFFFFF',
    bgSurface: '#FAFBFC',
    bgSubtle: '#F0F2F7',
    bgMuted: '#E8EAF0',

    // Primary — navy
    primary: '#1A2B4A',
    primaryHover: '#243660',
    primaryLight: '#2E4A80',
    primaryMuted: '#EEF1F8',

    // Accent — gold
    accent: '#C9A84C',
    accentHover: '#B8943A',
    accentMuted: '#FDF6E7',

    // Text
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    textDisabled: '#D1D5DB',
    textInverse: '#FFFFFF',

    // Semantic
    success: '#16A34A',
    successMuted: '#F0FDF4',
    danger: '#DC2626',
    dangerMuted: '#FEF2F2',
    warning: '#D97706',
    warningMuted: '#FFFBEB',
    info: '#2563EB',
    infoMuted: '#EFF6FF',

    // Borders
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    borderFocus: '#1A2B4A',
  },

  font: {
    display: '"Cormorant Garamond", Georgia, serif',
    body: '"DM Sans", system-ui, sans-serif',
    mono: '"IBM Plex Mono", "Courier New", monospace',
  },

  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },

  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },

  radius: {
    sm: '4px',
    md: '6px',
    lg: '10px',
    xl: '14px',
    full: '9999px',
  },

  transition: {
    fast: '120ms ease',
    base: '200ms ease',
  },
} as const;
