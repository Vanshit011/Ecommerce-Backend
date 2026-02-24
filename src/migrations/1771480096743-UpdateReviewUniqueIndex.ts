import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateReviewUniqueIndex1771480096743 implements MigrationInterface {
  name = 'UpdateReviewUniqueIndex1771480096743';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_43968e5855f331f4f1355a3fb2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5d996b7c001640a4d8ecdc4d8e" ON "reviews" ("user_id", "product_id") WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d996b7c001640a4d8ecdc4d8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_43968e5855f331f4f1355a3fb2" ON "reviews" ("user_id", "product_id") `,
    );
  }
}
