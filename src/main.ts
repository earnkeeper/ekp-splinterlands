import { runCluster, SocketApp } from '@earnkeeper/ekp-sdk-nestjs';
import { AppModule } from './app.module';

runCluster(SocketApp, AppModule);
