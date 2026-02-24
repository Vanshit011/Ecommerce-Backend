import { MigrationInterface, QueryRunner } from 'typeorm';

export class CouponIndex1771579484559 implements MigrationInterface {
  name = 'CouponIndex1771579484559';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e025109230e82925843f2a14c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5612b5a72be78c332b5fd23786" ON "coupons" ("code", "is_active") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5612b5a72be78c332b5fd23786"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e025109230e82925843f2a14c4" ON "coupons" ("code") `,
    );
  }
}
