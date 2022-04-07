import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { ApiService, HistoryDto } from '../../shared/api';
import { MapperService } from '../../shared/game/services/mapper.service';
import { HistoryForm } from '../../util';
import { HistoryDocument } from './ui/history.document';

@Injectable()
export class HistoryService {
  constructor(private apiService: ApiService) {}

  async getHistoryDocuments(form: HistoryForm): Promise<HistoryDocument[]> {
    const historyDto = await this.apiService.fetchHistory(form.playerName);

    return this.mapDocuments(historyDto, form);
  }

  async mapDocuments(historyDto: HistoryDto, form: HistoryForm) {
    const now = moment().unix();
    const documents: HistoryDocument[] = historyDto.battles.map((battle) => {
      const opponentName =
        battle.player_1 === form.playerName ? battle.player_2 : battle.player_1;

      const myInitialRating =
        battle.player_1 === form.playerName
          ? battle.player_1_rating_initial
          : battle.player_2_rating_initial;

      const myFinalRating =
        battle.player_1 === form.playerName
          ? battle.player_1_rating_final
          : battle.player_2_rating_final;

      const opponentInitialRating =
        battle.player_1 === form.playerName
          ? battle.player_2_rating_initial
          : battle.player_1_rating_initial;

      const result = battle.winner === form.playerName ? 'Win' : 'Loss';

      const currentStreak = result === 'Loss' ? 0 : battle.current_streak;

      return {
        id: battle.id,
        updated: now,
        opponentName,
        myFinalRating,
        opponentInitialRating,
        result,
        currentStreak,
        timestamp: moment(battle.created_date).unix(),
        manaCap: battle.mana_cap,
        matchType: battle.match_type,
        ruleSet: battle.ruleset,
        leagueName: MapperService.mapLeagueName(myInitialRating),
      };
    });

    return documents;
  }
}
