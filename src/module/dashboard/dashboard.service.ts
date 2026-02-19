import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/entity/order.entity';
import { User } from '../user/entity/user.entity';
import { Product } from '../product/entity/product.entity';
import { OrderItem } from '../order/entity/order-item.entity';
import { Status } from '../../shared/constants/enum';
import { Category } from '../categories/entity/category.entity';
import {
  DashboardOverviewDto,
  RevenueAnalyticsDto,
  OrderStatisticsDto,
  RecentOrderDto,
  SalesByCategoryDto,
  TopProductDto,
  MonthlyRevenueDto,
  FavoriteProductDto,
} from './dto/dashboard-response.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import {
  MONTH_NAMES,
  DASHBOARD_CHART_COLORS,
  PRODUCT_BADGES,
} from '../../shared/constants/dashboard-ui.constants';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getOverview(
    query: DashboardQueryDto,
    adminId?: string,
  ): Promise<DashboardOverviewDto> {
    const [
      revenue,
      orders,
      topProducts,
      recentOrders,
      salesByCategory,
      popularFavorites,
    ] = await Promise.all([
      this.getRevenueAnalytics(query, adminId),
      this.getOrderStatistics(query, adminId),
      this.getTopProducts({ ...query, limit: 5 }, adminId),
      this.getRecentOrders({ ...query, limit: 5 }, adminId),
      this.getSalesByCategory(query, adminId),
      this.getPopularFavoriteProducts(adminId),
    ]);

    const productCount = adminId
      ? await this.productRepository.count({ where: { user: { id: adminId } } })
      : await this.productRepository.count();

    const customerCount = adminId
      ? await this.userRepository
          .createQueryBuilder('u')
          .innerJoin('orders', 'o', 'o.user_id = u.id')
          .innerJoin('order_items', 'oi', 'oi.order_id = o.id')
          .innerJoin('products', 'p', 'p.id = oi.product_id')
          .where('p.user_id = :adminId', { adminId })
          .select('COUNT(DISTINCT u.id)', 'count')
          .getRawOne()
      : await this.userRepository.count();

    return {
      revenue,
      orders,
      topProducts,
      recentOrders,
      salesByCategory,
      popularFavorites,
      totalProducts: productCount,
      totalCategories: await this.categoryRepository.count(),
      totalCustomers: adminId ? parseInt(customerCount.count) : customerCount,
    };
  }

  async getRevenueAnalytics(
    query: DashboardQueryDto,
    adminId?: string,
  ): Promise<RevenueAnalyticsDto> {
    const year = query.year ?? new Date().getFullYear();
    const month = query.month;

    const startDate = month
      ? new Date(year, month - 1, 1)
      : new Date(year, 0, 1);

    const endDate = month ? new Date(year, month, 1) : new Date(year + 1, 0, 1);

    const queryBuilder = this.orderRepository
      .createQueryBuilder('o')
      .leftJoin('o.items', 'oi')
      .leftJoin('oi.product', 'p')
      .select('EXTRACT(MONTH FROM o.created_at)', 'month')
      .where('o.status = :status', { status: Status.DELIVERED })
      .andWhere('o.created_at >= :start AND o.created_at < :end', {
        start: startDate,
        end: endDate,
      });

    if (adminId) {
      queryBuilder
        .addSelect('SUM(oi.price * oi.quantity)', 'revenue')
        .addSelect('COUNT(DISTINCT o.id)', 'orders')
        .andWhere('p.user_id = :adminId', { adminId });
    } else {
      queryBuilder
        .addSelect('SUM(o.total_amount)', 'revenue')
        .addSelect('COUNT(o.id)', 'orders');
    }

    const monthlyRevenue = await queryBuilder
      .groupBy('month')
      .orderBy('month')
      .getRawMany();

    const monthMap = new Map(
      monthlyRevenue.map((m) => [
        Number(m.month),
        {
          revenue: Number(m.revenue),
          orders: Number(m.orders),
        },
      ]),
    );

    let prevRevenue = 0;
    let prevOrders = 0;

    const monthlyData: MonthlyRevenueDto[] = (
      month ? [month - 1] : [...Array(12).keys()]
    ).map((i) => {
      const data = monthMap.get(i + 1) ?? { revenue: 0, orders: 0 };
      const currentRevenue = data.revenue;
      const currentOrders = data.orders;

      let growth = 0;
      if (prevRevenue > 0) {
        growth = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
      } else if (currentRevenue > 0 && i > 0) {
        growth = 100;
      }

      let orderGrowth = 0;
      if (prevOrders > 0) {
        orderGrowth = ((currentOrders - prevOrders) / prevOrders) * 100;
      } else if (currentOrders > 0 && i > 0) {
        orderGrowth = 100;
      }

      prevRevenue = currentRevenue || prevRevenue;
      prevOrders = currentOrders || prevOrders;

      return {
        month: MONTH_NAMES[i],
        revenue: currentRevenue,
        orders: currentOrders,
        growth: +growth.toFixed(2),
        orderGrowth: +orderGrowth.toFixed(2),
      };
    });

    const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);
    const totalOrders = monthlyData.reduce((s, m) => s + m.orders, 0);

    // Year-wise growth
    const prevYearQuery = this.orderRepository
      .createQueryBuilder('o')
      .leftJoin('o.items', 'oi')
      .leftJoin('oi.product', 'p')
      .where('o.status = :status', { status: Status.DELIVERED })
      .andWhere('o.created_at >= :s AND o.created_at < :e', {
        s: new Date(year - 1, 0, 1),
        e: new Date(year, 0, 1),
      });

    if (adminId) {
      prevYearQuery
        .select('SUM(oi.price * oi.quantity)', 'revenue')
        .addSelect('COUNT(DISTINCT o.id)', 'orders')
        .andWhere('p.user_id = :adminId', { adminId });
    } else {
      prevYearQuery
        .select('SUM(o.total_amount)', 'revenue')
        .addSelect('COUNT(o.id)', 'orders');
    }

    const prevYearStats = await prevYearQuery.getRawOne();

    const prevYearRevenue = Number(prevYearStats?.revenue || 0);
    const prevYearOrders = Number(prevYearStats?.orders || 0);

    const yearGrowth =
      prevYearRevenue > 0
        ? ((totalRevenue - prevYearRevenue) / prevYearRevenue) * 100
        : totalRevenue > 0
          ? 100
          : 0;

    const yearOrderGrowth =
      prevYearOrders > 0
        ? ((totalOrders - prevYearOrders) / prevYearOrders) * 100
        : totalOrders > 0
          ? 100
          : 0;

    return {
      year,
      totalRevenue,
      totalOrders,
      growth: +yearGrowth.toFixed(2),
      orderGrowth: +yearOrderGrowth.toFixed(2),
      monthlyData,
    };
  }

  async getOrderStatistics(
    query: DashboardQueryDto,
    adminId?: string,
  ): Promise<OrderStatisticsDto> {
    const { startDate, endDate, month, year } = query;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('o')
      .leftJoin('o.items', 'oi')
      .leftJoin('oi.product', 'p');

    if (startDate && endDate) {
      queryBuilder.andWhere('o.created_at BETWEEN :start AND :end', {
        start: new Date(startDate),
        end: new Date(endDate),
      });
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      queryBuilder.andWhere('o.created_at BETWEEN :start AND :end', {
        start,
        end,
      });
    } else if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      queryBuilder.andWhere('o.created_at BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    if (adminId) {
      queryBuilder.andWhere('p.user_id = :adminId', { adminId });
    }

    const orders = await queryBuilder.getMany();

    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === Status.PENDING).length,
      confirmed: orders.filter((o) => o.status === Status.CONFIRMED).length,
      shipped: orders.filter((o) => o.status === Status.SHIPPED).length,
      delivered: orders.filter((o) => o.status === Status.DELIVERED).length,
      cancelled: orders.filter((o) => o.status === Status.CANCELLED).length,
    };

    return stats;
  }

  async getTopProducts(
    query: DashboardQueryDto,
    adminId?: string,
  ): Promise<TopProductDto[]> {
    const limit = query.limit || 5;

    const queryBuilder = this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoin('orderItem.order', 'order')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('SUM(orderItem.quantity)', 'sales')
      .addSelect('SUM(orderItem.price * orderItem.quantity)', 'revenue')
      .where('order.status = :status', { status: Status.DELIVERED })
      .groupBy('product.id')
      .addGroupBy('product.name');

    if (adminId) {
      queryBuilder.andWhere('product.user_id = :adminId', { adminId });
    }

    const topProducts = await queryBuilder
      .orderBy('revenue', 'DESC')
      .limit(limit)
      .getRawMany();

    const badges = PRODUCT_BADGES;

    return topProducts.map((p, index) => ({
      id: p.id,
      name: p.name,
      image: '',
      sales: parseInt(p.sales),
      revenue: parseFloat(p.revenue),
      badge: badges[index % badges.length],
    }));
  }

  async getRecentOrders(
    query: DashboardQueryDto,
    adminId?: string,
  ): Promise<RecentOrderDto[]> {
    const limit = query.limit || 10;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('product.user', 'vendor')
      .orderBy('order.created_at', 'DESC')
      .take(limit);

    if (adminId) {
      queryBuilder.andWhere('product.user_id = :adminId', { adminId });
    }

    const orders = await queryBuilder.getMany();

    return orders.map((order) => {
      // If we filtered by adminId, we should only consider items from that admin for display logic?
      // Usually, recent orders shows the whole order if it contains user's product.
      const displayItems = adminId
        ? order.items.filter((i) => i.product.user?.id === adminId)
        : order.items;

      const firstItem = displayItems[0] || order.items[0];
      const productImages = firstItem?.product?.images;
      const firstImage = Array.isArray(productImages)
        ? productImages[0]
        : productImages;

      return {
        id: order.id,
        customerName: order.user?.name || 'Guest',
        productName: firstItem?.product?.name || 'N/A',
        productImage:
          typeof firstImage === 'string' ? firstImage : firstImage?.url || '',
        amount: order.total_amount,
        status: order.status,
        createdAt: order.created_at,
      };
    });
  }

  async getSalesByCategory(
    query: DashboardQueryDto,
    adminId?: string,
  ): Promise<SalesByCategoryDto[]> {
    const year = query.year ?? new Date().getFullYear();
    const month = query.month;

    const startDate = month
      ? new Date(year, month - 1, 1)
      : new Date(year, 0, 1);

    const endDate = month ? new Date(year, month, 1) : new Date(year + 1, 0, 1);

    const queryBuilder = this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.product', 'product')
      .leftJoin('product.category', 'category')
      .leftJoin('orderItem.order', 'order')
      .select('category.name', 'category')
      .addSelect('SUM(orderItem.price * orderItem.quantity)', 'sales')
      .where('order.status = :status', { status: Status.DELIVERED })
      .andWhere('order.created_at >= :start AND order.created_at < :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('category.name')
      .orderBy('sales', 'DESC');

    if (adminId) {
      queryBuilder.andWhere('product.user_id = :adminId', { adminId });
    }

    const salesByCategory = await queryBuilder.getRawMany();

    const totalSales = salesByCategory.reduce(
      (sum, c) => sum + parseFloat(c.sales),
      0,
    );

    const colors = DASHBOARD_CHART_COLORS;

    return salesByCategory.map((c, index) => ({
      category: c.category || 'Uncategorized',
      sales: parseFloat(c.sales),
      percentage: parseFloat(
        ((parseFloat(c.sales) / totalSales) * 100).toFixed(1),
      ),
      color: colors[index % colors.length],
    }));
  }

  async getPopularFavoriteProducts(
    adminId?: string,
  ): Promise<FavoriteProductDto[]> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('p')
      .innerJoin('favorites', 'f', 'f.product_id = p.id')
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('COUNT(f.id)::int', 'favoritescount')
      .groupBy('p.id')
      .addGroupBy('p.name');

    if (adminId) {
      queryBuilder.andWhere('p.user_id = :adminId', { adminId });
    }

    return queryBuilder
      .orderBy('favoritescount', 'DESC')
      .limit(10)
      .getRawMany();
  }
}
