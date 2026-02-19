import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../../core/decorator/get-user.decorator';
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
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get complete dashboard overview' })
  async getOverview(
    @Query() query: DashboardQueryDto,
    @GetUser('id') adminId: string,
  ): Promise<DashboardOverviewDto> {
    return await this.dashboardService.getOverview(query, adminId);
  }

  @Get('revenue')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get revenue analytics with monthly breakdown' })
  async getRevenueAnalytics(
    @Query() query: DashboardQueryDto,
    @GetUser('id') adminId: string,
  ): Promise<RevenueAnalyticsDto> {
    return await this.dashboardService.getRevenueAnalytics(query, adminId);
  }

  @Get('orders/stats')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get order statistics by status' })
  async getOrderStatistics(
    @Query() query: DashboardQueryDto,
    @GetUser('id') adminId: string,
  ): Promise<OrderStatisticsDto> {
    return await this.dashboardService.getOrderStatistics(query, adminId);
  }

  @Get('products/top')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get top products by revenue' })
  async getTopProducts(
    @Query() query: DashboardQueryDto,
    @GetUser('id') adminId: string,
  ): Promise<TopProductDto[]> {
    return await this.dashboardService.getTopProducts(query, adminId);
  }

  @Get('recent-orders')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get recent orders' })
  async getRecentOrders(
    @Query() query: DashboardQueryDto,
    @GetUser('id') adminId: string,
  ): Promise<RecentOrderDto[]> {
    return await this.dashboardService.getRecentOrders(query, adminId);
  }

  @Get('sales/category')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get sales breakdown by category' })
  async getSalesByCategory(
    @Query() query: DashboardQueryDto,
    @GetUser('id') adminId: string,
  ): Promise<SalesByCategoryDto[]> {
    return await this.dashboardService.getSalesByCategory(query, adminId);
  }

  @Get('favorites/popular')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get popular products by favorites' })
  async getPopularFavorites(
    @GetUser('id') adminId: string,
  ): Promise<FavoriteProductDto[]> {
    return await this.dashboardService.getPopularFavoriteProducts(adminId);
  }
}
