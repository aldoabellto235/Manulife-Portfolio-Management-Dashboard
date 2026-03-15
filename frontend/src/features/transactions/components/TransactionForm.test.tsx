import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { TransactionForm } from './TransactionForm';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/features/portfolio/api/portfolioApi', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/portfolio/api/portfolioApi')>();
  return {
    ...mod,
    useGetInvestmentsQuery: vi.fn(),
  };
});

const { useGetInvestmentsQuery } = await import('@/features/portfolio/api/portfolioApi');

const mockAssets = [
  { id: 'asset-1', name: 'Bank Central Asia', symbol: 'BBCA', type: 'STOCK' as const, purchasePrice: 9000, currentValue: 10000, currency: 'IDR', quantity: 100, gainLossPercent: 11, userId: 'u1', createdAt: '', updatedAt: '' },
];

const noop = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.mocked(useGetInvestmentsQuery).mockReturnValue({
    data: { data: mockAssets, pagination: { page: 1, limit: 100, total: 1 } },
    isLoading: false,
  } as ReturnType<typeof useGetInvestmentsQuery>);
});

describe('TransactionForm — visibility', () => {
  it('renders the dialog title when open', () => {
    renderWithProviders(<TransactionForm open onClose={vi.fn()} onSubmit={noop} isLoading={false} />);
    expect(screen.getByText('Record Transaction')).toBeInTheDocument();
  });

  it('does not show dialog content when closed', () => {
    renderWithProviders(<TransactionForm open={false} onClose={vi.fn()} onSubmit={noop} isLoading={false} />);
    expect(screen.queryByText('Record Transaction')).not.toBeInTheDocument();
  });
});

describe('TransactionForm — BUY/SELL toggle', () => {
  it('selects BUY by default', () => {
    renderWithProviders(<TransactionForm open onClose={vi.fn()} onSubmit={noop} isLoading={false} />);
    const buyCard = screen.getByText('BUY').closest('[role="button"]');
    expect(buyCard).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches to SELL when the SELL card is clicked', () => {
    renderWithProviders(<TransactionForm open onClose={vi.fn()} onSubmit={noop} isLoading={false} />);
    fireEvent.click(screen.getByText('SELL').closest('[role="button"]')!);
    const sellCard = screen.getByText('SELL').closest('[role="button"]');
    expect(sellCard).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows the "Record BUY" submit button by default', () => {
    renderWithProviders(<TransactionForm open onClose={vi.fn()} onSubmit={noop} isLoading={false} />);
    expect(screen.getByRole('button', { name: 'Record BUY' })).toBeInTheDocument();
  });

  it('changes submit button label to "Record SELL" after switching', () => {
    renderWithProviders(<TransactionForm open onClose={vi.fn()} onSubmit={noop} isLoading={false} />);
    fireEvent.click(screen.getByText('SELL').closest('[role="button"]')!);
    expect(screen.getByRole('button', { name: 'Record SELL' })).toBeInTheDocument();
  });
});

describe('TransactionForm — asset loading', () => {
  it('shows a skeleton while assets are loading', () => {
    vi.mocked(useGetInvestmentsQuery).mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof useGetInvestmentsQuery>);
    renderWithProviders(<TransactionForm open onClose={vi.fn()} onSubmit={noop} isLoading={false} />);
    // Dialog renders in a Portal — query against document.body
    expect(document.body.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
  });

  it('shows "No investments found" hint when asset list is empty', () => {
    vi.mocked(useGetInvestmentsQuery).mockReturnValue({
      data: { data: [], pagination: { page: 1, limit: 100, total: 0 } },
      isLoading: false,
    } as ReturnType<typeof useGetInvestmentsQuery>);
    renderWithProviders(<TransactionForm open onClose={vi.fn()} onSubmit={noop} isLoading={false} />);
    expect(screen.getByText(/No investments found/i)).toBeInTheDocument();
  });
});

describe('TransactionForm — total preview', () => {
  it('shows the estimated total when quantity and price are both entered', () => {
    renderWithProviders(<TransactionForm open onClose={vi.fn()} onSubmit={noop} isLoading={false} />);
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Buy Price'), { target: { value: '5000' } });
    expect(screen.getByText('Estimated Total')).toBeInTheDocument();
  });
});

describe('TransactionForm — loading state', () => {
  it('shows a spinner and disables submit when isLoading is true', () => {
    renderWithProviders(<TransactionForm open onClose={vi.fn()} onSubmit={noop} isLoading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

describe('TransactionForm — close behaviour', () => {
  it('calls onClose when the Cancel button is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(<TransactionForm open onClose={onClose} onSubmit={noop} isLoading={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
