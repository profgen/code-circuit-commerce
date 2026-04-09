import { Module } from '@nestjs/common';
import { PlatformopsModule } from '../platformops/platformops.module';
import { ReliabilityController } from './reliability.controller';

@Module({
  imports: [PlatformopsModule],
  controllers: [ReliabilityController],
})
export class ReliabilityModule {}
