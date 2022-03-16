import {
  ApmService,
  logger,
  WorkerService,
  WORKER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { BattlePollService } from './battle-poll.service';
import { CardPollService } from './card-poll.service';

export const BATTLE_JOB = 'BATTLE_JOB';
export const BATTLE_JOB_INTERVAL = 60000;

export const BATTLE_PAGE_SIZE = 1000;

export const CARD_PAGE_SIZE = 20000;
export const CARD_MAX_DAYS_TO_KEEP = 14;

@Processor(WORKER_QUEUE)
export class ScheduleController {
  constructor(
    private apmService: ApmService,
    private battlePollService: BattlePollService,
    private cardPollService: CardPollService,
    private workerService: WorkerService,
  ) {}

  async onModuleInit() {
    await this.queueBattlePollJob();
  }

  private async queueBattlePollJob(delay = 1000) {
    await this.workerService.addJob(BATTLE_JOB, undefined, {
      jobId: BATTLE_JOB,
      removeOnComplete: true,
      removeOnFail: true,
      delay,
    });
  }

  @Process(BATTLE_JOB)
  async processBattleJob() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    try {
      logger.log(`Battle Poll Started`);

      await this.battlePollService.fetchBattles(BATTLE_PAGE_SIZE);

      logger.log(`Card Poll Started`);

      await this.cardPollService.processCards(
        CARD_MAX_DAYS_TO_KEEP,
        CARD_PAGE_SIZE,
      );

      logger.log(`Schedule Complete`);
    } catch (error) {
      this.apmService.captureError(error);

      console.error(error);
    }
  }

  @OnQueueCompleted()
  async processBattleJobCompleted(job: Job<any>) {
    if (job.name === BATTLE_JOB) {
      await this.queueBattlePollJob(BATTLE_JOB_INTERVAL);
    }
  }
}
