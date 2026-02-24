import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSocialLoginFields1771496575252 implements MigrationInterface {
  name = 'AddSocialLoginFields1771496575252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "google_id" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE ("google_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "github_id" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_09a2296ade1053a0cc4080bda4a" UNIQUE ("github_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "mobile" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97fe57cdb7c00acece56830679" ON "reviews" ("product_id", "rating") WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97fe57cdb7c00acece56830679"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "mobile" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_09a2296ade1053a0cc4080bda4a"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "github_id"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
  }
}
