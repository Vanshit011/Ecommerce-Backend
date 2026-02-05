import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
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
@Module({
  imports: [
    StripeModule,
    WebhookModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
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
  ],
})
export class AppModule {}
