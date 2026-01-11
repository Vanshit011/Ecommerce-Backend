import { UserRole } from 'src/module/user/entity/user.entity';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}
