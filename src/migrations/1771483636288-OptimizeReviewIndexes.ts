import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeReviewIndexes1771483636288 implements MigrationInterface {
  name = 'OptimizeReviewIndexes1771483636288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_debbd6f89e227172a380a00901"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97fe57cdb7c00acece56830679" ON "reviews" ("product_id", "rating") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18d7eec025c0d05edf0bbcbbd6" ON "reviews" ("user_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_660581c9654f0865aaed17b147" ON "reviews" ("product_id", "created_at") WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_660581c9654f0865aaed17b147"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_18d7eec025c0d05edf0bbcbbd6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97fe57cdb7c00acece56830679"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_debbd6f89e227172a380a00901" ON "reviews" ("created_at", "product_id") `,
    );
  }
}
