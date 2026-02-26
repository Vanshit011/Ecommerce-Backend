import { MigrationInterface, QueryRunner } from 'typeorm';

export class IndexingName1772096347536 implements MigrationInterface {
  name = 'IndexingName1772096347536';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d417e5d35f2434afc4bd48cb4d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_db724db1bc3d94ad5ba3851843"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5ed74ffd0060ad5a01107ea552"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0a8c778740127a7bd29470fb89"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6343513e20e2deab45edfce131"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_46f236f21640f9da218a063a86"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55d24a9ecdadf3260aa860ab56"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b7213c20c1ecdc6597abc8f121"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_30e89257a105eab7648a35c7fc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f43ec017fdf1b06990875e9ea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_145532db85752b29c57d2b7b1f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9263386c35b6b242540f9493b0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_427785468fb7d2733f59e7d7d3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2f7b823a21562eeca20e72b00"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5612b5a72be78c332b5fd23786"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9974c02e617aa96ddafd840432"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a922b820eeef29ac1c6800e826"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d39c53244703b8534307adcd07"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fbfc1475fc6797244d160068cb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_775c9f06fc27ae3ff8fb26f2c4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_db623beca8ff9ede5d7d45a9bd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c884e321f927d5b86aac7c8f9e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_16aac8a9f6f9c1dd6bcb75ec02"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d996b7c001640a4d8ecdc4d8e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_18d7eec025c0d05edf0bbcbbd6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_660581c9654f0865aaed17b147"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_51b8b26ac168fbe7d6f5653e6c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ace513fa30d485cfd25c11a9e4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9a5f6868c96e0069e699f33e12"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_176b502c5ebd6e72cafbd9d6f7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_38b4de71bc58b2d17f6da038c2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff66adff5f19987f4a166289ba"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_69a63e75de53e7cc4bcd029bed"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4dcd2cd0cf988da1681469a0f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9f502009595f54b9ca948e6d3d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_61fac54950763ae56ee51f17fd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_995d8194c43edfc98838cabc5a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c826b5966756d33c775420d643"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_products_fts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4f166bb8c2bfcef2498d97b406"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_79ce4af5102d81c4e21de32b56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_tokens_user_id" ON "tokens" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_otp_user_id" ON "otp" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_favorites_user_product" ON "favorites" ("user_id", "product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_price" ON "product_variants" ("price") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_product_price" ON "product_variants" ("product_id", "price") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_product_variants_sku" ON "product_variants" ("sku") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_variants_product" ON "product_variants" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cart_items_user_id" ON "cart_items" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cart_items_product_id" ON "cart_items" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cart_items_user_product_variant" ON "cart_items" ("user_id", "product_id", "variant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_items_order_id" ON "order_items" ("order_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_items_product_id" ON "order_items" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payments_user_id" ON "payments" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payments_order_id" ON "payments" ("order_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_coupons_user_id" ON "coupons" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_coupons_code_is_active" ON "coupons" ("code", "is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_user_id" ON "orders" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_address_id" ON "orders" ("address_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_stripe_payment_intent_id" ON "orders" ("stripe_payment_intent_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_status" ON "orders" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_user_created" ON "orders" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_created_at" ON "orders" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_addresses_user_id" ON "addresses" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_reviews_product_rating" ON "reviews" ("product_id", "rating") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_reviews_user" ON "reviews" ("user_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_reviews_user_product" ON "reviews" ("user_id", "product_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_reviews_product_created_at" ON "reviews" ("product_id", "created_at") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_name" ON "users" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_email" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_role" ON "users" ("role") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_name" ON "products" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_is_active" ON "products" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_brand" ON "products" ("brand") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_availability" ON "products" ("availability") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_category_id" ON "products" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_user_id" ON "products" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_is_active_created_at" ON "products" ("is_active", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_brand_is_active" ON "products" ("brand", "is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_category_availability_isActive" ON "products" ("category_id", "availability", "is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_category_is_active" ON "products" ("category_id", "is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_created_at" ON "products" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_product_id" ON "product_images" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_product_is_main" ON "product_images" ("product_id", "is_main") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_images_product_is_main"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_images_product_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_products_created_at"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_products_category_is_active"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_products_category_availability_isActive"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_products_brand_is_active"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_products_is_active_created_at"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_products_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_category_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_availability"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_brand"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_is_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_role"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_name"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_reviews_product_created_at"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_reviews_user_product"`);
    await queryRunner.query(`DROP INDEX "public"."idx_reviews_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_reviews_product_rating"`);
    await queryRunner.query(`DROP INDEX "public"."idx_addresses_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_user_created"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_orders_stripe_payment_intent_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_orders_address_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_coupons_code_is_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_coupons_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_payments_order_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_payments_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_order_items_product_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_order_items_order_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_cart_items_user_product_variant"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_cart_items_product_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cart_items_user_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_variants_product"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_product_variants_sku"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_product_variants_product_price"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_product_variants_price"`);
    await queryRunner.query(`DROP INDEX "public"."idx_favorites_user_product"`);
    await queryRunner.query(`DROP INDEX "public"."idx_otp_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_tokens_user_id"`);
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79ce4af5102d81c4e21de32b56" ON "product_images" ("is_main", "product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4f166bb8c2bfcef2498d97b406" ON "product_images" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_fts" ON "products" ("search_vector") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c826b5966756d33c775420d643" ON "products" ("created_at", "is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_995d8194c43edfc98838cabc5a" ON "products" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_61fac54950763ae56ee51f17fd" ON "products" ("brand") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9f502009595f54b9ca948e6d3d" ON "products" ("availability") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4dcd2cd0cf988da1681469a0f4" ON "products" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_69a63e75de53e7cc4bcd029bed" ON "products" ("is_active", "category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff66adff5f19987f4a166289ba" ON "products" ("is_active", "availability", "category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38b4de71bc58b2d17f6da038c2" ON "products" ("is_active", "brand") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_176b502c5ebd6e72cafbd9d6f7" ON "products" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a5f6868c96e0069e699f33e12" ON "products" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51b8b26ac168fbe7d6f5653e6c" ON "users" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_660581c9654f0865aaed17b147" ON "reviews" ("created_at", "product_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18d7eec025c0d05edf0bbcbbd6" ON "reviews" ("user_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5d996b7c001640a4d8ecdc4d8e" ON "reviews" ("user_id", "product_id") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16aac8a9f6f9c1dd6bcb75ec02" ON "addresses" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c884e321f927d5b86aac7c8f9e" ON "orders" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db623beca8ff9ede5d7d45a9bd" ON "orders" ("stripe_payment_intent_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON "orders" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fbfc1475fc6797244d160068cb" ON "orders" ("created_at", "user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d39c53244703b8534307adcd07" ON "orders" ("address_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a922b820eeef29ac1c6800e826" ON "orders" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9974c02e617aa96ddafd840432" ON "coupons" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5612b5a72be78c332b5fd23786" ON "coupons" ("code", "is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2f7b823a21562eeca20e72b00" ON "payments" ("order_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_427785468fb7d2733f59e7d7d3" ON "payments" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9263386c35b6b242540f9493b0" ON "order_items" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_145532db85752b29c57d2b7b1f" ON "order_items" ("order_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f43ec017fdf1b06990875e9ea" ON "cart_items" ("user_id", "product_id", "variant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_30e89257a105eab7648a35c7fc" ON "cart_items" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b7213c20c1ecdc6597abc8f121" ON "cart_items" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55d24a9ecdadf3260aa860ab56" ON "product_variants" ("price", "product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46f236f21640f9da218a063a86" ON "product_variants" ("sku") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6343513e20e2deab45edfce131" ON "product_variants" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0a8c778740127a7bd29470fb89" ON "product_variants" ("price") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ed74ffd0060ad5a01107ea552" ON "favorites" ("user_id", "product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db724db1bc3d94ad5ba3851843" ON "otp" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d417e5d35f2434afc4bd48cb4d" ON "tokens" ("userId") `,
    );
  }
}
