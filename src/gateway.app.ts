import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

const bootstrap = async () => {
  const app = await NestFactory.create(GatewayModule);
  app.enableShutdownHooks();
  await app.listen(3001);
};

bootstrap();
