export type AssetError =
  | { type: 'ASSET_NOT_FOUND'; assetId: string }
  | { type: 'ASSET_OWNERSHIP_VIOLATION'; userId: string }
  | { type: 'INVALID_QUANTITY'; provided: number }
  | { type: 'INVALID_ASSET_TYPE'; provided: string }
  | { type: 'INSUFFICIENT_QUANTITY'; available: number; requested: number };
