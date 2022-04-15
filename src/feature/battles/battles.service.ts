import { Injectable } from '@nestjs/common';
import { validate } from 'bycontract';
import _ from 'lodash';
import moment from 'moment';
import { Battle, BattleRepository } from '../../shared/db';
import { CardService, CardTemplate } from '../../shared/game';
import { BattleMapper } from '../../shared/game/mappers/battle.mapper';
import { BattleDocument } from './ui/battle.document';

@Injectable()
export class BattlesService {
  constructor(
    private battleRepository: BattleRepository,
    private cardService: CardService,
  ) {}

  async getBattleDocumentsByCardId(
    cardHash: string,
    leagueGroup: string,
    limit: number,
  ): Promise<BattleDocument[]> {
    const battles = await this.battleRepository.findByCardHashAndLeagueGroup(
      cardHash,
      leagueGroup,
      limit,
    );

    const cardTemplatesMap = await this.cardService.getAllCardTemplatesMap();

    return this.mapBattleDocuments(battles, cardTemplatesMap);
  }

  async getBattleDocumentsByTeamIdAndMana(
    teamId: string,
    mana: number,
    limit: number,
  ): Promise<BattleDocument[]> {
    const cardHashes = _.chain(teamId)
      .split(',')
      .filter((it) => it.includes('|'))
      .value();

    const battles = await this.battleRepository.findByCardHashesAndMana(
      cardHashes,
      mana,
      limit,
    );

    const cardTemplatesMap = await this.cardService.getAllCardTemplatesMap();

    return this.mapBattleDocuments(battles, cardTemplatesMap);
  }

  mapBattleDocuments(
    battles: Battle[],
    cardTemplatesMap: Record<number, CardTemplate>,
  ) {
    const now = moment().unix();

    return battles.map((battle) => {
      validate(battle, 'object');

      const { winner, loser } = BattleMapper.mapToWinnerAndLoser(
        battle,
        cardTemplatesMap,
      );

      const document: BattleDocument = {
        id: battle.id,
        updated: now,
        leagueGroup: battle.leagueGroup,
        loserName: battle.loser,
        loserSplinter: loser.summoner.splinter,
        loserSummonerName: loser.summoner.name,
        manaCap: battle.manaCap,
        rulesets: battle.rulesets,
        splinters: [winner.summoner.splinter, loser.summoner.splinter],
        timestamp: battle.timestamp,
        winnerName: battle.winner,
        winnerSplinter: winner.summoner.splinter,
        winnerSummonerName: winner.summoner.name,
      };

      return document;
    });
  }
}
