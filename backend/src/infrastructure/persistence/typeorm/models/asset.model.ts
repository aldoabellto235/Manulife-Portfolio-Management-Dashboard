import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserModel } from './user.model';

export type AssetTypeORM = 'STOCK' | 'BOND' | 'MUTUAL_FUND';

const numericTransformer = {
  to: (v: number) => v,
  from: (v: string) => parseFloat(v),
};

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => UserModel, { onDelete: 'CASCADE' })
  user!: UserModel;
}
