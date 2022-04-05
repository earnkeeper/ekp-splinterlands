import { logger } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { ApiService } from '../../shared/api';
import { BattleRepository, BATTLE_VERSION } from '../../shared/db';
import { MapperService } from '../../shared/game';

export const DEFAULT_START_BLOCK = 62695197; // 2022-03-17T07:29:00

@Injectable()
export class BattlePollService {
  constructor(
    private battleRepository: BattleRepository,
    private apiService: ApiService,
  ) {}

  async upgradeBattles() {
    const oldestAllowed = moment().subtract(14, 'days');

    while (true) {
      const battles = await this.battleRepository.findWithVersionLessThan(
        BATTLE_VERSION,
        oldestAllowed.unix(),
        2000,
      );

      if (battles.length === 0) {
        return;
      }

      for (const battle of battles) {
        if (!battle.rulesets || battle.rulesets.length === 0) {
          battle.rulesets = battle.ruleset.split('|');
        }

        battle.version = BATTLE_VERSION;
      }

      const latest = _.maxBy(battles, 'timestamp');

      await this.battleRepository.save(battles);

      logger.debug(
        `Upgraded ${battles.length} battles, up to ${moment.unix(
          latest.timestamp,
        )}`,
      );
    }
  }

  async fetchBattles(limit: number) {
    const lastBattle = await this.battleRepository.findLatestByBlockNumber();

    let lastBlockNumber = lastBattle?.blockNumber;

    if (!lastBlockNumber) {
      lastBlockNumber = DEFAULT_START_BLOCK;
    }

    while (true) {
      const transactions = await this.apiService.fetchBattleTransactions(
        lastBlockNumber,
        limit,
      );

      if (!transactions || transactions.length === 0) {
        break;
      }

      const firstTransaction = _.chain(transactions).minBy('block_num').value();
      const lastTransaction = _.chain(transactions).maxBy('block_num').value();

      const battles = MapperService.mapBattlesFromTransactions(
        transactions,
        BATTLE_VERSION,
      );

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
