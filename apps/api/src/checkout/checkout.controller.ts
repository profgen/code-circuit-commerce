import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CheckoutService } from './checkout.service';
import { CheckoutInitDto, CreateCouponDto } from './dto/checkout.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('init')
  @Roles('customer', 'seller', 'admin')
  init(@CurrentUser() user: { userId: string }, @Body() body: CheckoutInitDto) {
    return this.checkoutService.initCheckout(user.userId, body);
  }

  @Post('admin/coupons')
  @Roles('admin')
  createCoupon(@Body() body: CreateCouponDto) {
    return this.checkoutService.createCoupon(body);
  }

  @Get('admin/coupons')
  @Roles('admin')
  listCoupons() {
    return this.checkoutService.listCoupons();
  }

  @Patch('admin/coupons/:code/disable')
  @Roles('admin')
  disableCoupon(@Param('code') code: string) {
    return this.checkoutService.disableCoupon(code);
  }
}
