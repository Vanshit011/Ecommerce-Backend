import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovDraft1770103385092 implements MigrationInterface {
    name = 'RemovDraft1770103385092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_products_draft"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "isDraft"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "products" ADD "isDraft" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "idx_products_draft" ON "products" ("isDraft") `);
    }

}
