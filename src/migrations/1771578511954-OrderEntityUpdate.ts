import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderEntityUpdate1771578511954 implements MigrationInterface {
  name = 'OrderEntityUpdate1771578511954';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
  }
}
