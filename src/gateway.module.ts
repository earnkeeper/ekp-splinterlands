import {
  EkConfigModule,
  EkConfigService,
  SCHEDULER_QUEUE,
  SocketService,
  WORKER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from 'nestjs-redis';
import { SchedulerService } from './scheduler/scheduler.service';

export const MODULE_DEF = {
  imports: [
    EkConfigModule,
    BullModule.forRootAsync({ useClass: EkConfigService }),
    BullModule.registerQueue({ name: WORKER_QUEUE }, { name: SCHEDULER_QUEUE }),
    RedisModule.forRootAsync(EkConfigService.createRedisAsyncOptions()),
    ScheduleModule.forRoot(),
  ],
  providers: [SchedulerService, SocketService],
};

@Module(MODULE_DEF)
export class GatewayModule {}
