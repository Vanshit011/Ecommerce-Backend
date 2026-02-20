import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActiveCartCouponUpdate1771583421491 implements MigrationInterface {
  name = 'ActiveCartCouponUpdate1771583421491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "active_cart_coupon"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "active_cart_coupon" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "active_cart_coupon"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "active_cart_coupon" character varying(50)`,
    );
  }
}
