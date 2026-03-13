export type TransactionError =
  | { type: 'TRANSACTION_NOT_FOUND'; transactionId: string }
  | { type: 'TRANSACTION_OWNERSHIP_VIOLATION'; userId: string }
  | { type: 'INVALID_QUANTITY'; provided: number }
  | { type: 'INVALID_PRICE' };
