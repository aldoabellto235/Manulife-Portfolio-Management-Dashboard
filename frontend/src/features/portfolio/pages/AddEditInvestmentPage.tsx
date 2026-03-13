import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AppLayout } from '@/layout/AppLayout';
import { InvestmentForm } from '../components/InvestmentForm';
import {
  useAddInvestmentMutation,
  useUpdateInvestmentMutation,
  useGetInvestmentsQuery,
} from '../api/portfolioApi';
import type { InvestmentFormData } from '../types';
import { tokens } from '@/shared/theme/tokens';
import { useState } from 'react';
import { useSnackbar } from 'notistack';

export function AddEditInvestmentPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const { data: investmentsData, isLoading: isFetching } = useGetInvestmentsQuery(
    {},
    { skip: !isEdit }
  );

  const existing = isEdit
    ? investmentsData?.data.datas.find((a) => a.id === id)
    : undefined;

  const [addInvestment, { isLoading: isAdding }] = useAddInvestmentMutation();
  const [updateInvestment, { isLoading: isUpdating }] = useUpdateInvestmentMutation();

  const handleSubmit = async (data: InvestmentFormData) => {
    setApiError(null);
    try {
      if (isEdit && id) {
        await updateInvestment({
          id,
          body: { currentValue: data.currentValue, quantity: data.quantity },
        }).unwrap();
        enqueueSnackbar('Investment updated successfully.', { variant: 'success' });
      } else {
        await addInvestment(data).unwrap();
        enqueueSnackbar('Investment added successfully.', { variant: 'success' });
      }
      navigate('/');
    } catch {
      setApiError('Failed to save investment. Please try again.');
    }
  };

  return (
    <AppLayout>
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Button
            variant="text"
            size="small"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => navigate('/')}
            sx={{ color: tokens.color.textSecondary, minWidth: 0, px: 1 }}
          >
            Back
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {isEdit ? 'Edit Investment' : 'Add Investment'}
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
          {apiError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {apiError}
            </Alert>
          )}

          {isEdit && isFetching ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rounded" height={56} />
              ))}
            </Box>
          ) : (
            <InvestmentForm
              initialData={existing}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/')}
              isLoading={isAdding || isUpdating}
              isEdit={isEdit}
            />
          )}
        </Box>
      </Box>
    </AppLayout>
  );
}
