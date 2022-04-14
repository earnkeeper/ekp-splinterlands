import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { BattleRepository } from '../../shared/db';
import { LEAGUES } from '../../shared/game';
import { BattlesByLeagueDocument } from './ui/battles-by-league.document';
import { BattlesByTimestampDocument } from './ui/battles-by-timestamp.document';

@Injectable()
export class StatsService {
  constructor(private battleRepository: BattleRepository) {}

  async getBattlesByLeague(): Promise<BattlesByLeagueDocument[]> {
    const fromTransactions = await this.battleRepository.findBattlesByLeague(
      'transaction',
    );
    const fromPlayerHistory = await this.battleRepository.findBattlesByLeague(
      'playerHistory',
    );

    const leagueNames = _.chain([...fromTransactions, ...fromPlayerHistory])
      .map((it) => it._id)
      .uniq()
      .value();

    const now = moment().unix();

    const documents: BattlesByLeagueDocument[] = _.chain(leagueNames)
      .sortBy((leagueName) => {
        return LEAGUES.find((it) => it.name === leagueName)?.number;
      })
      .map((leagueName) => {
        const resultFromTransactions = fromTransactions.find(
          (it) => it._id === leagueName,
        );
        const resultFromPlayerHistory = fromPlayerHistory.find(
          (it) => it._id === leagueName,
        );

        const document: BattlesByLeagueDocument = {
          id: leagueName,
          updated: now,
          leagueName,
          fromTransactions: resultFromTransactions?.count ?? 0,
          fromPlayerHistory: resultFromPlayerHistory?.count ?? 0,
        };

        return document;
      })
      .value();

    return documents;
  }

  async getBattlesByTimestamp(): Promise<BattlesByTimestampDocument[]> {
    const fromTransactions = await this.battleRepository.findBattlesByTimestamp(
      'transaction',
    );
    const fromPlayerHistory =
      await this.battleRepository.findBattlesByTimestamp('playerHistory');

    const days = _.chain([...fromTransactions, ...fromPlayerHistory])
      .map((it) => it._id)
      .uniq()
      .value();

    const now = moment().unix();

    const documents: BattlesByTimestampDocument[] = days.map((dayOfYear) => {
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
    });

    return documents;
  }
}
