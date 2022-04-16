import { SCHEDULER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import { InjectQueue, Processor } from '@nestjs/bull';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { RedisService } from 'nestjs-redis';
import {
  FETCH_BATTLE_TRANSACTIONS,
  MIGRATE_BATTLES,
} from '../shared/queue/constants';

@Processor(SCHEDULER_QUEUE)
export class SchedulerService {
  constructor(
    @InjectQueue(SCHEDULER_QUEUE) private queue: Queue,
    private redisService: RedisService,
  ) {}

  async addJob<T>(jobName: string, data?: T, delay = 0, jobId?: string) {
    try {
      if (!!jobId) {
        await this.queue.add(jobName, data, {
          jobId,
          removeOnComplete: true,
          removeOnFail: true,
          delay,
        });
      } else {
        await this.queue.add(jobName, data, {
          removeOnComplete: true,
          removeOnFail: true,
          delay,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  async onModuleInit() {
    const client = this.redisService.getClient('DEFAULT_CLIENT');
    await client.flushall();
    await client.flushdb();

    this.addJob(MIGRATE_BATTLES, {}, 5000, MIGRATE_BATTLES);
    this.addJob(FETCH_BATTLE_TRANSACTIONS, {}, 5000, FETCH_BATTLE_TRANSACTIONS);
  }

  @Cron('0 */10 * * * *')
  every10minutes() {
    this.addJob(FETCH_BATTLE_TRANSACTIONS, {}, 0, FETCH_BATTLE_TRANSACTIONS);
  }
}
