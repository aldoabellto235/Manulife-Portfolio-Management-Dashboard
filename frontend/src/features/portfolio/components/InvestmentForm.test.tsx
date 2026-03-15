import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InvestmentForm } from './InvestmentForm';
import type { Asset } from '../types';

const noop = vi.fn();

const mockAsset: Asset = {
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
};

describe('InvestmentForm — add mode', () => {
  it('renders the "Add Investment" submit button', () => {
    render(<InvestmentForm onSubmit={noop} onCancel={noop} isLoading={false} />);
    expect(screen.getByRole('button', { name: 'Add Investment' })).toBeInTheDocument();
  });

  it('shows the asset type selector section', () => {
    render(<InvestmentForm onSubmit={noop} onCancel={noop} isLoading={false} />);
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Bond')).toBeInTheDocument();
    expect(screen.getByText('Mutual Fund')).toBeInTheDocument();
  });

  it('renders name and symbol fields', () => {
    render(<InvestmentForm onSubmit={noop} onCancel={noop} isLoading={false} />);
    expect(screen.getByLabelText(/Ticker Symbol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company \/ Fund Name/i)).toBeInTheDocument();
  });

  it('renders pricing fields', () => {
    render(<InvestmentForm onSubmit={noop} onCancel={noop} isLoading={false} />);
    expect(screen.getByLabelText(/Purchase Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
  });

  it('shows the live preview when purchase price, current value and quantity are entered', () => {
    render(<InvestmentForm onSubmit={noop} onCancel={noop} isLoading={false} />);
    fireEvent.change(screen.getByLabelText(/Purchase Price/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Current Value/i), { target: { value: '1200' } });
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '10' } });
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('Gain / Loss')).toBeInTheDocument();
  });

  it('calls onCancel when the Cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<InvestmentForm onSubmit={noop} onCancel={onCancel} isLoading={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

describe('InvestmentForm — edit mode', () => {
  it('renders the "Save Changes" submit button', () => {
    render(<InvestmentForm initialData={mockAsset} onSubmit={noop} onCancel={noop} isLoading={false} isEdit />);
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('hides the asset type selector in edit mode', () => {
    render(<InvestmentForm initialData={mockAsset} onSubmit={noop} onCancel={noop} isLoading={false} isEdit />);
    expect(screen.queryByText('Mutual Fund')).not.toBeInTheDocument();
  });

  it('pre-fills the form with initialData values', () => {
    render(<InvestmentForm initialData={mockAsset} onSubmit={noop} onCancel={noop} isLoading={false} isEdit />);
    expect(screen.getByDisplayValue('BBCA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bank Central Asia')).toBeInTheDocument();
  });
});

describe('InvestmentForm — loading state', () => {
  it('shows a loading spinner when isLoading is true', () => {
    render(<InvestmentForm onSubmit={noop} onCancel={noop} isLoading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('disables the Cancel button while loading', () => {
    render(<InvestmentForm onSubmit={noop} onCancel={noop} isLoading />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
