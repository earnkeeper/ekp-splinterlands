import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { LeaderboardDto } from '../../shared/api';
import { ApiService } from '../../shared/api/api.service';
import { LeaderboardForm } from '../../util';
import { LEADERBOARD_LEAGUES } from '../../util/constants';
import { LeaderboardDocument } from './ui/leaderboard.document';

@Injectable()
export class LeaderboardService {
  constructor(
    private coingeckoService: CoingeckoService,
    private apiService: ApiService,
  ) {}

  async getLeaderDocuments(
    form: LeaderboardForm,
    selectedCurrency: CurrencyDto,
  ): Promise<LeaderboardDocument[]> {
    const leagueId = LEADERBOARD_LEAGUES.find(
      (it) => it.name === form.leagueName,
    ).id;

    const leaderboardDto = await this.apiService.fetchLeaderboard(
      form.season,
      leagueId,
    );

    return this.mapDocuments(leaderboardDto, selectedCurrency);
  }

  async mapDocuments(leaderboardDto: LeaderboardDto, currency: CurrencyDto) {
    const now = moment().unix();

    const documents: LeaderboardDocument[] = leaderboardDto.leaderboard.map(
      (leader) => {
        return {
          id: leader.player,
          updated: now,
          avatarImgUrl: `https://d36mxiodymuqjm.cloudfront.net/website/icons/avatars/avatar_${leader.avatar_id}.png`,
          battles: leader.battles,
          fiatSymbol: currency.symbol,
          guildName: leader.guild_name,
          player: leader.player,
          rank: leader.rank,
          rating: leader.rating,
          reward: undefined,
          rewardFiat: undefined,
          wins: leader.wins,
        };
      },
    );

    return documents;
  }
}
