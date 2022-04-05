import { Cluster } from '@earnkeeper/ekp-sdk-nestjs';
import { NestFactory } from '@nestjs/core';
import * as cluster from 'cluster';
import { GatewayModule } from './gateway.module';
import { WorkerModule } from './worker.module';

const gatewayBootstrap = async () => {
  const app = await NestFactory.create(GatewayModule);
  app.enableShutdownHooks();
  await app.listen(3001);
};

const workerBootstrap = async () => {
  const app = await NestFactory.create(WorkerModule);
  app.enableShutdownHooks();
  await app.init();
};

switch (process.env.PROCESS_TYPE) {
  case 'GATEWAY':
    Cluster.register(16, gatewayBootstrap);
    break;
  case 'WORKER':
    Cluster.register(16, workerBootstrap);
    break;
  default:
    const combinedBootstrap = async () => {
      if (cluster.default.isPrimary) {
        await gatewayBootstrap();
      } else {
        await workerBootstrap();
      }
    };

    Cluster.register(16, combinedBootstrap);
    break;
}
