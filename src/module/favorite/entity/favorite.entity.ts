import { Entity } from "typeorm";
import { BaseEntity } from "../../../shared/entities/base.entity";
import { ManyToOne } from "typeorm";
import { User } from "../../user/entity/user.entity";
import { Product } from "../../product/entity/product.entity";

@Entity('favorites')
export class Favorite extends BaseEntity {

    @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Product, (product) => product.favorites, { onDelete: 'CASCADE' })
    product: Product;

}
