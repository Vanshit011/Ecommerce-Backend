import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import {
  DashboardOverviewDto,
  RevenueAnalyticsDto,
  OrderStatisticsDto,
  RecentOrderDto,
  SalesByCategoryDto,
  TopProductDto,
  FavoriteProductDto,
} from './dto/dashboard-response.dto';
import { RolesGuard } from '../../core/guard/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { UserRole } from 'src/shared/constants/enum';

@Controller('dashboard')
@UseGuards(AuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get complete dashboard overview' })
  async getOverview(
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardOverviewDto> {
    return this.dashboardService.getOverview(query);
  }

  @Get('revenue')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get revenue analytics with monthly breakdown' })
  async getRevenueAnalytics(
    @Query() query: DashboardQueryDto,
  ): Promise<RevenueAnalyticsDto> {
    return this.dashboardService.getRevenueAnalytics(query);
  }

  @Get('orders/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get order statistics by status' })
  async getOrderStatistics(
    @Query() query: DashboardQueryDto,
  ): Promise<OrderStatisticsDto> {
    return this.dashboardService.getOrderStatistics(query);
  }

  @Get('products/top')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get top products by revenue' })
  async getTopProducts(
    @Query() query: DashboardQueryDto,
  ): Promise<TopProductDto[]> {
    return this.dashboardService.getTopProducts(query);
  }

  @Get('orders/recent')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get recent orders' })
  async getRecentOrders(
    @Query() query: DashboardQueryDto,
  ): Promise<RecentOrderDto[]> {
    return this.dashboardService.getRecentOrders(query);
  }

  @Get('sales/category')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get sales breakdown by category' })
  async getSalesByCategory(
    @Query() query: DashboardQueryDto,
  ): Promise<SalesByCategoryDto[]> {
    return this.dashboardService.getSalesByCategory(query);
  }

  @Get('favorites/popular')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get popular products by favorites' })
  async getPopularFavorites(): Promise<FavoriteProductDto[]> {
    return this.dashboardService.getPopularFavoriteProducts();
  }
}
