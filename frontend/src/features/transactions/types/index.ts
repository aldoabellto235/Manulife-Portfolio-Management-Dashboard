export type TransactionType = 'BUY' | 'SELL';

export interface Transaction {
  id: string;
  userId: string;
  assetId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  currency: string;
  totalValue: number;
  date: string;
  createdAt: string;
}

export interface TransactionsResponse {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  status: 'ok';
  code: number;
}

export interface TransactionResponse {
  data: Transaction;
  status: 'ok';
  code: number;
}

export interface AddTransactionRequest {
  assetId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  currency?: string;
  date?: string;
}

export interface TransactionFormData {
  assetId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  currency: string;
  date: string;
}
