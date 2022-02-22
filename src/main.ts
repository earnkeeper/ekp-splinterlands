import { runCluster, SocketApp } from '@earnkeeper/ekp-sdk-nestjs';
import { WorkerApp } from './worker.app';

runCluster(SocketApp, WorkerApp);
