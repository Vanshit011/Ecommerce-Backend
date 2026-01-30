import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueCategory1769759584906 implements MigrationInterface {
    name = 'UniqueCategory1769759584906'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_a1c9067a5e8b5aa4b5a9b357ec0" UNIQUE ("name", "parentId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_a1c9067a5e8b5aa4b5a9b357ec0"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
    }

}
