import { MigrationInterface, QueryRunner } from 'typeorm';

export class SnakeCaseRename1770271165856 implements MigrationInterface {
  name = 'SnakeCaseRename1770271165856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_0c7bba48aac77ad13092685ba5b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_e747534006c6e3c2f09939da60f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_84e765378a5f03ad9900df3a9ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" DROP CONSTRAINT "FK_b367708bf720c8dd62fc6833161"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_99d90c2a483d79f3b627fb1d5e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_product_images_main"`);
    await queryRunner.query(`DROP INDEX "public"."idx_product_images_product"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_category"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_user"`);
    // Rename columns instead of dropping and adding to preserve data
    await queryRunner.query(
      `ALTER TABLE "favorites" RENAME COLUMN "userId" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" RENAME COLUMN "productId" TO "product_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "cart_items" RENAME COLUMN "userId" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" RENAME COLUMN "productId" TO "product_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "product_images" RENAME COLUMN "productId" TO "product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" RENAME COLUMN "isMain" TO "is_main"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" RENAME COLUMN "imagePublicId" TO "image_public_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "isActive" TO "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "userId" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "categoryId" TO "category_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "stockQty" TO "stock_qty"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "salePrice" TO "sale_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "metaTitle" TO "meta_title"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "metaDescription" TO "meta_description"`,
    );

    await queryRunner.query(
      `ALTER TABLE "orders" RENAME COLUMN "totalAmount" TO "total_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" RENAME COLUMN "stripePaymentIntentId" TO "stripe_payment_intent_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_main" ON "product_images" ("product_id", "is_main") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_product" ON "product_images" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_active" ON "products" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_category" ON "products" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_user" ON "products" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" ADD CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" ADD CONSTRAINT "FK_003e599a9fc0e8f154b6313639f" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_b7213c20c1ecdc6597abc8f1212" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_30e89257a105eab7648a35c7fce" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" ADD CONSTRAINT "FK_4f166bb8c2bfcef2498d97b4068" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_176b502c5ebd6e72cafbd9d6f70" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_176b502c5ebd6e72cafbd9d6f70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" DROP CONSTRAINT "FK_4f166bb8c2bfcef2498d97b4068"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_30e89257a105eab7648a35c7fce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_b7213c20c1ecdc6597abc8f1212"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_003e599a9fc0e8f154b6313639f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_products_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_category"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_product_images_product"`);
    await queryRunner.query(`DROP INDEX "public"."idx_product_images_main"`);
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    // Reverse renames in down method
    await queryRunner.query(
      `ALTER TABLE "favorites" RENAME COLUMN "user_id" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" RENAME COLUMN "product_id" TO "productId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "cart_items" RENAME COLUMN "user_id" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" RENAME COLUMN "product_id" TO "productId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "product_images" RENAME COLUMN "product_id" TO "productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" RENAME COLUMN "is_main" TO "isMain"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" RENAME COLUMN "image_public_id" TO "imagePublicId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "is_active" TO "isActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "user_id" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "category_id" TO "categoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "stock_qty" TO "stockQty"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "sale_price" TO "salePrice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "meta_title" TO "metaTitle"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "meta_description" TO "metaDescription"`,
    );

    await queryRunner.query(
      `ALTER TABLE "orders" RENAME COLUMN "total_amount" TO "totalAmount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" RENAME COLUMN "stripe_payment_intent_id" TO "stripePaymentIntentId"`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_user" ON "products" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_category" ON "products" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_active" ON "products" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_product" ON "product_images" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_main" ON "product_images" ("isMain", "productId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_99d90c2a483d79f3b627fb1d5e9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" ADD CONSTRAINT "FK_b367708bf720c8dd62fc6833161" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_84e765378a5f03ad9900df3a9ba" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" ADD CONSTRAINT "FK_e747534006c6e3c2f09939da60f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" ADD CONSTRAINT "FK_0c7bba48aac77ad13092685ba5b" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
