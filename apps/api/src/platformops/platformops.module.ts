import { Module } from '@nestjs/common';
import { PlatformopsController } from './platformops.controller';
import { PlatformopsService } from './platformops.service';

@Module({
  controllers: [PlatformopsController],
  providers: [PlatformopsService],
  exports: [PlatformopsService],
})
export class PlatformopsModule {}
