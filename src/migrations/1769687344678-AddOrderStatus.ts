import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStatus1769687344678 implements MigrationInterface {
    name = 'AddOrderStatus1769687344678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "orderStatus" character varying NOT NULL DEFAULT 'SHIPPED'`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderStatus"`);
    }

}
