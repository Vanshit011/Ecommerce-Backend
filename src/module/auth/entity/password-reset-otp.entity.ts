import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { User } from 'src/module/user/entity/user.entity';
import { OtpType } from 'src/shared/constants/enum';

@Entity('password_reset_otp')
export class PasswordResetOtp extends BaseEntity {

  @Index()
  @Column()
  email: string;

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
    default: true,
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
