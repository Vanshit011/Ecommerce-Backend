import { MigrationInterface, QueryRunner } from "typeorm";

export class Catrgoryupdate1770353833902 implements MigrationInterface {
    name = 'Catrgoryupdate1770353833902'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "token" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "expires_at" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "expires_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "token" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
    }

}
