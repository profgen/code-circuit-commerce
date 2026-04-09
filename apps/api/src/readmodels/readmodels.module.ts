import { Module } from '@nestjs/common';
import { ReadmodelsController } from './readmodels.controller';
import { ReadmodelsService } from './readmodels.service';

@Module({
  controllers: [ReadmodelsController],
  providers: [ReadmodelsService],
})
export class ReadmodelsModule {}
