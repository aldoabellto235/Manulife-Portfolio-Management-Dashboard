import { createTheme } from '@mui/material/styles';
import { tokens } from './tokens';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tokens.color.primary,
      light: tokens.color.primaryLight,
      dark: tokens.color.primaryHover,
      contrastText: tokens.color.textInverse,
    },
    secondary: {
      main: tokens.color.accent,
      contrastText: tokens.color.textInverse,
    },
    success: {
      main: tokens.color.success,
      contrastText: tokens.color.textInverse,
    },
    error: {
      main: tokens.color.danger,
      contrastText: tokens.color.textInverse,
    },
    warning: {
      main: tokens.color.warning,
      contrastText: tokens.color.textInverse,
    },
    background: {
      default: tokens.color.bgPage,
      paper: tokens.color.bgBase,
    },
    text: {
      primary: tokens.color.textPrimary,
      secondary: tokens.color.textSecondary,
      disabled: tokens.color.textDisabled,
    },
    divider: tokens.color.border,
  },

  typography: {
    fontFamily: tokens.font.body,
    h1: {
      fontFamily: tokens.font.display,
      fontSize: tokens.fontSize['4xl'],
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: '-0.01em',
      color: tokens.color.textPrimary,
    },
    h2: {
      fontFamily: tokens.font.display,
      fontSize: tokens.fontSize['3xl'],
      fontWeight: 600,
      lineHeight: 1.2,
      color: tokens.color.textPrimary,
    },
    h3: {
      fontFamily: tokens.font.display,
      fontSize: tokens.fontSize['2xl'],
      fontWeight: 600,
      lineHeight: 1.25,
      color: tokens.color.textPrimary,
    },
    h4: {
      fontFamily: tokens.font.body,
      fontSize: tokens.fontSize.xl,
      fontWeight: 600,
      lineHeight: 1.3,
      color: tokens.color.textPrimary,
    },
    h5: {
      fontFamily: tokens.font.body,
      fontSize: tokens.fontSize.lg,
      fontWeight: 600,
      lineHeight: 1.4,
      color: tokens.color.textPrimary,
    },
    h6: {
      fontFamily: tokens.font.body,
      fontSize: tokens.fontSize.base,
      fontWeight: 600,
      lineHeight: 1.5,
      color: tokens.color.textPrimary,
    },
    subtitle1: {
      fontFamily: tokens.font.body,
      fontSize: tokens.fontSize.base,
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontFamily: tokens.font.body,
      fontSize: tokens.fontSize.sm,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
    },
    body1: {
      fontFamily: tokens.font.body,
      fontSize: tokens.fontSize.base,
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: tokens.font.body,
      fontSize: tokens.fontSize.sm,
      fontWeight: 400,
      lineHeight: 1.6,
    },
    caption: {
      fontFamily: tokens.font.body,
      fontSize: tokens.fontSize.xs,
      fontWeight: 400,
      lineHeight: 1.5,
      color: tokens.color.textMuted,
    },
    overline: {
      fontFamily: tokens.font.body,
      fontSize: tokens.fontSize.xs,
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },

  shape: {
    borderRadius: 6,
  },

  // Flat — remove all elevation shadows
  shadows: [
    'none','none','none','none','none',
    'none','none','none','none','none',
    'none','none','none','none','none',
    'none','none','none','none','none',
    'none','none','none','none','none',
  ] as Parameters<typeof createTheme>[0] extends { shadows?: infer S } ? NonNullable<S> : never,

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        body: {
          backgroundColor: tokens.color.bgPage,
        },
        '::-webkit-scrollbar': { width: '6px' },
        '::-webkit-scrollbar-track': { background: tokens.color.bgSubtle },
        '::-webkit-scrollbar-thumb': {
          background: tokens.color.borderStrong,
          borderRadius: '3px',
        },
        '::-webkit-scrollbar-thumb:hover': { background: tokens.color.primary },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: tokens.font.body,
          fontWeight: 500,
          letterSpacing: '0.01em',
          textTransform: 'none',
          borderRadius: tokens.radius.md,
          boxShadow: 'none',
          transition: `background-color ${tokens.transition.fast}, border-color ${tokens.transition.fast}`,
          '&:hover': { boxShadow: 'none' },
          '&:active': { boxShadow: 'none' },
        },
        contained: {
          backgroundColor: tokens.color.primary,
          '&:hover': { backgroundColor: tokens.color.primaryHover },
        },
        outlined: {
          borderColor: tokens.color.border,
          color: tokens.color.textPrimary,
          '&:hover': {
            borderColor: tokens.color.primary,
            backgroundColor: tokens.color.primaryMuted,
          },
        },
        text: {
          color: tokens.color.textSecondary,
          '&:hover': {
            backgroundColor: tokens.color.bgSubtle,
            color: tokens.color.textPrimary,
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.color.bgBase,
          border: `1px solid ${tokens.color.border}`,
          borderRadius: tokens.radius.lg,
          boxShadow: 'none',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: tokens.color.bgBase,
          border: `1px solid ${tokens.color.border}`,
          boxShadow: 'none',
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: tokens.color.bgBase,
            borderRadius: tokens.radius.md,
            fontSize: tokens.fontSize.sm,
            '& fieldset': {
              borderColor: tokens.color.border,
              transition: `border-color ${tokens.transition.fast}`,
            },
            '&:hover fieldset': { borderColor: tokens.color.borderStrong },
            '&.Mui-focused fieldset': {
              borderColor: tokens.color.borderFocus,
              borderWidth: '1.5px',
            },
          },
          '& .MuiInputLabel-root': {
            color: tokens.color.textMuted,
            fontSize: tokens.fontSize.sm,
            '&.Mui-focused': { color: tokens.color.primary },
          },
          '& .MuiInputBase-input': {
            color: tokens.color.textPrimary,
            fontFamily: tokens.font.body,
          },
          '& .MuiFormHelperText-root': {
            fontSize: tokens.fontSize.xs,
            marginLeft: 0,
          },
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontFamily: tokens.font.body,
            fontSize: tokens.fontSize.xs,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: tokens.color.textMuted,
            backgroundColor: tokens.color.bgSurface,
            borderBottom: `1px solid ${tokens.color.border}`,
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${tokens.color.border}`,
          color: tokens.color.textPrimary,
          fontFamily: tokens.font.body,
          fontSize: tokens.fontSize.sm,
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: tokens.color.bgSurface },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: tokens.font.body,
          fontSize: tokens.fontSize.xs,
          fontWeight: 500,
          borderRadius: tokens.radius.sm,
          boxShadow: 'none',
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: tokens.color.border },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.color.bgSubtle,
          borderRadius: tokens.radius.full,
          height: 4,
        },
        bar: {
          backgroundColor: tokens.color.primary,
          borderRadius: tokens.radius.full,
        },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: tokens.color.bgMuted },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.color.primary,
          color: tokens.color.textInverse,
          fontFamily: tokens.font.body,
          fontSize: tokens.fontSize.xs,
          borderRadius: tokens.radius.sm,
          boxShadow: 'none',
        },
        arrow: { color: tokens.color.primary },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          fontSize: tokens.fontSize.sm,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.color.border },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokens.color.borderStrong },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.color.borderFocus,
            borderWidth: '1.5px',
          },
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.color.bgBase,
          border: `1px solid ${tokens.color.border}`,
          boxShadow: 'none',
          borderRadius: tokens.radius.md,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: tokens.font.body,
          fontSize: tokens.fontSize.sm,
          color: tokens.color.textPrimary,
          '&:hover': { backgroundColor: tokens.color.bgSubtle },
          '&.Mui-selected': {
            backgroundColor: tokens.color.primaryMuted,
            '&:hover': { backgroundColor: tokens.color.primaryMuted },
          },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          fontSize: tokens.fontSize.sm,
          fontFamily: tokens.font.body,
          boxShadow: 'none',
        },
      },
    },
  },
});
