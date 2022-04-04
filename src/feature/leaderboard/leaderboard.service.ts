import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { ApiService, LeaderboardDto, SettingsDto } from '../../shared/api';
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

    const settings: SettingsDto = await this.apiService.fetchSettings();

    return this.mapDocuments(leaderboardDto, selectedCurrency, settings, form);
  }

  async mapDocuments(
    leaderboardDto: LeaderboardDto,
    currency: CurrencyDto,
    settings: SettingsDto,
    form: LeaderboardForm,
  ) {
    const now = moment().unix();

    const prizes = settings.leaderboard_prizes[form.leagueName];

    let conversionRate = 1;

    const prices = await this.coingeckoService.latestPricesOf(
      ['dark-energy-crystals'],
      currency.id,
    );

    conversionRate = prices[0].price;

    const documents: LeaderboardDocument[] = leaderboardDto.leaderboard.map(
      (leader) => {
        const reward = prizes[leader.rank - 1];

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
          reward: !!reward ? reward * 2000 : undefined,
          rewardFiat: !!reward ? reward * 2000 * conversionRate : undefined,
          wins: leader.wins,
        };
      },
    );

    return documents;
  }
}
