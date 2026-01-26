import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveProfileImage1769415254990 implements MigrationInterface {
  name = 'RemoveProfileImage1769415254990';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileImage"`);
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profileImage" character varying`,
    );
  }
}
