import {
  Column,
  OneToMany,
  Entity,
} from 'typeorm';
import { Token } from 'src/module/auth/entity/auth.entity';
import { PasswordResetOtp } from 'src/module/auth/entity/password-reset-otp.entity';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { UserRole } from 'src/shared/constants/enum';


@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => PasswordResetOtp, (passwordResetOtp) => passwordResetOtp.user)
  PasswordResetOtps: PasswordResetOtp[];
}
export { UserRole };

