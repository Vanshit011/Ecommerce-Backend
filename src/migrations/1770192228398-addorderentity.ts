import { MigrationInterface, QueryRunner } from 'typeorm';

export class Addorderentity1770192228398 implements MigrationInterface {
  name = 'Addorderentity1770192228398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "size" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "color" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "variantId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "productSnapshot" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "productSnapshot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "variantId"`,
    );
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "color"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "size"`);
  }
}
