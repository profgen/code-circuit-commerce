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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApplySellerDto } from './dto/sellers.dto';
import { SellersService } from './sellers.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('apply')
  @Roles('customer')
  apply(@CurrentUser() user: { userId: string }, @Body() body: ApplySellerDto) {
    return this.sellersService.apply(user.userId, body);
  }

  @Get('pending')
  @Roles('admin')
  listPending() {
    return this.sellersService.listPending();
  }

  @Patch(':id/approve')
  @Roles('admin')
  approve(
    @Param('id') sellerProfileId: string,
    @CurrentUser() admin: { userId: string },
  ) {
    return this.sellersService.approve(sellerProfileId, admin.userId);
  }
}
