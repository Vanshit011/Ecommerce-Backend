import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../user/entity/user.entity';
import { OtpType } from '../../../shared/constants/enum';

@Entity('otp')
export class Otp extends BaseEntity {
  @Column({ type: 'varchar', length: 10 })
  otp: string;

  @Column({
    type: 'enum',
    enum: OtpType,
    default: OtpType.FORGOT_PASSWORD,
  })
  type: OtpType;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_verified: boolean;

  @Column({
    type: 'timestamp',
    default: () => "NOW() + INTERVAL '10 minutes'",
  })
  expires_at: Date;

  @ManyToOne(() => User, (user) => user.otps, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
