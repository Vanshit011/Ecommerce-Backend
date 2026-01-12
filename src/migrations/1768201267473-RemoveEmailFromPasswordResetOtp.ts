import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveEmailFromPasswordResetOtp1768201267473 implements MigrationInterface {
    name = 'RemoveEmailFromPasswordResetOtp1768201267473'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f064c1cfedfb0aca0a334aaa96"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "is_verified" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "is_verified" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_f064c1cfedfb0aca0a334aaa96" ON "password_reset_otp" ("email") `);
    }

}
