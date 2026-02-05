import { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityUpdateE1770270211109 implements MigrationInterface {
  name = 'EntityUpdateE1770270211109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "productSnapshot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "variantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "stripePaymentIntentId"`,
    );
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "refundId"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "isdefault"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "fullname"`);
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP COLUMN "addressline1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP COLUMN "addressline2"`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "postalcode"`);
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "variant_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "product_snapshot" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "stripe_payment_intent_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "refund_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "full_name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "address_line_1" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "address_line_2" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "postal_code" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "is_default" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "user_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "is_default"`);
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP COLUMN "postal_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP COLUMN "address_line_2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP COLUMN "address_line_1"`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "full_name"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "refund_id"`);
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "stripe_payment_intent_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "product_snapshot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "variant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "postalcode" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "addressline2" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "addressline1" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "fullname" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "isdefault" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "refundId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "stripePaymentIntentId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "variantId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "productSnapshot" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
