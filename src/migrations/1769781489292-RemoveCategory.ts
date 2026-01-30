import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCategory1769781489292 implements MigrationInterface {
    name = 'RemoveCategory1769781489292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_a1c9067a5e8b5aa4b5a9b357ec0"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "parentId"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "parentId" uuid`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_a1c9067a5e8b5aa4b5a9b357ec0" UNIQUE ("name", "parentId")`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
