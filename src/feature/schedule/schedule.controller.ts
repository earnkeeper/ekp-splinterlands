import {
  ApmService,
  WorkerService,
  WORKER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { BattlePollService } from './battle-poll.service';

export const BATTLE_JOB = 'BATTLE_JOB';
export const BATTLE_JOB_INTERVAL = 5000;
export const DEFAULT_BATTLE_POLL_PAGE_SIZE = 1000;

@Processor(WORKER_QUEUE)
export class ScheduleController {
  constructor(
    private apmService: ApmService,
    private battlePollService: BattlePollService,
    private workerService: WorkerService,
  ) {}

  async onModuleInit() {
    await this.queueBattlePollJob();
  }

  private async queueBattlePollJob(delay = 1000) {
    await this.workerService.addJob(
      BATTLE_JOB,
      { limit: DEFAULT_BATTLE_POLL_PAGE_SIZE },
      {
        jobId: BATTLE_JOB,
        removeOnComplete: true,
        removeOnFail: true,
        delay,
      },
    );
  }

  @Process(BATTLE_JOB)
  async processBattleJob(job: Job<BattleJobParams>) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    try {
      await this.battlePollService.fetchBattles(job.data.limit);
    } catch (error) {
      this.apmService.captureError(error);

      console.error(error);
    }
  }

  @OnQueueCompleted()
  async processBattleJobCompleted(job: Job<BattleJobParams>) {
    if (job.name === BATTLE_JOB) {
      await this.queueBattlePollJob(BATTLE_JOB_INTERVAL);
    }
  }
}

type BattleJobParams = Readonly<{
  limit: number;
}>;
