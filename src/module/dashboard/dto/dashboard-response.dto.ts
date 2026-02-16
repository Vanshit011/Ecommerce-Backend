import { ApiProperty } from '@nestjs/swagger';

export class MonthlyRevenueDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  revenue: number;

  @ApiProperty()
  orders: number;

  @ApiProperty()
  growth: number;
}

export class RevenueAnalyticsDto {
  @ApiProperty()
  year: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  growth: number;

  @ApiProperty({ type: [MonthlyRevenueDto] })
  monthlyData: MonthlyRevenueDto[];
}

export class OrderStatisticsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  cancelled: number;

  @ApiProperty()
  confirmed: number;

  @ApiProperty()
  shipped: number;

  @ApiProperty()
  delivered: number;
}

export class RecentOrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  productImage: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;
}

export class SalesByCategoryDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  sales: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  color: string;
}

export class TopProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  sales: number;

  @ApiProperty()
  revenue: number;

  @ApiProperty()
  badge: string;
}

export class FavoriteProductDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  favoritesCount: number;
}

export class DashboardOverviewDto {
  @ApiProperty({ type: RevenueAnalyticsDto })
  revenue: RevenueAnalyticsDto;

  @ApiProperty({ type: OrderStatisticsDto })
  orders: OrderStatisticsDto;

  @ApiProperty({ type: [TopProductDto] })
  topProducts: TopProductDto[];

  @ApiProperty({ type: [RecentOrderDto] })
  recentOrders: RecentOrderDto[];

  @ApiProperty({ type: [SalesByCategoryDto] })
  salesByCategory: SalesByCategoryDto[];

  @ApiProperty({ type: [FavoriteProductDto] })
  popularFavorites: FavoriteProductDto[];

  @ApiProperty()
  totalProducts: number;

  @ApiProperty()
  totalCategories: number;

  @ApiProperty()
  totalCustomers: number;
}
