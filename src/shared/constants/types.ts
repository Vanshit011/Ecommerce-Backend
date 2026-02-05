import { Request } from 'express';
import { UserRole, Status } from '../../shared/constants/enum';

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
export interface AdminOrderQueryParams {
  page: number;
  limit: number;
  status?: Status[];
  paymentStatus?: string[];
}
export interface AdminProductQueryParams {
  page: number;
  limit: number;
}

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}
