import { MigrationInterface, QueryRunner } from 'typeorm';

export class GetProductWiseCoupons1771839711691 implements MigrationInterface {
  name = 'GetProductWiseCoupons1771839711691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "coupon_products" ("coupon_id" uuid NOT NULL, "product_id" uuid NOT NULL, CONSTRAINT "PK_e37d7a9483f4414d61a3fd392ab" PRIMARY KEY ("coupon_id", "product_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_edd5b3b5e912ada7e6d28277e2" ON "coupon_products" ("coupon_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4897e96fb4b70bd6ac1d4735ba" ON "coupon_products" ("product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_products" ADD CONSTRAINT "FK_edd5b3b5e912ada7e6d28277e2c" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_products" ADD CONSTRAINT "FK_4897e96fb4b70bd6ac1d4735bae" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coupon_products" DROP CONSTRAINT "FK_4897e96fb4b70bd6ac1d4735bae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_products" DROP CONSTRAINT "FK_edd5b3b5e912ada7e6d28277e2c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4897e96fb4b70bd6ac1d4735ba"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_edd5b3b5e912ada7e6d28277e2"`,
    );
    await queryRunner.query(`DROP TABLE "coupon_products"`);
  }
}
