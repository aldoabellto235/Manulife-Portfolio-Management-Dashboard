import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1773326660267 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"           uuid          NOT NULL,
        "email"        varchar       NOT NULL,
        "passwordHash" varchar       NOT NULL,
        "createdAt"    TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
