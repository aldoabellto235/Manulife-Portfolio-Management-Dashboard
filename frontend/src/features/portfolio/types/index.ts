export type AssetType = 'STOCK' | 'BOND' | 'MUTUAL_FUND';

export interface Asset {
  id: string;
  userId: string;
  type: AssetType;
  name: string;
  symbol: string;
  purchasePrice: number;
  currentValue: number;
  currency: string;
  quantity: number;
  gainLossPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSummary {
  totalPurchaseValue: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  gainLossPercent: number;
}

export interface Portfolio {
  assets: Asset[];
  summary: PortfolioSummary;
}

export interface PortfolioResponse {
  data: Portfolio;
  status: 'ok';
  code: number;
}

export interface InvestmentsResponse {
  data: {
    datas: Asset[];
    page: number;
    limit: number;
    total: number;
  };
  status: 'ok';
  code: number;
}

export interface AssetResponse {
  data: Asset;
  status: 'ok';
  code: number;
}

export interface AddInvestmentRequest {
  type: AssetType;
  name: string;
  symbol: string;
  purchasePrice: number;
  currentValue: number;
  quantity: number;
  currency?: string;
}

export interface UpdateInvestmentRequest {
  currentValue?: number;
  quantity?: number;
}

export interface InvestmentFormData {
  type: AssetType;
  name: string;
  symbol: string;
  purchasePrice: number;
  currentValue: number;
  quantity: number;
  currency: string;
}
