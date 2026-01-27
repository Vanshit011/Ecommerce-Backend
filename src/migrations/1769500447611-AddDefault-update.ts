import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultUpdate1769500447611 implements MigrationInterface {
    name = 'AddDefaultUpdate1769500447611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" RENAME COLUMN "isDefault" TO "isdefault"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "addresses" RENAME COLUMN "isdefault" TO "isDefault"`);
    }

}
