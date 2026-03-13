import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';
import { AppLayout } from '@/layout/AppLayout';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionForm } from '../components/TransactionForm';
import { useAddTransactionMutation } from '../api/transactionsApi';
import type { TransactionFormData } from '../types';
import { tokens } from '@/shared/theme/tokens';

export function TransactionsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [addTransaction, { isLoading }] = useAddTransactionMutation();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      await addTransaction(data).unwrap();
      enqueueSnackbar('Transaction recorded successfully.', { variant: 'success' });
      setFormOpen(false);
    } catch {
      enqueueSnackbar('Failed to record transaction. Please try again.', { variant: 'error' });
    }
  };

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
            Transactions
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
            History of all buy and sell events across your portfolio.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
          onClick={() => setFormOpen(true)}
          sx={{ height: 36 }}
        >
          Record Transaction
        </Button>
      </Box>

      {/* Table section */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ color: tokens.color.textMuted, mb: 1.5, letterSpacing: '0.06em' }}
        >
          History
        </Typography>
        <TransactionTable />
      </Box>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </AppLayout>
  );
}
