import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexing1770102044502 implements MigrationInterface {
  name = 'AddIndexing1770102044502';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "sku" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_main" ON "product_images" ("productId", "isMain") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_product" ON "product_images" ("productId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_products_sku" ON "products" ("sku") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_availability" ON "products" ("availability") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_draft" ON "products" ("isDraft") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_active" ON "products" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_price" ON "products" ("price") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_category" ON "products" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_user" ON "products" ("userId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_products_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_category"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_price"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_draft"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_availability"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_sku"`);
    await queryRunner.query(`DROP INDEX "public"."idx_product_images_product"`);
    await queryRunner.query(`DROP INDEX "public"."idx_product_images_main"`);
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "sku" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
  }
}
