import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('products/:productId')
  list(@Param('productId') productId: string) {
    return this.recommendationsService.listForProduct(productId);
  }

  @Post('admin/upsert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  upsert(
    @Body()
    body: {
      sourceProductId: string;
      targetProductId: string;
      score: number;
      reason?: string;
    },
  ) {
    return this.recommendationsService.upsert(
      body.sourceProductId,
      body.targetProductId,
      body.score,
      body.reason,
    );
  }
}
