import { MigrationInterface, QueryRunner } from "typeorm";

export class Addindexing1769680218078 implements MigrationInterface {
    name = 'Addindexing1769680218078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
        await queryRunner.query(`CREATE INDEX "idx_products_name" ON "products" ("name") `);
        await queryRunner.query(`CREATE INDEX "idx_products_created" ON "products" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_products_user" ON "products" ("userId") `);
        await queryRunner.query(`CREATE INDEX "idx_products_active" ON "products" ("isActive") `);
        await queryRunner.query(`CREATE INDEX "idx_products_price" ON "products" ("price") `);
        await queryRunner.query(`CREATE INDEX "idx_products_category" ON "products" ("categoryId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_products_category"`);
        await queryRunner.query(`DROP INDEX "public"."idx_products_price"`);
        await queryRunner.query(`DROP INDEX "public"."idx_products_active"`);
        await queryRunner.query(`DROP INDEX "public"."idx_products_user"`);
        await queryRunner.query(`DROP INDEX "public"."idx_products_created"`);
        await queryRunner.query(`DROP INDEX "public"."idx_products_name"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
    }

}
