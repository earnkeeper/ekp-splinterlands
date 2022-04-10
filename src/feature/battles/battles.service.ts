import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { Battle, BattleRepository } from '../../shared/db';
import { BattleDocument } from './ui/battle.document';

@Injectable()
export class BattlesService {
  constructor(private battleRepository: BattleRepository) {}

  async getBattleDocuments(cardId: string) {
    const battles = await this.battleRepository.findByCardId(cardId, 50);

    return this.mapBattleDocuments(battles);
  }

  mapBattleDocuments(battles: Battle[]) {
    const now = moment().unix();
    return battles.map((battle) => {
      const document: BattleDocument = {
        id: battle.id,
        updated: now,
        timestamp: battle.timestamp,
        winnerName: battle.winner,
        loserName: battle.loser,
      };

      return document;
    });
  }
}
