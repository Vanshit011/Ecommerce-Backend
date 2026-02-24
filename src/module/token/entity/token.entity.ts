import { Entity, Column, ManyToOne, Index } from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('tokens')
export class Token extends BaseEntity {
  @Column({ type: 'text' })
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

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Index()
  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  user: User;
}
