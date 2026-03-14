import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import type { TransactionFormData } from '../types';
import { useGetInvestmentsQuery } from '@/features/portfolio/api/portfolioApi';
import { tokens } from '@/shared/theme/tokens';
import { formatCurrency } from '@/shared/utils/formatCurrency';

const schema = Joi.object<TransactionFormData>({
  assetId: Joi.string().uuid().required().messages({
    'string.empty': 'Select an asset',
    'string.guid': 'Select a valid asset',
  }),
  type: Joi.string().valid('BUY', 'SELL').required().messages({
    'any.only': 'Select BUY or SELL',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Enter a valid quantity',
    'number.integer': 'Must be a whole number',
    'number.min': 'Must be at least 1',
  }),
  price: Joi.number().positive().required().messages({
    'number.base': 'Enter a valid price',
    'number.positive': 'Must be greater than 0',
  }),
  currency: Joi.string().default('IDR'),
  date: Joi.string().required().messages({
    'string.empty': 'Select a date',
  }),
});

const TODAY = new Date().toISOString().split('T')[0];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  isLoading: boolean;
}

export function TransactionForm({ open, onClose, onSubmit, isLoading }: Props) {
  const { data: investmentsData, isLoading: isLoadingAssets } = useGetInvestmentsQuery(
    { limit: 100 },
    { skip: !open },
  );
  const assets = investmentsData?.data ?? [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: joiResolver(schema),
    defaultValues: {
      type: 'BUY',
      currency: 'IDR',
      date: TODAY,
    },
  });

  // Reset form whenever dialog opens
  useEffect(() => {
    if (open) {
      reset({ type: 'BUY', currency: 'IDR', date: TODAY });
    }
  }, [open, reset]);

  const selectedType = watch('type');
  const quantity = watch('quantity');
  const price = watch('price');
  const isBuy = selectedType === 'BUY';

  const total = Number(quantity) > 0 && Number(price) > 0 ? Number(quantity) * Number(price) : null;

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontFamily: tokens.font.body, pb: 1 }}>
        Record Transaction
      </DialogTitle>

      <Divider />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* BUY / SELL toggle */}
          <Box>
            <Typography variant="overline" sx={{ color: tokens.color.textMuted, display: 'block', mb: 1 }}>
              Transaction Type
            </Typography>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(['BUY', 'SELL'] as const).map((t) => {
                    const selected = field.value === t;
                    const isBuyOpt = t === 'BUY';
                    const selectedColor = isBuyOpt ? tokens.color.success : tokens.color.danger;
                    const selectedBg = isBuyOpt ? tokens.color.successMuted : tokens.color.dangerMuted;
                    return (
                      <Box
                        key={t}
                        role="button"
                        tabIndex={0}
                        onClick={() => field.onChange(t)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && field.onChange(t)}
                        aria-pressed={selected}
                        sx={{
                          flex: 1,
                          py: 1.5,
                          textAlign: 'center',
                          cursor: 'pointer',
                          border: `1.5px solid ${selected ? selectedColor : tokens.color.border}`,
                          borderRadius: tokens.radius.md,
                          backgroundColor: selected ? selectedBg : tokens.color.bgBase,
                          transition: `all ${tokens.transition.fast}`,
                          outline: 'none',
                          '&:hover': {
                            borderColor: selectedColor,
                            backgroundColor: selectedBg,
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${selectedColor}`,
                            outlineOffset: '2px',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: tokens.fontSize.sm,
                            letterSpacing: '0.06em',
                            color: selected ? selectedColor : tokens.color.textSecondary,
                          }}
                        >
                          {t}
                        </Typography>
                        <Typography variant="caption" sx={{ color: selected ? selectedColor : tokens.color.textMuted }}>
                          {isBuyOpt ? 'Add to holding' : 'Reduce holding'}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            />
            {errors.type && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
                {errors.type.message}
              </Typography>
            )}
          </Box>

          {/* Asset selector */}
          <Controller
            name="assetId"
            control={control}
            render={({ field }) => (
              isLoadingAssets ? (
                <Skeleton variant="rounded" height={56} />
              ) : (
                <TextField
                  {...field}
                  select
                  label="Asset"
                  fullWidth
                  error={Boolean(errors.assetId)}
                  helperText={errors.assetId?.message ?? (assets.length === 0 ? 'No investments found. Add one first.' : undefined)}
                  disabled={assets.length === 0}
                  slotProps={{
                    select: {
                      renderValue: (value) => {
                        const asset = assets.find((a) => a.id === value);
                        if (!asset) return '';
                        return `${asset.name} (${asset.symbol})`;
                      },
                    },
                  }}
                >
                  {assets.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2">{a.name}</Typography>
                        <Typography sx={{ fontFamily: tokens.font.mono, fontSize: tokens.fontSize.xs, color: tokens.color.textMuted }}>
                          {a.symbol}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              )
            )}
          />

          {/* Quantity + Price */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              {...register('quantity', { valueAsNumber: true })}
              label="Quantity"
              type="number"
              fullWidth
              error={Boolean(errors.quantity)}
              helperText={errors.quantity?.message}
              slotProps={{
                input: {
                  inputProps: { min: 1, step: 1 },
                  style: { fontFamily: tokens.font.mono },
                },
              }}
            />
            <TextField
              {...register('price', { valueAsNumber: true })}
              label={isBuy ? 'Buy Price' : 'Sell Price'}
              type="number"
              fullWidth
              error={Boolean(errors.price)}
              helperText={errors.price?.message ?? 'Price per unit'}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="caption" sx={{ color: tokens.color.textMuted, fontFamily: tokens.font.mono }}>
                        IDR
                      </Typography>
                    </InputAdornment>
                  ),
                  inputProps: { min: 0, step: 'any' },
                  style: { fontFamily: tokens.font.mono },
                },
              }}
            />
          </Box>

          {/* Live total preview */}
          {total !== null && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.25,
                borderRadius: tokens.radius.md,
                backgroundColor: isBuy ? tokens.color.successMuted : tokens.color.dangerMuted,
                border: `1px solid ${isBuy ? tokens.color.success : tokens.color.danger}`,
              }}
            >
              <Typography sx={{ fontSize: tokens.fontSize.sm, color: tokens.color.textSecondary }}>
                Estimated Total
              </Typography>
              <Typography
                sx={{
                  fontFamily: tokens.font.mono,
                  fontWeight: 600,
                  fontSize: tokens.fontSize.sm,
                  color: isBuy ? tokens.color.success : tokens.color.danger,
                }}
              >
                {isBuy ? '+' : '−'}{formatCurrency(total)}
              </Typography>
            </Box>
          )}

          {/* Date */}
          <TextField
            {...register('date')}
            label="Transaction Date"
            type="date"
            fullWidth
            error={Boolean(errors.date)}
            helperText={errors.date?.message}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                inputProps: { max: TODAY },
                style: { fontFamily: tokens.font.mono },
              },
            }}
          />
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              minWidth: 160,
              backgroundColor: isBuy ? tokens.color.success : tokens.color.danger,
              '&:hover': {
                backgroundColor: isBuy ? '#15803d' : '#b91c1c',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={18} sx={{ color: '#fff' }} />
            ) : (
              `Record ${selectedType}`
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
