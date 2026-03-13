import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import type { PortfolioSummary as PortfolioSummaryType } from '../types';
import { formatCurrency, formatPercent } from '@/shared/utils/formatCurrency';
import { tokens } from '@/shared/theme/tokens';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean | null;
  icon: React.ReactNode;
}

function StatCard({ label, value, sub, positive, icon }: StatCardProps) {
  const gainColor =
    positive === true
      ? tokens.color.success
      : positive === false
        ? tokens.color.danger
        : tokens.color.textSecondary;

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        backgroundColor: tokens.color.bgBase,
        border: `1px solid ${tokens.color.border}`,
        borderRadius: tokens.radius.lg,
        p: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="caption" sx={{ color: tokens.color.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Box sx={{ color: tokens.color.textMuted, display: 'flex' }}>{icon}</Box>
      </Box>
      <Typography
        sx={{
          fontFamily: tokens.font.mono,
          fontSize: tokens.fontSize['2xl'],
          fontWeight: 500,
          color: positive !== undefined && positive !== null ? gainColor : tokens.color.textPrimary,
          lineHeight: 1,
          mb: sub ? 0.75 : 0,
        }}
      >
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: gainColor, display: 'flex', alignItems: 'center', gap: 0.25, mt: 0.5 }}>
          {positive === true && <TrendingUpIcon sx={{ fontSize: '0.9rem' }} />}
          {positive === false && <TrendingDownIcon sx={{ fontSize: '0.9rem' }} />}
          {sub}
        </Typography>
      )}
    </Box>
  );
}

interface Props {
  summary: PortfolioSummaryType | undefined;
  isLoading: boolean;
}

export function PortfolioSummary({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ flex: 1, minWidth: 180 }}>
            <Skeleton variant="rounded" height={112} sx={{ borderRadius: tokens.radius.lg }} />
          </Box>
        ))}
      </Box>
    );
  }

  if (!summary) return null;

  const isPositive = summary.totalGainLoss >= 0;

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <StatCard
        label="Total Invested"
        value={formatCurrency(summary.totalPurchaseValue, 'IDR')}
        icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
      />
      <StatCard
        label="Current Value"
        value={formatCurrency(summary.totalCurrentValue, 'IDR')}
        icon={<ShowChartOutlinedIcon fontSize="small" />}
      />
      <StatCard
        label="Gain / Loss"
        value={formatCurrency(summary.totalGainLoss, 'IDR')}
        positive={isPositive}
        icon={isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
      />
      <StatCard
        label="Return"
        value={formatPercent(summary.gainLossPercent)}
        positive={isPositive}
        icon={isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
      />
    </Box>
  );
}
