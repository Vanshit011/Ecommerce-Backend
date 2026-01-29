import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStatuss1769688490370 implements MigrationInterface {
    name = 'AddOrderStatuss1769688490370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "orderStatus" SET DEFAULT 'CONFIRMED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "orderStatus" SET DEFAULT 'SHIPPED'`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
    }

}
