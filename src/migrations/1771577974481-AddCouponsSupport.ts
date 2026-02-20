import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCouponsSupport1771577974481 implements MigrationInterface {
  name = 'AddCouponsSupport1771577974481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."coupons_discount_type_enum" AS ENUM('PERCENTAGE', 'FIXED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "coupons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "code" character varying(50) NOT NULL, "discount_type" "public"."coupons_discount_type_enum" NOT NULL DEFAULT 'FIXED', "discount_value" numeric(10,2) NOT NULL, "min_order_amount" numeric(10,2) NOT NULL DEFAULT '0', "max_discount_amount" numeric(10,2), "usage_limit" integer NOT NULL DEFAULT '0', "used_count" integer NOT NULL DEFAULT '0', "start_date" TIMESTAMP, "end_date" TIMESTAMP, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e025109230e82925843f2a14c4" ON "coupons" ("code") `,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "discount_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "orders" ADD "coupon_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_6284f0f60e4cb96c12ff96f0f15" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_6284f0f60e4cb96c12ff96f0f15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "coupon_id"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "discount_amount"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e025109230e82925843f2a14c4"`,
    );
    await queryRunner.query(`DROP TABLE "coupons"`);
    await queryRunner.query(`DROP TYPE "public"."coupons_discount_type_enum"`);
  }
}
