import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TrpcRouter } from './trpc/trpc.router';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  const trpcRouter = app.get(TrpcRouter);
  trpcRouter.applyMiddleware(app);

  const port = process.env.PORT || 4000;
  await app.listen(port);
}
bootstrap();
