import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFavorite1769163223539 implements MigrationInterface {
    name = 'AddFavorite1769163223539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "favorites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "usersId" uuid, "productsId" uuid, CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_a4fcc97c7721be9ac5602c3f4f8" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_d2360a83d68b9a2ca1c64334a0a" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_d2360a83d68b9a2ca1c64334a0a"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_a4fcc97c7721be9ac5602c3f4f8"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`DROP TABLE "favorites"`);
    }

}
