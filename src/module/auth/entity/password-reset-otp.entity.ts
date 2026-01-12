import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../../module/user/entity/user.entity';
import { OtpType } from '../../../shared/constants/enum';

@Entity('password_reset_otp')
export class PasswordResetOtp extends BaseEntity {

  @Column()
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

  @ManyToOne(() => User, (user) => user.PasswordResetOtps, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
