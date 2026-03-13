import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { InvestmentFormData, Asset, AssetType } from '../types';
import { tokens } from '@/shared/theme/tokens';

const schema = Joi.object<InvestmentFormData>({
  type: Joi.string().valid('STOCK', 'BOND', 'MUTUAL_FUND').required().messages({
    'any.only': 'Select an asset type',
    'string.empty': 'Type is required',
  }),
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Name is required',
  }),
  symbol: Joi.string().min(1).max(20).required().messages({
    'string.empty': 'Symbol is required',
  }),
  purchasePrice: Joi.number().positive().required().messages({
    'number.base': 'Enter a valid price',
    'number.positive': 'Must be greater than 0',
  }),
  currentValue: Joi.number().positive().required().messages({
    'number.base': 'Enter a valid value',
    'number.positive': 'Must be greater than 0',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Enter a valid quantity',
    'number.integer': 'Must be a whole number',
    'number.min': 'Must be at least 1',
  }),
  currency: Joi.string().default('IDR'),
});

const ASSET_TYPES: { value: AssetType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'STOCK',
    label: 'Stock',
    description: 'Equity shares',
    icon: <ShowChartIcon fontSize="small" />,
  },
  {
    value: 'BOND',
    label: 'Bond',
    description: 'Fixed income',
    icon: <AccountBalanceIcon fontSize="small" />,
  },
  {
    value: 'MUTUAL_FUND',
    label: 'Mutual Fund',
    description: 'Pooled fund',
    icon: <PieChartOutlineIcon fontSize="small" />,
  },
];

interface Props {
  initialData?: Asset;
  onSubmit: (data: InvestmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  isEdit?: boolean;
}

export function InvestmentForm({ initialData, onSubmit, onCancel, isLoading, isEdit = false }: Props) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: joiResolver(schema),
    defaultValues: { currency: 'IDR' },
  });

  const purchasePrice = useWatch({ control, name: 'purchasePrice' });
  const currentValue = useWatch({ control, name: 'currentValue' });
  const quantity = useWatch({ control, name: 'quantity' });

  const totalCost = (purchasePrice || 0) * (quantity || 0);
  const totalCurrent = (currentValue || 0) * (quantity || 0);
  const gainLoss = totalCurrent - totalCost;
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
  const isPositive = gainLoss >= 0;
  const hasPreview = totalCost > 0 || totalCurrent > 0;

  useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type,
        name: initialData.name,
        symbol: initialData.symbol,
        purchasePrice: initialData.purchasePrice,
        currentValue: initialData.currentValue,
        quantity: initialData.quantity,
        currency: initialData.currency,
      });
    }
  }, [initialData, reset]);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>

      {/* ── Section: Asset Type ── */}
      {!isEdit && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="overline" sx={{ color: tokens.color.textMuted, mb: 1.5, display: 'block' }}>
            Asset Type
          </Typography>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {ASSET_TYPES.map((opt) => {
                  const selected = field.value === opt.value;
                  return (
                    <Box
                      key={opt.value}
                      onClick={() => field.onChange(opt.value)}
                      sx={{
                        flex: 1,
                        cursor: 'pointer',
                        border: `1.5px solid ${selected ? tokens.color.primary : tokens.color.border}`,
                        borderRadius: tokens.radius.lg,
                        p: 2,
                        backgroundColor: selected ? tokens.color.primaryMuted : tokens.color.bgBase,
                        transition: `all ${tokens.transition.fast}`,
                        '&:hover': {
                          borderColor: tokens.color.primary,
                          backgroundColor: tokens.color.primaryMuted,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          color: selected ? tokens.color.primary : tokens.color.textMuted,
                          mb: 0.75,
                          display: 'flex',
                        }}
                      >
                        {opt.icon}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: selected ? 600 : 400,
                          color: selected ? tokens.color.primary : tokens.color.textPrimary,
                          lineHeight: 1.2,
                          mb: 0.25,
                        }}
                      >
                        {opt.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: tokens.color.textMuted }}>
                        {opt.description}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          />
          {errors.type && (
            <Typography variant="caption" sx={{ color: 'error.main', mt: 0.75, display: 'block' }}>
              {errors.type.message}
            </Typography>
          )}
        </Box>
      )}

      {/* ── Section: Asset Info ── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: tokens.color.textMuted, mb: 1.5, display: 'block' }}>
          Asset Details
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              {...register('symbol')}
              label="Ticker Symbol"
              placeholder="e.g. BBCA"
              error={Boolean(errors.symbol)}
              helperText={errors.symbol?.message}
              disabled={isEdit}
              sx={{ width: 160, flexShrink: 0 }}
              slotProps={{
                input: { style: { fontFamily: tokens.font.mono, textTransform: 'uppercase' } },
              }}
            />
            <TextField
              {...register('name')}
              label="Company / Fund Name"
              placeholder="e.g. Bank Central Asia"
              fullWidth
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              disabled={isEdit}
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* ── Section: Pricing ── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: tokens.color.textMuted, mb: 1.5, display: 'block' }}>
          Pricing & Quantity
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              {...register('purchasePrice', { valueAsNumber: true })}
              label="Purchase Price"
              type="number"
              fullWidth
              error={Boolean(errors.purchasePrice)}
              helperText={errors.purchasePrice?.message ?? 'Price per unit at time of purchase'}
              disabled={isEdit}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">
                    <Typography variant="caption" sx={{ color: tokens.color.textMuted, fontFamily: tokens.font.mono }}>IDR</Typography>
                  </InputAdornment>,
                  inputProps: { min: 0, step: 'any' },
                  style: { fontFamily: tokens.font.mono },
                },
              }}
            />
            <TextField
              {...register('currentValue', { valueAsNumber: true })}
              label="Current Value"
              type="number"
              fullWidth
              error={Boolean(errors.currentValue)}
              helperText={errors.currentValue?.message ?? 'Price per unit today'}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">
                    <Typography variant="caption" sx={{ color: tokens.color.textMuted, fontFamily: tokens.font.mono }}>IDR</Typography>
                  </InputAdornment>,
                  inputProps: { min: 0, step: 'any' },
                  style: { fontFamily: tokens.font.mono },
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              {...register('quantity', { valueAsNumber: true })}
              label="Quantity"
              type="number"
              error={Boolean(errors.quantity)}
              helperText={errors.quantity?.message ?? 'Number of units held'}
              sx={{ width: 160, flexShrink: 0 }}
              slotProps={{
                input: { inputProps: { min: 1, step: 1 }, style: { fontFamily: tokens.font.mono } },
              }}
            />
            <TextField
              {...register('currency')}
              label="Currency"
              error={Boolean(errors.currency)}
              helperText={errors.currency?.message}
              sx={{ width: 120, flexShrink: 0 }}
              slotProps={{ input: { style: { fontFamily: tokens.font.mono } } }}
            />
          </Box>
        </Box>
      </Box>

      {/* ── Live Preview ── */}
      {hasPreview && (
        <Box
          sx={{
            backgroundColor: tokens.color.bgSurface,
            border: `1px solid ${tokens.color.border}`,
            borderRadius: tokens.radius.lg,
            p: 2.5,
            mb: 4,
            display: 'flex',
            gap: 0,
          }}
        >
          {[
            { label: 'Total Cost', value: formatIDR(totalCost) },
            { label: 'Current Worth', value: formatIDR(totalCurrent) },
            {
              label: 'Gain / Loss',
              value: formatIDR(gainLoss),
              color: isPositive ? tokens.color.success : tokens.color.danger,
              icon: isPositive
                ? <TrendingUpIcon sx={{ fontSize: '0.85rem' }} />
                : <TrendingDownIcon sx={{ fontSize: '0.85rem' }} />,
            },
            {
              label: 'Return',
              value: `${isPositive ? '+' : ''}${gainLossPercent.toFixed(2)}%`,
              color: isPositive ? tokens.color.success : tokens.color.danger,
            },
          ].map((item, i, arr) => (
            <Box
              key={item.label}
              sx={{
                flex: 1,
                px: 2,
                borderRight: i < arr.length - 1 ? `1px solid ${tokens.color.border}` : 'none',
              }}
            >
              <Typography variant="caption" sx={{ color: tokens.color.textMuted, display: 'block', mb: 0.5 }}>
                {item.label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {item.icon && <Box sx={{ color: item.color }}>{item.icon}</Box>}
                <Typography
                  sx={{
                    fontFamily: tokens.font.mono,
                    fontSize: tokens.fontSize.sm,
                    fontWeight: 500,
                    color: item.color ?? tokens.color.textPrimary,
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Actions ── */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isLoading} sx={{ height: 40, px: 3 }}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ height: 40, px: 3, minWidth: 140 }}
        >
          {isLoading ? (
            <CircularProgress size={18} sx={{ color: tokens.color.textInverse }} />
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Add Investment'
          )}
        </Button>
      </Box>
    </Box>
  );
}
