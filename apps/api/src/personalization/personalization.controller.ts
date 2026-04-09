import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PersonalizationService } from './personalization.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('personalization')
export class PersonalizationController {
  constructor(
    private readonly personalizationService: PersonalizationService,
  ) {}

  @Post('profile')
  @Roles('customer', 'seller', 'admin')
  profile(
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      preferredCategories: string;
      priceBand?: string;
      affinityTags?: string;
    },
  ) {
    return this.personalizationService.upsertProfile(
      user.userId,
      body.preferredCategories,
      body.priceBand,
      body.affinityTags,
    );
  }

  @Get('recommendations')
  @Roles('customer', 'seller', 'admin')
  recommendations(@CurrentUser() user: { userId: string }) {
    return this.personalizationService.recommendations(user.userId);
  }
}
