import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TrpcRouter } from './trpc/trpc.router';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  const trpcRouter = app.get(TrpcRouter);
  trpcRouter.applyMiddleware(app);

  const port = process.env.PORT || 4000;
  console.log(`Starting application on port ${port}`);
  await app.listen(port);
  console.log(`Application started successfully on port ${port}`);
}
bootstrap();
