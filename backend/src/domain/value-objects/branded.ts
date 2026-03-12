declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type AssetId = Brand<string, 'AssetId'>;
export type TransactionId = Brand<string, 'TransactionId'>;

export const UserId = (id: string): UserId => id as UserId;
export const AssetId = (id: string): AssetId => id as AssetId;
export const TransactionId = (id: string): TransactionId => id as TransactionId;
