import { SCHEDULER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import { InjectQueue, Processor } from '@nestjs/bull';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { RedisService } from 'nestjs-redis';
import {
  FETCH_BATTLE_TRANSACTIONS,
  FETCH_IGN_BATTLES,
  FETCH_LEADER_BATTLES,
  GROUP_CARDS,
  MIGRATE_BATTLES,
} from '../shared/queue/constants';

@Processor(SCHEDULER_QUEUE)
export class SchedulerService {
  constructor(
    @InjectQueue(SCHEDULER_QUEUE) private queue: Queue,
    private redisService: RedisService,
  ) {}

  async addJob<T>(jobName: string, data?: T, delay = 0, jobId?: string) {
    return;

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
    this.addJob(GROUP_CARDS, undefined, 5000, GROUP_CARDS);
    this.addJob(FETCH_IGN_BATTLES, {}, 5000, FETCH_IGN_BATTLES);
    this.addJob(FETCH_LEADER_BATTLES, { leagueNumber: 0 }, 5000, undefined);
    this.addJob(FETCH_LEADER_BATTLES, { leagueNumber: 1 }, 5000, undefined);
    this.addJob(FETCH_LEADER_BATTLES, { leagueNumber: 2 }, 5000, undefined);
    this.addJob(FETCH_LEADER_BATTLES, { leagueNumber: 3 }, 5000, undefined);
    this.addJob(FETCH_LEADER_BATTLES, { leagueNumber: 4 }, 5000, undefined);
  }

  @Cron('0 * * * * *')
  everyminute() {
    this.addJob(FETCH_BATTLE_TRANSACTIONS, {}, 0, FETCH_BATTLE_TRANSACTIONS);
  }

  @Cron('0 5,15,25,35,45,55 * * * *')
  every10minutes() {
    this.addJob(FETCH_IGN_BATTLES, {}, 5000, FETCH_IGN_BATTLES);
    this.addJob(GROUP_CARDS, undefined, 0, GROUP_CARDS);
  }

  @Cron('0 0 * * * *')
  everyHourPlus0() {
    this.addJob(FETCH_LEADER_BATTLES, { leagueNumber: 0 });
  }

  @Cron('0 10 * * * *')
  everyHourPlus10() {
    this.addJob(FETCH_LEADER_BATTLES, { leagueNumber: 1 });
  }

  @Cron('0 20 * * * *')
  everyHourPlus20() {
    this.addJob('FETCH_LEADER_BATTLES', { leagueNumber: 2 });
  }

  @Cron('0 30 * * * *')
  everyHourPlus30() {
    this.addJob(FETCH_LEADER_BATTLES, { leagueNumber: 3 });
  }

  @Cron('0 40 * * * *')
  everyHourPlus40() {
    this.addJob(FETCH_LEADER_BATTLES, { leagueNumber: 4 });
  }
}
