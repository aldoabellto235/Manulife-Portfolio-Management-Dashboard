import { useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useSnackbar } from 'notistack';
import { useGetTransactionsQuery, useDeleteTransactionMutation } from '../api/transactionsApi';
import { useGetInvestmentsQuery } from '@/features/portfolio/api/portfolioApi';
import { tokens } from '@/shared/theme/tokens';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

const COLUMNS = ['Date', 'Type', 'Asset', 'Qty', 'Price / Unit', 'Total Value', ''] as const;

export function TransactionTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = useGetTransactionsQuery({ page: page + 1, limit: rowsPerPage });
  const { data: investmentsData } = useGetInvestmentsQuery({ limit: 100 });
  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation();
  const { enqueueSnackbar } = useSnackbar();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const transactions = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const assetMap = new Map(
    (investmentsData?.data ?? []).map((a) => [a.id, { name: a.name, symbol: a.symbol }])
  );

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteTransaction(confirmId).unwrap();
      enqueueSnackbar('Transaction deleted.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete transaction.', { variant: 'error' });
    } finally {
      setConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={48}
            sx={{ borderRadius: tokens.radius.sm }}
          />
        ))}
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
          border: `1px dashed ${tokens.color.border}`,
          borderRadius: tokens.radius.lg,
        }}
      >
        <Typography sx={{ color: tokens.color.textMuted, fontSize: tokens.fontSize.sm }}>
          No transactions recorded yet.
        </Typography>
        <Typography
          sx={{ color: tokens.color.textDisabled, fontSize: tokens.fontSize.xs, mt: 0.5 }}
        >
          Use "Record Transaction" to log a buy or sell.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer
        sx={{
          border: `1px solid ${tokens.color.border}`,
          borderRadius: tokens.radius.lg,
          backgroundColor: tokens.color.bgBase,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: tokens.color.bgSubtle }}>
              {COLUMNS.map((col) => {
                const isNumeric = col === 'Qty' || col === 'Price / Unit' || col === 'Total Value';
                return (
                  <TableCell
                    key={col}
                    align={isNumeric ? 'right' : 'left'}
                    sx={{
                      fontSize: tokens.fontSize.xs,
                      fontWeight: 600,
                      color: tokens.color.textMuted,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      borderBottom: `1px solid ${tokens.color.border}`,
                      py: 1.5,
                      px: 2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => {
              const isBuy = tx.type === 'BUY';
              const asset = assetMap.get(tx.assetId);

              return (
                <TableRow
                  key={tx.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: tokens.color.bgSubtle },
                    transition: `background-color ${tokens.transition.fast}`,
                  }}
                >
                  {/* Date */}
                  <TableCell
                    sx={{
                      px: 2,
                      fontSize: tokens.fontSize.sm,
                      fontFamily: tokens.font.mono,
                      color: tokens.color.textSecondary,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDate(tx.date)}
                  </TableCell>

                  {/* Type badge */}
                  <TableCell sx={{ px: 2 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1,
                        py: 0.25,
                        borderRadius: tokens.radius.sm,
                        backgroundColor: isBuy ? tokens.color.successMuted : tokens.color.dangerMuted,
                        border: `1px solid ${isBuy ? tokens.color.success : tokens.color.danger}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: tokens.fontSize.xs,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          color: isBuy ? tokens.color.success : tokens.color.danger,
                          fontFamily: tokens.font.mono,
                        }}
                      >
                        {tx.type}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Asset name + symbol */}
                  <TableCell sx={{ px: 2 }}>
                    {asset ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: tokens.fontSize.sm, color: tokens.color.textPrimary }}>
                          {asset.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: tokens.fontSize.xs,
                            fontFamily: tokens.font.mono,
                            color: tokens.color.textMuted,
                          }}
                        >
                          {asset.symbol}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          fontSize: tokens.fontSize.xs,
                          fontFamily: tokens.font.mono,
                          color: tokens.color.textMuted,
                        }}
                        title={tx.assetId}
                      >
                        {tx.assetId.slice(0, 8)}…
                      </Typography>
                    )}
                  </TableCell>

                  {/* Quantity */}
                  <TableCell
                    align="right"
                    sx={{ px: 2, fontFamily: tokens.font.mono, fontSize: tokens.fontSize.sm }}
                  >
                    {tx.quantity.toLocaleString()}
                  </TableCell>

                  {/* Price per unit */}
                  <TableCell
                    align="right"
                    sx={{ px: 2, fontFamily: tokens.font.mono, fontSize: tokens.fontSize.sm }}
                  >
                    {formatCurrency(tx.price)}
                  </TableCell>

                  {/* Total value */}
                  <TableCell
                    align="right"
                    sx={{
                      px: 2,
                      fontFamily: tokens.font.mono,
                      fontSize: tokens.fontSize.sm,
                      fontWeight: 500,
                      color: isBuy ? tokens.color.success : tokens.color.danger,
                    }}
                  >
                    {isBuy ? '+' : '−'}{formatCurrency(tx.totalValue)}
                  </TableCell>

                  {/* Delete action */}
                  <TableCell align="right" sx={{ px: 2, width: 48 }}>
                    <IconButton
                      size="small"
                      onClick={() => setConfirmId(tx.id)}
                      sx={{
                        color: tokens.color.textMuted,
                        '&:hover': {
                          color: tokens.color.danger,
                          backgroundColor: tokens.color.dangerMuted,
                        },
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${tokens.color.border}`,
            fontSize: tokens.fontSize.sm,
            '.MuiTablePagination-toolbar': { minHeight: 48 },
          }}
        />
      </TableContainer>

      {/* Confirm delete dialog */}
      <Dialog
        open={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontFamily: tokens.font.body }}>
          Delete Transaction?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: tokens.fontSize.sm }}>
            This will permanently remove the transaction record. Note: deleting a transaction does
            not automatically reverse the investment position.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setConfirmId(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleDelete}
            disabled={isDeleting}
            sx={{
              backgroundColor: tokens.color.danger,
              '&:hover': { backgroundColor: '#b91c1c' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
