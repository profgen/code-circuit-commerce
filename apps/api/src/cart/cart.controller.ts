import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/cart.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Roles('customer', 'seller', 'admin')
  getCart(@CurrentUser() user: { userId: string }) {
    return this.cartService.getCart(user.userId);
  }

  @Post('items')
  @Roles('customer', 'seller', 'admin')
  addItem(
    @CurrentUser() user: { userId: string },
    @Body() body: AddCartItemDto,
  ) {
    return this.cartService.addItem(user.userId, body);
  }

  @Delete('items/:productId')
  @Roles('customer', 'seller', 'admin')
  removeItem(
    @CurrentUser() user: { userId: string },
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(user.userId, productId);
  }
}
