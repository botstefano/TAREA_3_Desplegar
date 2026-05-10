import { Module } from '@nestjs/common';
import { PracticasService } from './practicas.service';

@Module({
  providers: [PracticasService],
  exports: [PracticasService],
})
export class PracticasModule {}
