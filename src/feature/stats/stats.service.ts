import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { BattleRepository } from '../../shared/db';
import { LEAGUES } from '../../shared/game';
import { BattlesByLeagueDocument } from './ui/battles-by-league.document';
import { BattlesByManaCapDocument } from './ui/battles-by-mana-cap.document';
import { BattlesByTimestampDocument } from './ui/battles-by-timestamp.document';
import { StatsViewBagDocument } from './ui/stats-view-bag.document';

@Injectable()
export class StatsService {
  constructor(private battleRepository: BattleRepository) {}

  async getViewBag(): Promise<StatsViewBagDocument> {
    const [totalBattles, oldestBattle, latestBattle] = await Promise.all([
      this.battleRepository.count(),
      this.battleRepository.findOldest(),
      this.battleRepository.findLatest(),
    ]);

    return {
      id: '0',
      updated: moment().unix(),
      totalBattles,
      oldestBattle: oldestBattle?.timestamp,
      latestBattle: latestBattle?.timestamp,
    };
  }

  async getBattlesByLeague(): Promise<BattlesByLeagueDocument[]> {
    const fromTransactions = await this.battleRepository.groupByLeague(
      'transaction',
    );

    const fromPlayerHistory = await this.battleRepository.groupByLeague(
      'playerHistory',
    );

    const leagueNames = _.chain([...fromTransactions, ...fromPlayerHistory])
      .map((it) => it._id)
      .uniq()
      .value();

    const now = moment().unix();

    const documents: BattlesByLeagueDocument[] = _.chain(leagueNames)
      .sortBy((leagueGroup) => {
        return LEAGUES.find((it) => it.group === leagueGroup)?.number;
      })
      .map((leagueGroup) => {
        const resultFromTransactions = fromTransactions.find(
          (it) => it._id === leagueGroup,
        );
        const resultFromPlayerHistory = fromPlayerHistory.find(
          (it) => it._id === leagueGroup,
        );

        const document: BattlesByLeagueDocument = {
          id: leagueGroup,
          updated: now,
          leagueGroup,
          fromTransactions: resultFromTransactions?.count ?? 0,
          fromPlayerHistory: resultFromPlayerHistory?.count ?? 0,
        };

        return document;
      })
      .value();

    return documents;
  }

  async getBattlesByTimestamp(): Promise<BattlesByTimestampDocument[]> {
    const fromTransactions = await this.battleRepository.groupByTimestamp(
      'transaction',
    );
    const fromPlayerHistory = await this.battleRepository.groupByTimestamp(
      'playerHistory',
    );

    const days = _.chain([...fromTransactions, ...fromPlayerHistory])
      .map((it) => it._id)
      .uniq()
      .value();

    const now = moment().unix();

    const documents: BattlesByTimestampDocument[] = _.chain(days)
      .sort()
      .map((dayOfYear) => {
        const resultFromTransactions = fromTransactions.find(
          (it) => it._id === dayOfYear,
        );
        const resultFromPlayerHistory = fromPlayerHistory.find(
          (it) => it._id === dayOfYear,
        );

        const document: BattlesByTimestampDocument = {
          id: dayOfYear.toString(),
          updated: now,
          timestamp: moment().dayOfYear(dayOfYear).unix(),
          fromTransactions: resultFromTransactions?.count ?? 0,
          fromPlayerHistory: resultFromPlayerHistory?.count ?? 0,
        };

        return document;
      })
      .value();

    return documents;
  }

  async getBattlesByManaCap(): Promise<BattlesByManaCapDocument[]> {
    const fromTransactions = await this.battleRepository.groupByManaCap(
      'transaction',
    );
    const fromPlayerHistory = await this.battleRepository.groupByManaCap(
      'playerHistory',
    );

    const manaCaps = _.chain([...fromTransactions, ...fromPlayerHistory])
      .map((it) => it._id)
      .uniq()
      .value();

    const now = moment().unix();

    const documents: BattlesByManaCapDocument[] = _.chain(manaCaps)
      .sort()
      .map((manaCap) => {
        const resultFromTransactions = fromTransactions.find(
          (it) => it._id === manaCap,
        );
        const resultFromPlayerHistory = fromPlayerHistory.find(
          (it) => it._id === manaCap,
        );

        const document: BattlesByManaCapDocument = {
          id: manaCap.toString(),
          updated: now,
          manaCap,
          fromTransactions: resultFromTransactions?.count ?? 0,
          fromPlayerHistory: resultFromPlayerHistory?.count ?? 0,
        };

        return document;
      })
      .value();

    return documents;
  }
}
