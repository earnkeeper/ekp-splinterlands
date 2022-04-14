import { Injectable } from '@nestjs/common';
import { BattleRepository } from '../../shared/db/battle/battle.repository';
import { BattlesByLeagueDocument } from './ui/stats.document';

@Injectable()
export class StatsService {
  constructor(private battleRepository: BattleRepository) {}

  async getBattlesByLeague(): Promise<BattlesByLeagueDocument[]> {
    const transactionsResult = await this.battleRepository.findBattlesByLeague(
      'transaction',
    );

    const playersResult = await this.battleRepository.findBattlesByLeague(
      'playerHistory',
    );

    console.log(transactionsResult, playersResult);

    return [];
  }
}
