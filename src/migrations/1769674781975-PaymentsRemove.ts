import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentsRemove1769674781975 implements MigrationInterface {
    name = 'PaymentsRemove1769674781975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_7819f136440d4ae83b20f0267a9"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_id"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_id" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_7819f136440d4ae83b20f0267a9" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
