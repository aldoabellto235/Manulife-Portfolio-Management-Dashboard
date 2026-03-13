import { type ReactNode } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { useState } from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useSnackbar } from 'notistack';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { useLogoutMutation } from '@/features/auth/api/authApi';
import { clearAuth } from '@/features/auth/store/authSlice';
import { tokens } from '@/shared/theme/tokens';

const NAV_LINKS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Investments', path: '/investments/new' },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logout] = useLogoutMutation();

  const { enqueueSnackbar } = useSnackbar();

  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      await logout().unwrap();
    } finally {
      dispatch(clearAuth());
      enqueueSnackbar('You have been signed out.', { variant: 'info' });
      navigate('/login');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: tokens.color.bgPage }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: tokens.color.bgBase,
          borderBottom: `1px solid ${tokens.color.border}`,
          color: tokens.color.textPrimary,
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: '56px !important' }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              mr: 3,
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                backgroundColor: tokens.color.primary,
                borderRadius: tokens.radius.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.font.display,
                  fontSize: '0.9rem',
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
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                color: tokens.color.textPrimary,
              }}
            >
              Manulife
            </Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Button
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  size="small"
                  sx={{
                    fontSize: tokens.fontSize.sm,
                    color: isActive ? tokens.color.primary : tokens.color.textSecondary,
                    backgroundColor: isActive ? tokens.color.primaryMuted : 'transparent',
                    fontWeight: isActive ? 500 : 400,
                    px: 1.5,
                    '&:hover': {
                      backgroundColor: tokens.color.bgSubtle,
                      color: tokens.color.textPrimary,
                    },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>

          {/* Account menu */}
          <Box>
            <Button
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon fontSize="small" />}
              startIcon={<AccountCircleOutlinedIcon fontSize="small" />}
              sx={{
                color: tokens.color.textSecondary,
                fontSize: tokens.fontSize.sm,
                '&:hover': { backgroundColor: tokens.color.bgSubtle },
              }}
            >
              {user?.email ?? 'Account'}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled sx={{ fontSize: tokens.fontSize.xs, opacity: 1 }}>
                <Typography variant="caption" sx={{ color: tokens.color.textMuted }}>
                  {user?.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: tokens.color.danger, fontSize: tokens.fontSize.sm }}>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Page content */}
      <Box component="main" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: 1280, mx: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
}
