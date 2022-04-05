import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { PlayerHistoryDto } from 'src/shared/api/dto/player-histroy.dto';
import { PlayerHistoryForm } from 'src/util/forms/player-history-form';
import { ApiService, LeaderboardDto, SettingsDto } from '../../shared/api';
import { LEADERBOARD_LEAGUES } from '../../util/constants';
import { PlayerhistoryDocument } from './ui/playerhistory.document';

@Injectable()
export class PlayerhistoryService {
  constructor(
    private coingeckoService: CoingeckoService,
    private apiService: ApiService,
  ) {}

  async getPlayerHistoryDocuments(
    form: PlayerHistoryForm,
    selectedCurrency: CurrencyDto,
  ): Promise<PlayerhistoryDocument[]> {
    const player = LEADERBOARD_LEAGUES.find(
      (it) => it.name === form.playername,
    ).id;

    const playerHistoryDto = await this.apiService.fetchPlayerHistory(
      form.playername,
    );

    const settings: SettingsDto = await this.apiService.fetchSettings();

    return this.mapDocuments(playerHistoryDto , selectedCurrency, settings, form);
  }

  async mapDocuments(
    playerHistoryDto: PlayerHistoryDto,
    currency: CurrencyDto,
    settings: SettingsDto,
    form: PlayerHistoryForm,
  ) {
    const now = moment().unix();

    const prizes = settings.leaderboard_prizes[form.playername];

    let conversionRate = 1;

    const prices = await this.coingeckoService.latestPricesOf(
      ['dark-energy-crystals'],
      currency.id,
    );

    conversionRate = prices[0].price;

    const documents: PlayerhistoryDocument[] = playerHistoryDto.battles.map(
      (battles) => {
        

        return {
          
          id: battles.id,
          created_date: battles.created_date,
          current_streak: battles.current_streak,
          mana_cap: battles.mana_cap,
          match_type : battles.match_type,
          player_1: battles.player_1,
          player_1_rating_final: battles.player_1_rating_final,
          player_1_rating_initial : battles.player_1_rating_initial,
          player_2: battles.player_2,
          player_2_rating_final : battles.player_2_rating_final,
          player_2_rating_initial: battles.player_2_rating_initial,
          rshares: battles.rshares,
          ruleset: battles.ruleset,
          winner : battles.winner,
        };
      },
    );

    return documents;
  }
}
