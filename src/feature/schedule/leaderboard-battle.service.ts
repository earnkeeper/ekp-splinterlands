import { logger } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { ApiService } from '../../shared/api';
import { BattleRepository, BATTLE_VERSION } from '../../shared/db';
import { MapperService } from '../../shared/game';

@Injectable()
export class LeaderboardBattleService {
  constructor(
    private battleRepository: BattleRepository,
    private apiService: ApiService,
  ) {}

  async fetchLeaderboardBattles() {
    const settings = await this.apiService.fetchSettings();

    const currentSeason = settings.season.id;

    const leaderPlayerNames = [];

    for (let i = 0; i < 5; i++) {
      const leagueLeaderboard = await this.apiService.fetchLeaderboard(
        currentSeason,
        i,
      );

      leaderPlayerNames.push(
        ...leagueLeaderboard.leaderboard.map((it) => it.player),
      );
    }

    const uniqPlayerNames = _.uniq(leaderPlayerNames);

    await Promise.all(
      uniqPlayerNames.map(async (playerName) => {
        const playerBattles = await this.apiService.fetchPlayerBattles(
          playerName,
        );

        if (
          !Array.isArray(playerBattles?.battles) ||
          playerBattles.battles.length === 0
        ) {
          return;
        }

        const battles = MapperService.mapBattlesFromPlayer(
          playerBattles.battles,
          BATTLE_VERSION,
        );

        await this.battleRepository.save(battles);

        logger.log(
          `Saved ${battles?.length} battles from player ${playerName} to the db.`,
        );
      }),
    );
  }
}
