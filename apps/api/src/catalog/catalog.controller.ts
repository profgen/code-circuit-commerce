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
import { CatalogService } from './catalog.service';
import {
  CreateSellerProductDto,
  RejectProductDto,
  UpdateSellerProductDto,
} from './dto/catalog-seller.dto';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  listProducts() {
    return this.catalogService.listProducts();
  }

  @Get('products/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.catalogService.getBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('seller/products')
  @Roles('seller')
  listSellerProducts(@CurrentUser() user: { userId: string }) {
    return this.catalogService.listSellerProducts(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('seller/products')
  @Roles('seller')
  createSellerProduct(
    @CurrentUser() user: { userId: string },
    @Body() body: CreateSellerProductDto,
  ) {
    return this.catalogService.createSellerProduct(user.userId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('seller/products/:id')
  @Roles('seller')
  updateSellerProduct(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() body: UpdateSellerProductDto,
  ) {
    return this.catalogService.updateSellerProduct(user.userId, id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/products/moderation')
  @Roles('admin')
  moderationQueue() {
    return this.catalogService.listProductsForModeration();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/products/:id/approve')
  @Roles('admin')
  approveProduct(@Param('id') id: string) {
    return this.catalogService.approveProduct(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/products/:id/reject')
  @Roles('admin')
  rejectProduct(@Param('id') id: string, @Body() body: RejectProductDto) {
    return this.catalogService.rejectProduct(id, body.moderationNote);
  }
}
