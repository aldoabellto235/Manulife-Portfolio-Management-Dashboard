import { Asset } from '../../../domain/entities/asset.entity';
import { AssetId, UserId } from '../../../domain/value-objects/branded';
import { Money } from '../../../domain/value-objects/money.vo';
import { AssetModel } from '../typeorm/models/asset.model';

export class AssetMapper {
  static toDomain(raw: AssetModel): Asset {
    return Asset.reconstitute({
      id: AssetId(raw.id),
      userId: UserId(raw.userId),
      type: raw.type,
      name: raw.name,
      symbol: raw.symbol,
      purchasePrice: Money.create(raw.purchasePrice, raw.currency).unwrap(),
      currentValue: Money.create(raw.currentValue, raw.currency).unwrap(),
      quantity: raw.quantity,
      version: raw.version,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(asset: Asset): AssetModel {
    const model = new AssetModel();
    model.id = asset.id;
    model.userId = asset.userId;
    model.type = asset.type;
    model.name = asset.name;
    model.symbol = asset.symbol;
    model.purchasePrice = asset.purchasePrice.amount;
    model.currentValue = asset.currentValue.amount;
    model.currency = asset.currentValue.currency;
    model.quantity = asset.quantity;
    model.version = asset.version;
    model.createdAt = asset.createdAt;
    model.updatedAt = asset.updatedAt;
    return model;
  }
}
