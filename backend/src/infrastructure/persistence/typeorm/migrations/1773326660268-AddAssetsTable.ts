import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetsTable1773326660268 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "asset_type_enum" AS ENUM ('STOCK', 'BOND', 'MUTUAL_FUND');

      CREATE TABLE IF NOT EXISTS "assets" (
        "id"            UUID          NOT NULL,
        "userId"        UUID          NOT NULL,
        "type"          "asset_type_enum" NOT NULL,
        "name"          VARCHAR       NOT NULL,
        "symbol"        VARCHAR       NOT NULL,
        "purchasePrice" NUMERIC(18,4) NOT NULL,
        "currentValue"  NUMERIC(18,4) NOT NULL,
        "currency"      VARCHAR(3)    NOT NULL DEFAULT 'USD',
        "quantity"      INTEGER       NOT NULL,
        "createdAt"     TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updatedAt"     TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_assets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_assets_users" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      );

      CREATE INDEX "IDX_assets_userId" ON "assets" ("userId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "assets";
      DROP TYPE IF EXISTS "asset_type_enum";
    `);
  }
}
