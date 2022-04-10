import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { CardService, CardTemplate } from '../../shared/game';
import { Battle, BattleRepository } from '../../shared/db';
import { BattleDocument } from './ui/battle.document';
import { BattleMapper } from '../../shared/game/mappers/battle.mapper';
import { SettingsMapper } from '../../shared/game/mappers/settings.mapper';

@Injectable()
export class BattlesService {
  constructor(private battleRepository: BattleRepository, private cardService: CardService) { }

  async getBattleDocuments(cardId: string) {
    const battles = await this.battleRepository.findByCardId(cardId, 50);

    const cardTemplatesMap = await this.cardService.getAllCardTemplatesMap();

    return this.mapBattleDocuments(battles, cardTemplatesMap);
  }

  mapBattleDocuments(battles: Battle[], cardTemplatesMap: Record<number, CardTemplate>) {
    const now = moment().unix();

    return battles.map((battle) => {
      const { winner, loser } = BattleMapper.mapToWinnerAndLoser(battle, cardTemplatesMap);

      const document: BattleDocument = {
        id: battle.id,
        updated: now,
        timestamp: battle.timestamp,
        winnerName: battle.winner,
        loserName: battle.loser,
        winnerSummonerName: winner.summoner.name,
        loserSummonerName: loser.summoner.name,
        manaCap: battle.manaCap,
        leagueName: battle.leagueName
      };

      return document;
    });
  }
}
