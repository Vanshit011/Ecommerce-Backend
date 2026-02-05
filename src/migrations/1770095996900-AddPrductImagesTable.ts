import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrductImagesTable1770095996900 implements MigrationInterface {
  name = 'AddPrductImagesTable1770095996900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_products_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_created"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_price"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_category"`);
    await queryRunner.query(
      `CREATE TABLE "product_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productId" uuid NOT NULL, "url" character varying NOT NULL, "imagePublicId" character varying, "isMain" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "imagePublicId"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "sku" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku")`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "brand" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "stockQty" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "products" ADD "salePrice" numeric`);
    await queryRunner.query(
      `CREATE TYPE "public"."products_availability_enum" AS ENUM('instock', 'outofstock', 'preorder')`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "availability" "public"."products_availability_enum" NOT NULL DEFAULT 'instock'`,
    );
    await queryRunner.query(`ALTER TABLE "products" ADD "sizes" text`);
    await queryRunner.query(`ALTER TABLE "products" ADD "colors" text`);
    await queryRunner.query(`ALTER TABLE "products" ADD "tags" text`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "specifications" jsonb`,
    );
    await queryRunner.query(`ALTER TABLE "products" ADD "weight" integer`);
    await queryRunner.query(`ALTER TABLE "products" ADD "dimensions" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "metaTitle" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "metaDescription" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "isDraft" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" ADD CONSTRAINT "FK_b367708bf720c8dd62fc6833161" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_images" DROP CONSTRAINT "FK_b367708bf720c8dd62fc6833161"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "isDraft"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "metaDescription"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "metaTitle"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "dimensions"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "weight"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "specifications"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "tags"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "colors"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sizes"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "availability"`,
    );
    await queryRunner.query(`DROP TYPE "public"."products_availability_enum"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "salePrice"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stockQty"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "brand"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sku"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "image" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "imagePublicId" character varying`,
    );
    await queryRunner.query(`DROP TABLE "product_images"`);
    await queryRunner.query(
      `CREATE INDEX "idx_products_category" ON "products" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_price" ON "products" ("price") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_active" ON "products" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_user" ON "products" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_created" ON "products" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_name" ON "products" ("name") `,
    );
  }
}
