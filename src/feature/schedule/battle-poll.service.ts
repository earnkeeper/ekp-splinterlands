import { logger, WORKER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import { Processor } from '@nestjs/bull';
import _ from 'lodash';
import { ApiService } from '../../shared/api/api.service';
import { BattleRepository } from '../../shared/db/battle/battle.repository';
import { MapperService } from '../../shared/game';

export const DEFAULT_START_BLOCK = 62209454; // 2022-02-28T09:17:42

@Processor(WORKER_QUEUE)
export class BattlePollService {
  constructor(
    private battleRepository: BattleRepository,
    private splinterlandsApiService: ApiService,
  ) {}

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

      const battles = MapperService.mapBattles(transactions);

      logger.debug(
        `Fetched ${transactions?.length} transactions from ${firstTransaction.created_date} (${firstTransaction.block_num}) to ${lastTransaction.created_date} (${lastTransaction.block_num})`,
      );

      lastBlockNumber = lastTransaction.block_num;

      if (battles.length === 0) {
        continue;
      }

      await this.battleRepository.save(battles);

      logger.debug(`Saved ${battles?.length} battles to the db`);

      if (transactions.length < limit) {
        break;
      }
    }
  }
}
