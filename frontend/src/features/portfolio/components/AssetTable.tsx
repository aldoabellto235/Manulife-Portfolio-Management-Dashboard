import { useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useGetInvestmentsQuery, useDeleteInvestmentMutation } from '../api/portfolioApi';
import { formatCurrency, formatPercent } from '@/shared/utils/formatCurrency';
import { tokens } from '@/shared/theme/tokens';

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

const TYPE_LABELS: Record<string, string> = {
  STOCK: 'Stock',
  BOND: 'Bond',
  MUTUAL_FUND: 'Mutual Fund',
};

const TYPE_COLORS: Record<string, 'default' | 'primary' | 'secondary'> = {
  STOCK: 'primary',
  BOND: 'secondary',
  MUTUAL_FUND: 'default',
};

export function AssetTable() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteInvestment, { isLoading: isDeleting }] = useDeleteInvestmentMutation();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = useGetInvestmentsQuery({
    page: page + 1,
    limit: rowsPerPage,
  });

  const assets = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteInvestment(deleteId);
    setDeleteId(null);
    enqueueSnackbar('Investment deleted.', { variant: 'success' });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          border: `1px solid ${tokens.color.border}`,
          borderRadius: tokens.radius.lg,
          overflow: 'hidden',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: '1px' }} />
        ))}
      </Box>
    );
  }

  if (assets.length === 0) {
    return (
      <Box
        sx={{
          border: `1px solid ${tokens.color.border}`,
          borderRadius: tokens.radius.lg,
          p: 6,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ color: tokens.color.textMuted }}>
          No investments yet. Add your first investment to get started.
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
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Purchase Price</TableCell>
              <TableCell align="right">Current Value</TableCell>
              <TableCell align="right">Gain / Loss</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => {
              const isPositive = asset.gainLossPercent >= 0;
              const gainColor = isPositive ? tokens.color.success : tokens.color.danger;
              const gainBg = isPositive ? tokens.color.successMuted : tokens.color.dangerMuted;

              return (
                <TableRow key={asset.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {asset.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{ fontFamily: tokens.font.mono, fontSize: tokens.fontSize.sm }}
                    >
                      {asset.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={TYPE_LABELS[asset.type] ?? asset.type}
                      color={TYPE_COLORS[asset.type] ?? 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{ fontFamily: tokens.font.mono, fontSize: tokens.fontSize.sm }}
                    >
                      {asset.quantity.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{ fontFamily: tokens.font.mono, fontSize: tokens.fontSize.sm }}
                    >
                      {formatCurrency(asset.purchasePrice, asset.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{ fontFamily: tokens.font.mono, fontSize: tokens.fontSize.sm }}
                    >
                      {formatCurrency(asset.currentValue, asset.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: 'inline-flex',
                        px: 1,
                        py: 0.25,
                        borderRadius: tokens.radius.sm,
                        backgroundColor: gainBg,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: tokens.font.mono,
                          fontSize: tokens.fontSize.xs,
                          fontWeight: 500,
                          color: gainColor,
                        }}
                      >
                        {formatPercent(asset.gainLossPercent)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/investments/${asset.id}/edit`)}
                        aria-label="Edit investment"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteId(asset.id)}
                        aria-label="Delete investment"
                        sx={{ color: tokens.color.danger }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
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

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: tokens.font.body, fontWeight: 600 }}>
          Delete Investment
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this investment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" size="small">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            size="small"
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
