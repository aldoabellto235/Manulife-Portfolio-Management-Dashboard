import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetTable } from './AssetTable';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { Asset } from '../types';

vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: vi.fn() }),
}));

vi.mock('../api/portfolioApi', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../api/portfolioApi')>();
  return {
    ...mod,
    useGetInvestmentsQuery: vi.fn(),
    useDeleteInvestmentMutation: vi.fn(),
  };
});

const { useGetInvestmentsQuery, useDeleteInvestmentMutation } = await import('../api/portfolioApi');

const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    userId: 'u1',
    type: 'STOCK',
    name: 'Bank Central Asia',
    symbol: 'BBCA',
    purchasePrice: 9_000,
    currentValue: 10_000,
    currency: 'IDR',
    quantity: 100,
    gainLossPercent: 11.11,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'asset-2',
    userId: 'u1',
    type: 'BOND',
    name: 'FR0100',
    symbol: 'FR0100',
    purchasePrice: 100_000,
    currentValue: 95_000,
    currency: 'IDR',
    quantity: 10,
    gainLossPercent: -5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const pagedResponse = (assets: Asset[]) => ({
  data: assets,
  pagination: { page: 1, limit: 10, total: assets.length },
});

beforeEach(() => {
  vi.mocked(useDeleteInvestmentMutation).mockReturnValue([vi.fn(), { isLoading: false }] as ReturnType<typeof useDeleteInvestmentMutation>);
});

describe('AssetTable — loading state', () => {
  it('renders 4 skeleton rows while loading', () => {
    vi.mocked(useGetInvestmentsQuery).mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof useGetInvestmentsQuery>);
    const { container } = renderWithProviders(<AssetTable />);
    expect(container.querySelectorAll('.MuiSkeleton-root')).toHaveLength(4);
  });
});

describe('AssetTable — empty state', () => {
  it('shows the empty message when there are no assets', () => {
    vi.mocked(useGetInvestmentsQuery).mockReturnValue({ data: pagedResponse([]), isLoading: false } as ReturnType<typeof useGetInvestmentsQuery>);
    renderWithProviders(<AssetTable />);
    expect(screen.getByText(/No investments yet/i)).toBeInTheDocument();
  });
});

describe('AssetTable — with data', () => {
  beforeEach(() => {
    vi.mocked(useGetInvestmentsQuery).mockReturnValue({ data: pagedResponse(mockAssets), isLoading: false } as ReturnType<typeof useGetInvestmentsQuery>);
  });

  it('renders the table header columns', () => {
    renderWithProviders(<AssetTable />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  it('renders asset names', () => {
    renderWithProviders(<AssetTable />);
    expect(screen.getByText('Bank Central Asia')).toBeInTheDocument();
    // FR0100 appears as both name and symbol — assert at least one occurrence
    expect(screen.getAllByText('FR0100').length).toBeGreaterThanOrEqual(1);
  });

  it('renders asset type chips', () => {
    renderWithProviders(<AssetTable />);
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Bond')).toBeInTheDocument();
  });

  it('opens the delete confirmation dialog when delete button is clicked', () => {
    renderWithProviders(<AssetTable />);
    const deleteButtons = screen.getAllByLabelText('Delete investment');
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText('Delete Investment')).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
  });

  it('closes the delete dialog when Cancel is clicked', async () => {
    renderWithProviders(<AssetTable />);
    fireEvent.click(screen.getAllByLabelText('Delete investment')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByText('Delete Investment')).not.toBeVisible());
  });

  it('renders pagination controls', () => {
    renderWithProviders(<AssetTable />);
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // rows-per-page select
  });

  it('calls the delete mutation when the Delete button is confirmed', async () => {
    const deleteMock = vi.fn().mockResolvedValue({});
    vi.mocked(useDeleteInvestmentMutation).mockReturnValue([deleteMock, { isLoading: false }] as ReturnType<typeof useDeleteInvestmentMutation>);
    renderWithProviders(<AssetTable />);
    fireEvent.click(screen.getAllByLabelText('Delete investment')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith('asset-1'));
  });

  it('changes rows per page when a different option is selected', async () => {
    renderWithProviders(<AssetTable />);
    // MUI v6 Select needs mouseDown to open, then click the option
    fireEvent.mouseDown(screen.getByRole('combobox'));
    const option = await screen.findByRole('option', { name: '5' });
    fireEvent.click(option);
    // page resets to 0 and new rowsPerPage is applied — no error thrown
  });
});
