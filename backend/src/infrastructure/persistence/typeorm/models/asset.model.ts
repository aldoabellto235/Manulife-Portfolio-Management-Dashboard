import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { UserModel } from './user.model';
import { numericTransformer } from '../transformers/numeric.transformer';

export type AssetTypeORM = 'STOCK' | 'BOND' | 'MUTUAL_FUND';

@Entity('assets')
export class AssetModel {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  userId!: string;

  @Column({ type: 'enum', enum: ['STOCK', 'BOND', 'MUTUAL_FUND'] })
  type!: AssetTypeORM;

  @Column()
  name!: string;

  @Column()
  symbol!: string;

  @Column({ type: 'numeric', precision: 18, scale: 4, transformer: numericTransformer })
  purchasePrice!: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, transformer: numericTransformer })
  currentValue!: number;

  @Column({ length: 3, default: 'IDR' })
  currency!: string;

  @Column('int')
  quantity!: number;

  @VersionColumn()
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => UserModel, { onDelete: 'CASCADE' })
  user!: UserModel;
}
