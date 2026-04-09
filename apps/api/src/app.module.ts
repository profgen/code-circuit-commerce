import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CartModule } from './cart/cart.module';
import { CatalogModule } from './catalog/catalog.module';
import { CheckoutModule } from './checkout/checkout.module';
import { HealthModule } from './health/health.module';
import { InventoryModule } from './inventory/inventory.module';
import { JobsModule } from './jobs/jobs.module';
import { LogisticsModule } from './logistics/logistics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { SellersModule } from './sellers/sellers.module';
import { SearchModule } from './search/search.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { FraudModule } from './fraud/fraud.module';
import { UsersModule } from './users/users.module';
import { PersonalizationModule } from './personalization/personalization.module';
import { ExperimentsModule } from './experiments/experiments.module';
import { PerfModule } from './perf/perf.module';
import { EventsModule } from './events/events.module';
import { ReadmodelsModule } from './readmodels/readmodels.module';
import { AuditModule } from './audit/audit.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PlatformopsModule } from './platformops/platformops.module';
import { ObservabilityModule } from './observability/observability.module';
import { ReliabilityModule } from './reliability/reliability.module';
import { ProdopsModule } from './prodops/prodops.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AnalyticsModule,
    SearchModule,
    RecommendationsModule,
    FraudModule,
    PersonalizationModule,
    ExperimentsModule,
    PerfModule,
    EventsModule,
    ReadmodelsModule,
    AuditModule,
    PermissionsModule,
    PlatformopsModule,
    ObservabilityModule,
    ReliabilityModule,
    ProdopsModule,
    UsersModule,
    CatalogModule,
    CartModule,
    CheckoutModule,
    InventoryModule,
    LogisticsModule,
    NotificationsModule,
    JobsModule,
    OrdersModule,
    PaymentsModule,
    SellersModule,
    HealthModule,
  ],
})
export class AppModule {}
