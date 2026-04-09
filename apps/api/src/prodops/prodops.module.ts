import { Module } from '@nestjs/common';
import { PlatformopsModule } from '../platformops/platformops.module';
import { ProdopsController } from './prodops.controller';

@Module({
  imports: [PlatformopsModule],
  controllers: [ProdopsController],
})
export class ProdopsModule {}
