import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { BattleRepository } from '../../shared/db';
import { LEAGUES } from '../../shared/game';
import { BattlesByLeagueDocument } from './ui/battles-by-league.document';

@Injectable()
export class StatsService {
  constructor(private battleRepository: BattleRepository) {}

  async getBattlesByLeague(): Promise<BattlesByLeagueDocument[]> {
    const fromTransactions = await this.getResultsFromSource('transaction');

    const fromPlayerHistory = await this.getResultsFromSource('playerHistory');

    return [...fromTransactions, ...fromPlayerHistory];
  }

  private async getResultsFromSource(
    source: string,
  ): Promise<BattlesByLeagueDocument[]> {
    const leaguesMap: Record<string, any> = _.chain(LEAGUES)
      .keyBy('name')
      .value();

    const results = await this.battleRepository.findBattlesByLeague(source);

    return _.chain(results)
      .sortBy((result) => {
        return leaguesMap[result._id].min_rating;
      })
      .map((result) => {
        const leagueName = result._id;
        const minRating = leaguesMap[result._id].min_rating;
        const leagueNumber = leaguesMap[result._id].number;

        const document: BattlesByLeagueDocument = {
          id: `${leagueName}-${source}`,
          minRating,
          leagueNumber,
          leagueName,
          source,
          battles: result.count,
        };

        return document;
      })
      .value();
  }
}
