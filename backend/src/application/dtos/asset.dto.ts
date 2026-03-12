import { Asset } from '../../domain/entities/asset.entity';

export interface AssetDTO {
  id: string;
  type: string;
  name: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
  gainLossPercent: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioDTO {
  assets: AssetDTO[];
  summary: {
    totalPurchaseValue: number;
    totalCurrentValue: number;
    totalGainLoss: number;
    gainLossPercent: number;
  };
}

export const toAssetDTO = (asset: Asset): AssetDTO => ({
  id: asset.id,
  type: asset.type,
  name: asset.name,
  symbol: asset.symbol,
  quantity: asset.quantity,
  purchasePrice: asset.purchasePrice.amount,
  currentValue: asset.currentValue.amount,
  gainLossPercent: parseFloat(asset.gainLossPercent().toFixed(2)),
  currency: asset.currentValue.currency,
  createdAt: asset.createdAt.toISOString(),
  updatedAt: asset.updatedAt.toISOString(),
});
