import {
  ApmService,
  logger,
  WorkerService,
  WORKER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import _ from 'lodash';
import { SplinterlandsApiService } from '../../shared/api/api.service';
import { mapBattles } from '../../util';
import { BattleRepository } from '../../shared/db/battle/battle.repository';

export const DEFAULT_START_BLOCK = 61900134; // 2022-02-17
export const DEFAULT_LIMIT = 1000;
export const BATTLE_JOB = 'BATTLE_JOB';
export const BATTLE_JOB_INTERVAL = 5000;

type BattleJobParams = Readonly<{
  limit: number;
}>;

@Processor(WORKER_QUEUE)
export class BattleScheduleService {
  constructor(
    private apmService: ApmService,
    private battleRepository: BattleRepository,
    private splinterlandsApiService: SplinterlandsApiService,
    private workerService: WorkerService,
  ) {}

  async onModuleInit() {
    await this.queueBattleJob({ limit: DEFAULT_LIMIT });
  }

  private async queueBattleJob(params: BattleJobParams, delay = 1000) {
    await this.workerService.addJob(BATTLE_JOB, params, {
      jobId: BATTLE_JOB,
      delay,
    });
  }

  @OnQueueCompleted()
  async processBattleJobCompleted(job: Job<BattleJobParams>) {
    await this.queueBattleJob(job.data, BATTLE_JOB_INTERVAL);
  }

  @Process(BATTLE_JOB)
  async processBattleJob(job: Job<BattleJobParams>) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    try {
      await this.fetchBattles(job.data.limit);
    } catch (error) {
      this.apmService.captureError(error);

      console.error(error);
    }
  }

  async fetchBattles(limit: number) {
    const lastBattle = await this.battleRepository.findLatestByBlockNumber();

    let lastBlockNumber = lastBattle?.blockNumber;

    if (!lastBlockNumber) {
      lastBlockNumber = DEFAULT_START_BLOCK;
    }

    while (true) {
      const transactions =
        await this.splinterlandsApiService.fetchBattleTransactions(
          lastBlockNumber,
          limit,
        );

      if (!transactions || transactions.length === 0) {
        break;
      }

      const firstTransaction = _.chain(transactions).minBy('block_num').value();
      const lastTransaction = _.chain(transactions).maxBy('block_num').value();

      const battles = mapBattles(transactions);

      logger.debug(
        `Fetched ${transactions?.length} battles from ${firstTransaction.created_date} (${firstTransaction.block_num}) to ${lastTransaction.created_date} (${lastTransaction.block_num})`,
      );

      lastBlockNumber = lastTransaction.block_num;

      if (battles.length === 0) {
        continue;
      }

      await this.battleRepository.save(battles);

      if (transactions.length < limit) {
        break;
      }
    }
  }
}
