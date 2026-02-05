import { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityUpdate1770269693910 implements MigrationInterface {
  name = 'EntityUpdate1770269693910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "priceSnapshot"`,
    );
    await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "variantId"`);
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "variant_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "price_snapshot" numeric NOT NULL`,
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
      `ALTER TABLE "cart_items" DROP COLUMN "price_snapshot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "variant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "variantId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "priceSnapshot" numeric NOT NULL`,
    );
  }
}
