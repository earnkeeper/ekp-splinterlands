import { Cluster } from '@earnkeeper/ekp-sdk-nestjs';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

const bootstrap = async () => {
  const app = await NestFactory.create(WorkerModule);
  app.enableShutdownHooks();
  await app.init();
};

Cluster.register(16, bootstrap);
