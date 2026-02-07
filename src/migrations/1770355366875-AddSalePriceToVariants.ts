import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSalePriceToVariants1770355366875 implements MigrationInterface {
    name = 'AddSalePriceToVariants1770355366875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "sale_price" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "sale_price"`);
    }

}
