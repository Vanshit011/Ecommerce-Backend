import { MigrationInterface, QueryRunner } from "typeorm";

export class FavoriteEntityChanges1769167999669 implements MigrationInterface {
    name = 'FavoriteEntityChanges1769167999669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_a4fcc97c7721be9ac5602c3f4f8"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_d2360a83d68b9a2ca1c64334a0a"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "usersId"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "productsId"`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD "productId" uuid`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '10 minutes'`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_e747534006c6e3c2f09939da60f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_0c7bba48aac77ad13092685ba5b" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_0c7bba48aac77ad13092685ba5b"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_e747534006c6e3c2f09939da60f"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otp" ALTER COLUMN "expires_at" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "productId"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD "productsId" uuid`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD "usersId" uuid`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_d2360a83d68b9a2ca1c64334a0a" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_a4fcc97c7721be9ac5602c3f4f8" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
