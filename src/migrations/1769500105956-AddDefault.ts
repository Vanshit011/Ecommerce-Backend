import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefault1769500105956 implements MigrationInterface {
    name = 'AddDefault1769500105956'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ADD "isDefault" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "isDefault"`);
    }

}
