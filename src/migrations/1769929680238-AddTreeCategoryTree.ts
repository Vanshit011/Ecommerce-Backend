import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTreeCategoryTree1769929680238 implements MigrationInterface {
    name = 'AddTreeCategoryTree1769929680238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "mpath" character varying DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "mpath"`);
    }

}
