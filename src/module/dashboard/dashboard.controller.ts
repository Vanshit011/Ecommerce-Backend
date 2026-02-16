import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
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
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get complete dashboard overview' })
  @ApiResponse({ status: 200, type: DashboardOverviewDto })
  async getOverview(
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardOverviewDto> {
    return this.dashboardService.getOverview(query);
  }

  @Get('revenue')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get revenue analytics with monthly breakdown' })
  @ApiResponse({ status: 200, type: RevenueAnalyticsDto })
  async getRevenueAnalytics(
    @Query() query: DashboardQueryDto,
  ): Promise<RevenueAnalyticsDto> {
    return this.dashboardService.getRevenueAnalytics(query);
  }

  @Get('orders/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get order statistics by status' })
  @ApiResponse({ status: 200, type: OrderStatisticsDto })
  async getOrderStatistics(
    @Query() query: DashboardQueryDto,
  ): Promise<OrderStatisticsDto> {
    return this.dashboardService.getOrderStatistics(query);
  }

  @Get('products/top')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get top products by revenue' })
  @ApiResponse({ status: 200, type: [TopProductDto] })
  async getTopProducts(
    @Query() query: DashboardQueryDto,
  ): Promise<TopProductDto[]> {
    return this.dashboardService.getTopProducts(query);
  }

  @Get('orders/recent')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get recent orders' })
  @ApiResponse({ status: 200, type: [RecentOrderDto] })
  async getRecentOrders(
    @Query() query: DashboardQueryDto,
  ): Promise<RecentOrderDto[]> {
    return this.dashboardService.getRecentOrders(query);
  }

  @Get('sales/category')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get sales breakdown by category' })
  @ApiResponse({ status: 200, type: [SalesByCategoryDto] })
  async getSalesByCategory(): Promise<SalesByCategoryDto[]> {
    return this.dashboardService.getSalesByCategory();
  }

  @Get('favorites/popular')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get popular products by favorites' })
  @ApiResponse({ status: 200, type: [FavoriteProductDto] })
  async getPopularFavorites(): Promise<FavoriteProductDto[]> {
    return this.dashboardService.getPopularFavoriteProducts();
  }
}
