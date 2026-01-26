import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnique1769427250592 implements MigrationInterface {
  name = 'RemoveUnique1769427250592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "UQ_f5c53f7e745f8fa6e473875aaa2"`,
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
      `ALTER TABLE "cart_items" ADD CONSTRAINT "UQ_f5c53f7e745f8fa6e473875aaa2" UNIQUE ("userId", "productId")`,
    );
  }
}
