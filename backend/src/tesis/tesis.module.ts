import { Module } from '@nestjs/common';
import { TesisService } from './tesis.service';

@Module({
  providers: [TesisService],
  exports: [TesisService],
})
export class TesisModule {}
