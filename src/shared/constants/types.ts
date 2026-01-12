import { UserRole } from '../../shared/constants/enum';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}
