import { injectable } from 'tsyringe';
import { Asset } from '../entities/asset.entity';

export interface PortfolioSummary {
  totalPurchaseValue: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  gainLossPercent: number;
}

@injectable()
export class PerformanceCalculatorService {
  calculate(assets: Asset[]): PortfolioSummary {
    if (assets.length === 0) {
      return { totalPurchaseValue: 0, totalCurrentValue: 0, totalGainLoss: 0, gainLossPercent: 0 };
    }

    const totalPurchaseValue = assets.reduce(
      (sum, a) => sum + a.purchasePrice.amount * a.quantity, 0,
    );
    const totalCurrentValue = assets.reduce(
      (sum, a) => sum + a.currentValue.amount * a.quantity, 0,
    );
    const totalGainLoss = totalCurrentValue - totalPurchaseValue;
    const gainLossPercent = totalPurchaseValue === 0
      ? 0
      : (totalGainLoss / totalPurchaseValue) * 100;

    return { totalPurchaseValue, totalCurrentValue, totalGainLoss, gainLossPercent };
  }
}
