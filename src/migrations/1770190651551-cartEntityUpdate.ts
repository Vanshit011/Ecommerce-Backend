import { MigrationInterface, QueryRunner } from "typeorm";

export class CartEntityUpdate1770190651551 implements MigrationInterface {
    name = 'CartEntityUpdate1770190651551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "size" character varying`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "color" character varying`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "variantId" character varying`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "priceSnapshot" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "priceSnapshot"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "variantId"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "color"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "size"`);
    }

}
