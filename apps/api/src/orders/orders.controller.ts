import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CancelOrderDto,
  CreateReturnRequestDto,
  CreateRefundRequestDto,
  ResolveReturnRequestDto,
  ResolveRefundDto,
  ShipmentEventDto,
} from './dto/orders.dto';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles('customer', 'seller', 'admin')
  list(@CurrentUser() user: { userId: string }) {
    return this.ordersService.listByUser(user.userId);
  }

  @Get('seller')
  @Roles('seller')
  listSellerOrders(@CurrentUser() user: { userId: string }) {
    return this.ordersService.listForSeller(user.userId);
  }

  @Patch(':id/accept')
  @Roles('seller')
  acceptOrder(
    @CurrentUser() user: { userId: string },
    @Param('id') orderId: string,
  ) {
    return this.ordersService.transitionForSeller(
      user.userId,
      orderId,
      OrderStatus.ACCEPTED,
    );
  }

  @Patch(':id/pack')
  @Roles('seller')
  packOrder(
    @CurrentUser() user: { userId: string },
    @Param('id') orderId: string,
  ) {
    return this.ordersService.transitionForSeller(
      user.userId,
      orderId,
      OrderStatus.PACKED,
    );
  }

  @Patch(':id/ship')
  @Roles('seller')
  shipOrder(
    @CurrentUser() user: { userId: string },
    @Param('id') orderId: string,
  ) {
    return this.ordersService.transitionForSeller(
      user.userId,
      orderId,
      OrderStatus.SHIPPED,
    );
  }

  @Post(':id/shipment-events')
  @Roles('seller')
  addShipmentEvent(
    @CurrentUser() user: { userId: string },
    @Param('id') orderId: string,
    @Body() body: ShipmentEventDto,
  ) {
    return this.ordersService.addShipmentEvent(
      user.userId,
      orderId,
      body.status,
      body.location,
      body.note,
    );
  }

  @Get(':id/tracking')
  @Roles('customer', 'seller', 'admin')
  tracking(
    @CurrentUser() user: { userId: string },
    @Param('id') orderId: string,
  ) {
    return this.ordersService.getTrackingTimeline(user.userId, orderId);
  }

  @Patch(':id/deliver')
  @Roles('seller', 'admin')
  deliver(@Param('id') orderId: string) {
    return this.ordersService.markDelivered(orderId);
  }

  @Patch(':id/cancel')
  @Roles('customer', 'seller', 'admin')
  cancelOrder(
    @CurrentUser() user: { userId: string },
    @Param('id') orderId: string,
    @Body() body: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(user.userId, orderId, body.reason);
  }

  @Post(':id/refund-requests')
  @Roles('customer', 'seller', 'admin')
  requestRefund(
    @CurrentUser() user: { userId: string },
    @Param('id') orderId: string,
    @Body() body: CreateRefundRequestDto,
  ) {
    return this.ordersService.createRefundRequest(
      user.userId,
      orderId,
      body.reason,
    );
  }

  @Post(':id/return-requests')
  @Roles('customer', 'seller', 'admin')
  requestReturn(
    @CurrentUser() user: { userId: string },
    @Param('id') orderId: string,
    @Body() body: CreateReturnRequestDto,
  ) {
    return this.ordersService.createReturnRequest(
      user.userId,
      orderId,
      body.reason,
    );
  }

  @Get('admin/refunds/open')
  @Roles('admin')
  listOpenRefunds() {
    return this.ordersService.listOpenRefunds();
  }

  @Get('admin/returns/open')
  @Roles('admin')
  listOpenReturns() {
    return this.ordersService.listOpenReturns();
  }

  @Patch('admin/refunds/:id/approve')
  @Roles('admin')
  approveRefund(
    @CurrentUser() user: { userId: string },
    @Param('id') refundId: string,
    @Body() body: ResolveRefundDto,
  ) {
    return this.ordersService.resolveRefund(
      refundId,
      user.userId,
      true,
      body.adminNote,
    );
  }

  @Patch('admin/refunds/:id/reject')
  @Roles('admin')
  rejectRefund(
    @CurrentUser() user: { userId: string },
    @Param('id') refundId: string,
    @Body() body: ResolveRefundDto,
  ) {
    return this.ordersService.resolveRefund(
      refundId,
      user.userId,
      false,
      body.adminNote,
    );
  }

  @Patch('admin/returns/:id/approve')
  @Roles('admin')
  approveReturn(
    @Param('id') returnId: string,
    @Body() body: ResolveReturnRequestDto,
  ) {
    return this.ordersService.resolveReturnRequest(
      returnId,
      true,
      body.adminNote,
    );
  }

  @Patch('admin/returns/:id/reject')
  @Roles('admin')
  rejectReturn(
    @Param('id') returnId: string,
    @Body() body: ResolveReturnRequestDto,
  ) {
    return this.ordersService.resolveReturnRequest(
      returnId,
      false,
      body.adminNote,
    );
  }

  @Get('seller/dashboard/sla')
  @Roles('seller')
  sellerSla(@CurrentUser() user: { userId: string }) {
    return this.ordersService.getSellerSlaDashboard(user.userId);
  }

  @Get('seller/payouts')
  @Roles('seller')
  sellerPayouts(@CurrentUser() user: { userId: string }) {
    return this.ordersService.listSellerPayouts(user.userId);
  }

  @Patch('admin/payouts/:id/mark-paid')
  @Roles('admin')
  markPayoutPaid(@Param('id') payoutId: string) {
    return this.ordersService.markPayoutPaid(payoutId);
  }

  @Get('admin/finance/settlements')
  @Roles('admin')
  settlements(@Query('format') format?: string) {
    if (format === 'csv') {
      return this.ordersService.exportSettlementCsv();
    }
    return this.ordersService.listSettlementEntries();
  }

  @Get('admin/finance/settlements.csv')
  @Roles('admin')
  @Header('Content-Type', 'text/csv')
  async settlementsCsv() {
    return this.ordersService.exportSettlementCsv();
  }
}
