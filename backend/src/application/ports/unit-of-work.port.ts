import { IAssetRepository } from '../../domain/repositories/asset.repository';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';

export interface IUnitOfWorkRepos {
  assetRepo: IAssetRepository;
  txRepo: ITransactionRepository;
}

export interface IUnitOfWork {
  run<T>(work: (repos: IUnitOfWorkRepos) => Promise<T>): Promise<T>;
}
