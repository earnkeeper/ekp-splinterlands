import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { HistoryDto } from 'src/shared/api/dto/history.dto';
import { HistoryForm } from 'src/util/forms/history-form';
import { ApiService, LeaderboardDto, SettingsDto } from '../../shared/api';
import { DEFAULT_HISTORY_FORM } from '../../util/constants';
import { HistoryDocument } from './ui/history.document';

@Injectable()
export class HistoryService {
  constructor(
    private coingeckoService: CoingeckoService,
    private apiService: ApiService,
  ) {}

  async getHistoryDocuments(
    form: HistoryForm,
  ): Promise<HistoryDocument[]> {
  
    const historyDto = await this.apiService.fetchHistory(
      form.playerName
    );

    return this.mapDocuments(historyDto, form);
  }

  async mapDocuments(
    historyDto: HistoryDto,
    form: HistoryForm,
  ) {
    const now = moment().unix();
    const documents: HistoryDocument[] = historyDto.battles.map(
      (battles) => {
        return {
          
          id: battles.id,
          createdDate: battles.created_date,
          currentStreak: battles.current_streak,
          manaCap: battles.mana_cap,
          matchType: battles.match_type,
          player1: battles.player_1,
          player1RatingFinal: battles.player_1_rating_final,
          player1RatingInitial : battles.player_1_rating_initial,
          player2: battles.player_2,
          player2RatingFinal : battles.player_2_rating_final,
          player2RatingInitial: battles.player_2_rating_initial,
          rShares: battles.rshares,
          ruleSet: battles.ruleset,
          winner: battles.winner,
        };
      },
    );

    return documents;
  }
}
