import { Module } from '@nestjs/common';
import { TrpcService } from './trpc/trpc.service';
import { TrpcRouter } from './trpc/trpc.router';
import { PracticasModule } from './practicas/practicas.module';
import { DatabaseModule } from './database/database.module';
import { TesisModule } from './tesis/tesis.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [DatabaseModule, PracticasModule, TesisModule, ReportsModule],
  controllers: [],
  providers: [TrpcService, TrpcRouter],
})
export class AppModule {}
