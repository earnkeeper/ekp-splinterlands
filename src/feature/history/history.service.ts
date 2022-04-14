import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { ApiService } from '../../shared/api';
import { Battle, BATTLE_VERSION } from '../../shared/db';
import { CardMapper, CardService, SettingsMapper } from '../../shared/game';
import { HistoryForm } from '../../util';
import { HistoryDocument } from './ui/history.document';

@Injectable()
export class HistoryService {
  constructor(
    private apiService: ApiService,
    private cardService: CardService,
  ) {}

  async getHistoryDocuments(form: HistoryForm): Promise<HistoryDocument[]> {
    const response = await this.apiService.fetchPlayerBattles(form.playerName);

    const cardDetailsMap = await this.cardService.getAllCardTemplates();

    const battles = SettingsMapper.mapBattlesFromPlayer(
      response.battles,
      cardDetailsMap,
      BATTLE_VERSION,
      moment(),
    );

    return this.mapDocuments(battles, form);
  }

  async mapDocuments(playerBattles: Battle[], form: HistoryForm) {
    const now = moment().unix();
    const documents: HistoryDocument[] = playerBattles.map((battle) => {
      const opponentName =
        battle.players[0].name === form.playerName
          ? battle.players[1].name
          : battle.players[0].name;

      const myInitialRating =
        battle.players[0].name === form.playerName
          ? battle.players[0].initial_rating
          : battle.players[1].initial_rating;

      const myFinalRating =
        battle.players[0].name === form.playerName
          ? battle.players[0].final_rating
          : battle.players[1].final_rating;

      const opponentInitialRating =
        battle.players[0].name === form.playerName
          ? battle.players[1].initial_rating
          : battle.players[0].initial_rating;

      let result: string;

      if (battle.winner === 'DRAW') {
        result = 'Draw';
      } else if (battle.winner === form.playerName) {
        result = 'Win';
      } else {
        result = 'Loss';
      }

      const myColor =
        battle.players[0].name === form.playerName
          ? battle.team1.color
          : battle.team2.color;
      const opponentColor =
        battle.players[0].name === form.playerName
          ? battle.team2.color
          : battle.team1.color;

      const document: HistoryDocument = {
        id: battle.id,
        updated: now,
        leagueName: SettingsMapper.mapToLeagueName(myInitialRating),
        manaCap: battle.manaCap,
        myFinalRating,
        mySplinter: CardMapper.mapToSplinter(myColor),
        opponentSplinter: CardMapper.mapToSplinter(opponentColor),
        opponentInitialRating,
        opponentName,
        result,
        rulesets: battle.rulesets,
        timestamp: battle.timestamp,
      };

      return document;
    });

    return documents;
  }
}
