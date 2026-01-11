import {
  Entity,
  Column,
  ManyToOne,
} from 'typeorm';

import { User } from 'src/module/user/entity/user.entity';
import { BaseEntity } from 'src/shared/entities/base.entity';

@Entity('tokens')
export class Token extends BaseEntity {
  @Column()
  token: string;

  @Column({
    type: 'timestamp',
    default: () => 'NOW()',
  })
  login_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  logout_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  user: User;
}