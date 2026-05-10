import { Module } from '@nestjs/common';
import { TrpcService } from './trpc/trpc.service';
import { TrpcRouter } from './trpc/trpc.router';

// Versión mínima temporal para Railway
@Module({
  imports: [],
  controllers: [],
  providers: [TrpcService, TrpcRouter],
})
export class AppModule {}
