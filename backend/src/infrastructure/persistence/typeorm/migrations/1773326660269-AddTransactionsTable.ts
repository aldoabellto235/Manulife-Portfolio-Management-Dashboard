import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionsTable1773326660269 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "transaction_type_enum" AS ENUM ('BUY', 'SELL');

      CREATE TABLE IF NOT EXISTS "transactions" (
        "id"        UUID          NOT NULL,
        "userId"    UUID          NOT NULL,
        "assetId"   UUID          NOT NULL,
        "type"      "transaction_type_enum" NOT NULL,
        "quantity"  INTEGER       NOT NULL,
        "price"     NUMERIC(18,4) NOT NULL,
        "currency"  VARCHAR(3)    NOT NULL DEFAULT 'IDR',
        "date"      TIMESTAMPTZ   NOT NULL,
        "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transactions_users"  FOREIGN KEY ("userId")  REFERENCES "users"("id")  ON DELETE CASCADE,
        CONSTRAINT "FK_transactions_assets" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE
      );

      CREATE INDEX "IDX_transactions_userId"  ON "transactions" ("userId");
      CREATE INDEX "IDX_transactions_assetId" ON "transactions" ("assetId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "transactions";
      DROP TYPE IF EXISTS "transaction_type_enum";
    `);
  }
}
