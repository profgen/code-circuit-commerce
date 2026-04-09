import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PlatformopsService } from '../platformops/platformops.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reliability')
export class ReliabilityController {
  constructor(private readonly service: PlatformopsService) {}

  @Post('admin/apikey')
  @Roles('admin')
  apikey(
    @Body()
    body: {
      name: string;
      keyHash: string;
      ownerUserId?: string;
      scopes: string;
    },
  ) {
    return this.service.createApiKey(body);
  }

  @Post('admin/ratelimit/hit')
  @Roles('admin')
  rateLimit(@Body() body: { bucketKey: string; windowSeconds: number }) {
    return this.service.hitRateLimit(body.bucketKey, body.windowSeconds);
  }

  @Post('admin/abuse')
  @Roles('admin')
  abuse(
    @Body()
    body: {
      actorKey: string;
      signalType: string;
      score: number;
      reason?: string;
    },
  ) {
    return this.service.addAbuseSignal(body);
  }

  @Post('admin/checkout-attempt')
  @Roles('admin')
  checkoutAttempt(
    @Body()
    body: {
      userId: string;
      idempotencyKey: string;
      status: string;
      errorCode?: string;
    },
  ) {
    return this.service.logCheckoutAttempt(body);
  }

  @Post('admin/reconcile')
  @Roles('admin')
  reconcile(
    @Body()
    body: {
      paymentRef: string;
      orderId?: string;
      providerStatus: string;
      internalStatus: string;
      mismatch: boolean;
    },
  ) {
    return this.service.reconcilePayment(body);
  }
}
