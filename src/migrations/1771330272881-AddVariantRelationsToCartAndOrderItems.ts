import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVariantRelationsToCartAndOrderItems1771330272881 implements MigrationInterface {
  name = 'AddVariantRelationsToCartAndOrderItems1771330272881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "variant_id"`,
    );
    await queryRunner.query(`ALTER TABLE "cart_items" ADD "variant_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "variant_id"`,
    );
    await queryRunner.query(`ALTER TABLE "order_items" ADD "variant_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_ede780fc2b865d1d1323e598038" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_db2d0ea722e16e0fe8ab3bce111" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_db2d0ea722e16e0fe8ab3bce111"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_ede780fc2b865d1d1323e598038"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "variant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "variant_id" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "variant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "variant_id" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
  }
}
