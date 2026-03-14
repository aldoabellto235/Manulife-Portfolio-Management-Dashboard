import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PortfolioSummary } from './PortfolioSummary';
import type { PortfolioSummary as PortfolioSummaryType } from '../types';

const positiveSummary: PortfolioSummaryType = {
  totalPurchaseValue: 10_000_000,
  totalCurrentValue: 12_500_000,
  totalGainLoss: 2_500_000,
  gainLossPercent: 25,
};

const negativeSummary: PortfolioSummaryType = {
  totalPurchaseValue: 10_000_000,
  totalCurrentValue: 8_000_000,
  totalGainLoss: -2_000_000,
  gainLossPercent: -20,
};

describe('PortfolioSummary — loading state', () => {
  it('renders 4 skeleton cards while loading', () => {
    const { container } = render(<PortfolioSummary summary={undefined} isLoading />);
    // MUI Skeleton renders with role="progressbar" or just as a div; check count via class
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(4);
  });

  it('does not render summary text while loading', () => {
    render(<PortfolioSummary summary={positiveSummary} isLoading />);
    expect(screen.queryByText('Total Invested')).not.toBeInTheDocument();
  });
});

describe('PortfolioSummary — no data', () => {
  it('renders nothing when summary is undefined and not loading', () => {
    const { container } = render(<PortfolioSummary summary={undefined} isLoading={false} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('PortfolioSummary — with data', () => {
  it('renders all four stat card labels', () => {
    render(<PortfolioSummary summary={positiveSummary} isLoading={false} />);
    expect(screen.getByText('Total Invested')).toBeInTheDocument();
    expect(screen.getByText('Current Value')).toBeInTheDocument();
    expect(screen.getByText('Gain / Loss')).toBeInTheDocument();
    expect(screen.getByText('Return')).toBeInTheDocument();
  });

  it('displays formatted currency values', () => {
    render(<PortfolioSummary summary={positiveSummary} isLoading={false} />);
    // IDR 10.000.000 formatted
    expect(screen.getAllByText(/10\.000\.000/).length).toBeGreaterThan(0);
  });

  it('displays positive return percent with + sign', () => {
    render(<PortfolioSummary summary={positiveSummary} isLoading={false} />);
    expect(screen.getByText('+25.00%')).toBeInTheDocument();
  });

  it('displays negative return percent with - sign', () => {
    render(<PortfolioSummary summary={negativeSummary} isLoading={false} />);
    expect(screen.getByText('-20.00%')).toBeInTheDocument();
  });
});
