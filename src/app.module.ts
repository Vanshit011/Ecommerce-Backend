import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { typeOrmConfig } from './config/typeorm.config';
import { throttlerConfig } from './config/throttler.config';
import { validationSchema } from './config/env.validation';
import { UsersModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import { MailModule } from './module/mail/mail.module';
import { ProductModule } from './module/product/product.module';
import { CategoriesModule } from './module/categories/categories.module';
import { FavoriteModule } from './module/favorite/favorite.module';
import { ProfileModule } from './module/profile/profile.module';
import { CartModule } from './module/cart/cart.module';
import { AddressModule } from './module/address/address.module';
import { StripeModule } from './core/stripe/stripe.module';
import { OrderModule } from './module/order/order.module';
import { WebhookModule } from './module/webhook/webhook.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentsModule } from './module/payments/payments.module';
import { SeederModule } from './seeder/seeder.module';
import { ErrorLoggingInterceptor } from './core/interceptor/error-logging.interceptor';
import { HealthModule } from './health/health.module';
import { RedisModule } from './core/redis/redis.module';
import { RmqModule } from './core/rmq/rmq.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { DashboardModule } from './module/dashboard/dashboard.module';
import { ReviewModule } from './module/review/review.module';
import { CouponModule } from './module/coupon/coupon.module';
import { AiModule } from './module/ai/ai.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      envFilePath: [
        `env/.env.${process.env.NODE_ENV || 'development'}`,
        'env/.env.local',
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    RedisModule,
    StripeModule,
    WebhookModule,
    HealthModule,
    UsersModule,
    AuthModule,
    MailModule,
    ProductModule,
    CategoriesModule,
    FavoriteModule,
    ProfileModule,
    CartModule,
    AddressModule,
    OrderModule,
    PaymentsModule,
    SeederModule,
    EventsModule,
    DashboardModule,
    ReviewModule,
    CouponModule,
    AiModule,
    RmqModule,
    ThrottlerModule.forRoot(throttlerConfig),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorLoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
