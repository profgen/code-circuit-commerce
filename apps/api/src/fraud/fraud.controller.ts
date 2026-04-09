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
import { FraudService } from './fraud.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fraud')
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Post('assess/:orderId')
  @Roles('admin', 'seller', 'customer')
  assess(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.fraudService.assessOrder(orderId, user.userId);
  }

  @Get('admin/queue')
  @Roles('admin')
  queue() {
    return this.fraudService.queue();
  }

  @Patch('admin/review/:id')
  @Roles('admin')
  review(@Param('id') id: string, @Body() body: { approved: boolean }) {
    return this.fraudService.review(id, body.approved);
  }
}
