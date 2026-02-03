import { MigrationInterface, QueryRunner } from "typeorm";

export class EnumUpdate1770103181463 implements MigrationInterface {
    name = 'EnumUpdate1770103181463'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
        await queryRunner.query(`ALTER TYPE "public"."products_availability_enum" RENAME TO "products_availability_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."products_availability_enum" AS ENUM('INSTOCK', 'OUTOFSTOCK', 'PREORDER')`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "availability" TYPE "public"."products_availability_enum" USING "availability"::"text"::"public"."products_availability_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_availability_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."products_availability_enum_old" AS ENUM('instock', 'outofstock', 'preorder')`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "availability" TYPE "public"."products_availability_enum_old" USING "availability"::"text"::"public"."products_availability_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."products_availability_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."products_availability_enum_old" RENAME TO "products_availability_enum"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
    }

}
