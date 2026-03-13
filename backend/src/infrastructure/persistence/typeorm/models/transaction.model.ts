import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserModel } from './user.model';
import { AssetModel } from './asset.model';

export type TransactionTypeORM = 'BUY' | 'SELL';

const numericTransformer = {
  to: (v: number) => v,
  from: (v: string) => parseFloat(v),
};

@Entity('transactions')
export class TransactionModel {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  userId!: string;

  @Index()
  @Column('uuid')
  assetId!: string;

  @Column({ type: 'enum', enum: ['BUY', 'SELL'] })
  type!: TransactionTypeORM;

  @Column('int')
  quantity!: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, transformer: numericTransformer })
  price!: number;

  @Column({ length: 3, default: 'IDR' })
  currency!: string;

  @Column({ type: 'timestamptz' })
  date!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => UserModel, { onDelete: 'CASCADE' })
  user!: UserModel;

  @ManyToOne(() => AssetModel, { onDelete: 'CASCADE' })
  asset!: AssetModel;
}
