import { MigrationInterface, QueryRunner } from 'typeorm';

export class Test1771421328485 implements MigrationInterface {
  name = 'Test1771421328485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d417e5d35f2434afc4bd48cb4d" ON "tokens" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db724db1bc3d94ad5ba3851843" ON "otp" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ed74ffd0060ad5a01107ea552" ON "favorites" ("user_id", "product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0a8c778740127a7bd29470fb89" ON "product_variants" ("price") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6343513e20e2deab45edfce131" ON "product_variants" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b7213c20c1ecdc6597abc8f121" ON "cart_items" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_30e89257a105eab7648a35c7fc" ON "cart_items" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f43ec017fdf1b06990875e9ea" ON "cart_items" ("user_id", "product_id", "variant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4f166bb8c2bfcef2498d97b406" ON "product_images" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79ce4af5102d81c4e21de32b56" ON "product_images" ("product_id", "is_main") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a5f6868c96e0069e699f33e12" ON "products" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_176b502c5ebd6e72cafbd9d6f7" ON "products" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38b4de71bc58b2d17f6da038c2" ON "products" ("brand", "is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff66adff5f19987f4a166289ba" ON "products" ("category_id", "availability", "is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_69a63e75de53e7cc4bcd029bed" ON "products" ("category_id", "is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_145532db85752b29c57d2b7b1f" ON "order_items" ("order_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9263386c35b6b242540f9493b0" ON "order_items" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_427785468fb7d2733f59e7d7d3" ON "payments" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2f7b823a21562eeca20e72b00" ON "payments" ("order_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a922b820eeef29ac1c6800e826" ON "orders" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d39c53244703b8534307adcd07" ON "orders" ("address_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fbfc1475fc6797244d160068cb" ON "orders" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16aac8a9f6f9c1dd6bcb75ec02" ON "addresses" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_16aac8a9f6f9c1dd6bcb75ec02"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fbfc1475fc6797244d160068cb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d39c53244703b8534307adcd07"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a922b820eeef29ac1c6800e826"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2f7b823a21562eeca20e72b00"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_427785468fb7d2733f59e7d7d3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9263386c35b6b242540f9493b0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_145532db85752b29c57d2b7b1f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_69a63e75de53e7cc4bcd029bed"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff66adff5f19987f4a166289ba"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_38b4de71bc58b2d17f6da038c2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_176b502c5ebd6e72cafbd9d6f7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9a5f6868c96e0069e699f33e12"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_79ce4af5102d81c4e21de32b56"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4f166bb8c2bfcef2498d97b406"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f43ec017fdf1b06990875e9ea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_30e89257a105eab7648a35c7fc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b7213c20c1ecdc6597abc8f121"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6343513e20e2deab45edfce131"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0a8c778740127a7bd29470fb89"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5ed74ffd0060ad5a01107ea552"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_db724db1bc3d94ad5ba3851843"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d417e5d35f2434afc4bd48cb4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
  }
}
