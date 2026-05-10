import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TrpcRouter } from './trpc/trpc.router';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const trpcRouter = app.get(TrpcRouter);
  trpcRouter.applyMiddleware(app);

  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter?.getInstance?.();

  if (expressApp) {
    expressApp.get('/trpc/hello', (_req, res) => res.status(200).json({ ok: true }));
    expressApp.get('/health', (_req, res) => res.status(200).send('ok'));
  }

  const port = process.env.PORT || 4000;
  console.log(`Starting application on port ${port}`);
  await app.listen(port);
  console.log(`Application started successfully on port ${port}`);
}
bootstrap();
