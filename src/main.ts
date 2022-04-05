import { Cluster } from '@earnkeeper/ekp-sdk-nestjs';
import { NestFactory } from '@nestjs/core';
import * as cluster from 'cluster';
import { GatewayModule } from './gateway.module';
import { WorkerModule } from './worker.module';

const bootstrap = async () => {
  if (cluster.default.isPrimary) {
    const app = await NestFactory.create(GatewayModule);
    app.enableShutdownHooks();
    await app.listen(3001);
  } else {
    const app = await NestFactory.create(WorkerModule);
    app.enableShutdownHooks();
    await app.init();
  }
};

Cluster.register(16, bootstrap);
