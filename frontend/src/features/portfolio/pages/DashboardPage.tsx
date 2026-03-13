import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import { AppLayout } from '@/layout/AppLayout';
import { PortfolioSummary } from '../components/PortfolioSummary';
import { AssetTable } from '../components/AssetTable';
import { useGetPortfolioQuery } from '../api/portfolioApi';
import { useGetMeQuery } from '@/features/auth/api/authApi';
import { tokens } from '@/shared/theme/tokens';

export function DashboardPage() {
  const { data, isLoading, isError } = useGetPortfolioQuery();
  useGetMeQuery();

  const portfolio = data?.data;

  return (
    <AppLayout>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.25 }}>
            Portfolio
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
            Overview of your investments
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/investments/new"
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
          sx={{ height: 36 }}
        >
          Add Investment
        </Button>
      </Box>

      {/* Error */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load portfolio. Please refresh the page.
        </Alert>
      )}

      {/* Summary cards */}
      <Box sx={{ mb: 3 }}>
        <PortfolioSummary summary={portfolio?.summary} isLoading={isLoading} />
      </Box>

      {/* Assets table */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ color: tokens.color.textMuted, mb: 1.5, letterSpacing: '0.06em' }}
        >
          Holdings
        </Typography>
        <AssetTable />
      </Box>
    </AppLayout>
  );
}
