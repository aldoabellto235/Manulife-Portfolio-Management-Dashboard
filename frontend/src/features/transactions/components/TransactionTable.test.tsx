import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionTable } from './TransactionTable';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { Transaction } from '../types';

vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: vi.fn() }),
}));

vi.mock('../api/transactionsApi', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../api/transactionsApi')>();
  return {
    ...mod,
    useGetTransactionsQuery: vi.fn(),
    useDeleteTransactionMutation: vi.fn(),
  };
});

vi.mock('@/features/portfolio/api/portfolioApi', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/portfolio/api/portfolioApi')>();
  return {
    ...mod,
    useGetInvestmentsQuery: vi.fn(),
  };
});

const { useGetTransactionsQuery, useDeleteTransactionMutation } = await import('../api/transactionsApi');
const { useGetInvestmentsQuery } = await import('@/features/portfolio/api/portfolioApi');

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'u1',
    assetId: 'asset-1',
    type: 'BUY',
    quantity: 50,
    price: 9_500,
    currency: 'IDR',
    totalValue: 475_000,
    date: '2024-06-01T00:00:00Z',
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'tx-2',
    userId: 'u1',
    assetId: 'asset-2',
    type: 'SELL',
    quantity: 10,
    price: 95_000,
    currency: 'IDR',
    totalValue: 950_000,
    date: '2024-06-15T00:00:00Z',
    createdAt: '2024-06-15T00:00:00Z',
  },
];

const pagedResponse = (txs: Transaction[]) => ({
  data: txs,
  pagination: { page: 1, limit: 10, total: txs.length },
});

const investmentsResponse = {
  data: [{ id: 'asset-1', name: 'Bank Central Asia', symbol: 'BBCA' }],
  pagination: { page: 1, limit: 100, total: 1 },
};

beforeEach(() => {
  vi.mocked(useGetInvestmentsQuery).mockReturnValue({ data: investmentsResponse, isLoading: false } as ReturnType<typeof useGetInvestmentsQuery>);
  vi.mocked(useDeleteTransactionMutation).mockReturnValue([vi.fn(), { isLoading: false }] as ReturnType<typeof useDeleteTransactionMutation>);
});

describe('TransactionTable — loading state', () => {
  it('renders 5 skeleton rows while loading', () => {
    vi.mocked(useGetTransactionsQuery).mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof useGetTransactionsQuery>);
    const { container } = renderWithProviders(<TransactionTable />);
    expect(container.querySelectorAll('.MuiSkeleton-root')).toHaveLength(5);
  });
});

describe('TransactionTable — empty state', () => {
  it('shows the empty state message when there are no transactions', () => {
    vi.mocked(useGetTransactionsQuery).mockReturnValue({ data: pagedResponse([]), isLoading: false } as ReturnType<typeof useGetTransactionsQuery>);
    renderWithProviders(<TransactionTable />);
    expect(screen.getByText(/No transactions recorded yet/i)).toBeInTheDocument();
  });

  it('shows the hint text in empty state', () => {
    vi.mocked(useGetTransactionsQuery).mockReturnValue({ data: pagedResponse([]), isLoading: false } as ReturnType<typeof useGetTransactionsQuery>);
    renderWithProviders(<TransactionTable />);
    expect(screen.getByText(/Record Transaction/i)).toBeInTheDocument();
  });
});

describe('TransactionTable — with data', () => {
  beforeEach(() => {
    vi.mocked(useGetTransactionsQuery).mockReturnValue({ data: pagedResponse(mockTransactions), isLoading: false } as ReturnType<typeof useGetTransactionsQuery>);
  });

  it('renders BUY badge for buy transactions', () => {
    renderWithProviders(<TransactionTable />);
    expect(screen.getByText('BUY')).toBeInTheDocument();
  });

  it('renders SELL badge for sell transactions', () => {
    renderWithProviders(<TransactionTable />);
    expect(screen.getByText('SELL')).toBeInTheDocument();
  });

  it('renders the resolved asset name for a known assetId', () => {
    renderWithProviders(<TransactionTable />);
    expect(screen.getByText('Bank Central Asia')).toBeInTheDocument();
  });

  it('renders a truncated ID for an unknown assetId', () => {
    renderWithProviders(<TransactionTable />);
    // asset-2 is not in investmentsResponse, so it falls back to truncated assetId
    expect(screen.getByText(/asset-2/)).toBeInTheDocument();
  });

  it('opens the delete confirmation dialog when delete is clicked', () => {
    renderWithProviders(<TransactionTable />);
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    // find icon buttons (no accessible label) – use the first delete icon button
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText('Delete Transaction?')).toBeInTheDocument();
  });

  it('closes the delete dialog when Cancel is clicked', async () => {
    renderWithProviders(<TransactionTable />);
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByText('Delete Transaction?')).not.toBeVisible());
  });

  it('calls the delete mutation when the Delete button is confirmed', async () => {
    const deleteMock = vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({}) }));
    vi.mocked(useDeleteTransactionMutation).mockReturnValue([deleteMock, { isLoading: false }] as ReturnType<typeof useDeleteTransactionMutation>);
    renderWithProviders(<TransactionTable />);
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(deleteMock).toHaveBeenCalled());
  });

  it('changes rows per page when a different option is selected', async () => {
    renderWithProviders(<TransactionTable />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    const option = await screen.findByRole('option', { name: '20' });
    fireEvent.click(option);
    // page resets to 0 — no error thrown
  });
});
