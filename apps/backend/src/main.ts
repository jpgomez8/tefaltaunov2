import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { configureHttp } from './config/http.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  configureHttp(app);
  app.enableShutdownHooks();
  await app.listen(config.getOrThrow<number>('PORT'));
}
await bootstrap();
