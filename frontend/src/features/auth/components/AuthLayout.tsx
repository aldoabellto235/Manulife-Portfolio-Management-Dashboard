import { type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { tokens } from '@/shared/theme/tokens';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: tokens.color.bgPage,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              backgroundColor: tokens.color.primary,
              borderRadius: tokens.radius.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.font.display,
                fontSize: '1rem',
                fontWeight: 700,
                color: tokens.color.textInverse,
                lineHeight: 1,
              }}
            >
              M
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: tokens.font.display,
              fontSize: '1.15rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: tokens.color.textPrimary,
            }}
          >
            Manulife
          </Typography>
        </Box>

        {/* Card */}
        <Box
          sx={{
            backgroundColor: tokens.color.bgBase,
            border: `1px solid ${tokens.color.border}`,
            borderRadius: tokens.radius.xl,
            p: { xs: 3, sm: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
