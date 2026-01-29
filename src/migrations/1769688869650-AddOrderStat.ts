import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStat1769688869650 implements MigrationInterface {
    name = 'AddOrderStat1769688869650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "orderStatus" SET DEFAULT 'SHIPPED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "orderStatus" SET DEFAULT 'CONFIRMED'`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
    }

}
