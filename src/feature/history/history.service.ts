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
          created_date: battles.created_date,
          current_streak: battles.current_streak,
          mana_cap: battles.mana_cap,
          match_type: battles.match_type,
          player_1: battles.player_1,
          player_1_rating_final: battles.player_1_rating_final,
          player_1_rating_initial : battles.player_1_rating_initial,
          player_2: battles.player_2,
          player_2_rating_final : battles.player_2_rating_final,
          player_2_rating_initial: battles.player_2_rating_initial,
          rshares: battles.rshares,
          ruleset: battles.ruleset,
          winner: battles.winner,
        };
      },
    );

    return documents;
  }
}
