import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReview1771478062566 implements MigrationInterface {
  name = 'AddReview1771478062566';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "rating" integer NOT NULL, "comment" text, "user_id" uuid, "product_id" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_43968e5855f331f4f1355a3fb2" ON "reviews" ("user_id", "product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_debbd6f89e227172a380a00901" ON "reviews" ("product_id", "created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_9482e9567d8dcc2bc615981ef44" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_9482e9567d8dcc2bc615981ef44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_debbd6f89e227172a380a00901"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_43968e5855f331f4f1355a3fb2"`,
    );
    await queryRunner.query(`DROP TABLE "reviews"`);
  }
}
