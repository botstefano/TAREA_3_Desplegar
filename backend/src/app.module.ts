import { Module } from '@nestjs/common';
import { TrpcService } from './trpc/trpc.service';
import { TrpcRouter } from './trpc/trpc.router';
import { DatabaseModule } from './database/database.module';
import { PracticasModule } from './practicas/practicas.module';
import { TesisModule } from './tesis/tesis.module';
import { ReportsModule } from './reports/reports.module';

// Versión mínima temporal para Railway
@Module({
  imports: [DatabaseModule, PracticasModule, TesisModule, ReportsModule],
  controllers: [],
  providers: [TrpcService, TrpcRouter],
})
export class AppModule {}
