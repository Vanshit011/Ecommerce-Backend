import { UserRole } from '../../shared/constants/enum';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}
export interface ProductQueryParams {
  page: number;
  limit: number;
  skip: number;
  search?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}
