import {
  Controller,
  Post,
  Param,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';
import { UserRole } from '../../shared/constants/enum';
import { GetUser } from '../../core/decorator/get-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // USER → PAY ORDER
  @Post('order/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  payForOrder(
    @Param('id') orderId: string,
    @GetUser('id') userId: string,
  ) {
    return this.paymentsService.createPaymentIntent(orderId, userId);
  }

  // USER → MY PAYMENTS
  @Get('my')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  myPayments(@GetUser('id') userId: string) {
    return this.paymentsService.getUserPayments(userId);
  }

}
