import { Module } from '@nestjs/common';
import { PlatformopsModule } from '../platformops/platformops.module';
import { ObservabilityController } from './observability.controller';

@Module({
  imports: [PlatformopsModule],
  controllers: [ObservabilityController],
})
export class ObservabilityModule {}
