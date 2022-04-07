import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { ApiService, LeaderboardDto, SettingsDto } from '../../shared/api';
import { LEAGUE_GROUPS, MarketService } from '../../shared/game';
import { LeaderboardForm } from '../../util';
import { LeaderboardDocument } from './ui/leaderboard.document';
@Injectable()
export class LeaderboardService {
  constructor(
    private marketService: MarketService,
    private apiService: ApiService,
  ) {}

  async getLeaderDocuments(
    form: LeaderboardForm,
    selectedCurrency: CurrencyDto,
  ): Promise<LeaderboardDocument[]> {
    const leagueId = LEAGUE_GROUPS.find(
      (it) => it.name === form.leagueGroup,
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

    const prizes = settings.leaderboard_prizes[form.leagueGroup];

    const conversionRate = await this.marketService.getConversionRate(
      'dark-energy-crystals',
      currency.id,
    );

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
