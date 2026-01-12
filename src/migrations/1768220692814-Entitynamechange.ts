import { MigrationInterface, QueryRunner } from "typeorm";

export class Entitynamechange1768220692814 implements MigrationInterface {
    name = 'Entitynamechange1768220692814'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "mobile_number" TO "mobile"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "UQ_350c2c34c6fdd4b292ab6e77879" TO "UQ_d376a9f93bba651f32a2c03a7d3"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "UQ_d376a9f93bba651f32a2c03a7d3" TO "UQ_350c2c34c6fdd4b292ab6e77879"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "mobile" TO "mobile_number"`);
    }

}
