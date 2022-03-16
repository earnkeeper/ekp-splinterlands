import { ApmService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { validate } from 'bycontract';
import _ from 'lodash';
import moment from 'moment';
import { ApiService, CardDetailDto, TeamDetailedDto } from '../../shared/api';
import { Battle, BattleRepository } from '../../shared/db';
import { GameService, MapperService } from '../../shared/game';

const FREE_DAYS_TO_FETCH = 1;

@Injectable()
export class TeamGuideService {
  constructor(
    private apiService: ApiService,
    private apmService: ApmService,
    private battleRepository: BattleRepository,
    private gameService: GameService,
  ) {}

  async getViableTeams(
    playerName: string,
    manaCap: number,
    ruleset: string,
    leagueName: string,
    subscribed: boolean,
  ): Promise<{ teams: ViableTeam[]; battles: Battle[] }> {
    validate(
      [playerName, manaCap, ruleset, leagueName, subscribed],
      ['string', 'number', 'string', 'string', 'boolean'],
    );

    const tx = this.apmService.startTransaction({
      name: 'TeamGuideService',
      op: 'getViableTeams',
    });

    const fetchSince = !subscribed
      ? moment().subtract(FREE_DAYS_TO_FETCH, 'days').unix()
      : 0;

    const sp1 = tx?.startChild({
      op: 'readBattles',
      data: {
        manaCap,
        ruleset,
        subscribed,
      },
    });

    const battles = await this.battleRepository.findBattleByManaCap(
      manaCap,
      ruleset,
      leagueName,
      fetchSince,
    );

    tx?.setData('battleCount', battles.length);

    sp1?.finish();

    const sp2 = tx?.startChild({
      op: 'fetchCardDetails',
    });

    const allCards = await this.apiService.fetchCardDetails();

    tx?.setData('allCardCount', allCards.length);

    sp2?.finish();

    let playerCardDetailIds: number[];

    if (!!playerName) {
      const sp3 = tx?.startChild({
        op: 'fetchPlayerCards',
      });

      const playerCards = await this.gameService.getPlayerCards(playerName);
      tx?.setData('playerCardCount', playerCards.length);

      sp3?.finish();

      playerCardDetailIds = playerCards.map((card) => card.card_detail_id);
    }

    const sp4 = tx?.startChild({
      op: 'computeTeams',
    });

    const viableTeams: Record<string, ViableTeam> = {};

    for (const battle of battles) {
      const { winner, loser } = MapperService.mapWinnerAndLoser(battle);

      if (!playerName || this.playerHasCards(playerCardDetailIds, winner)) {
        this.updateViableTeamsWith(viableTeams, winner, allCards, true);
      }

      if (!playerName || this.playerHasCards(playerCardDetailIds, loser)) {
        this.updateViableTeamsWith(viableTeams, loser, allCards, false);
      }
    }

    const teams = _.values(viableTeams);

    tx?.setData('teamCount', teams.length);

    sp4?.finish();

    tx?.finish();

    return { teams, battles };
  }

  private updateViableTeamsWith(
    viableTeams: Record<string, ViableTeam>,
    team: TeamDetailedDto,
    allCards: CardDetailDto[],
    win: boolean,
  ) {
    const id: string = this.mapTeamId(team);

    let viableTeam = viableTeams[id];

    if (!viableTeam) {
      viableTeams[id] = viableTeam = this.createViableTeam(id, team, allCards);
    }

    if (win) {
      viableTeam.wins += 1;
    }

    viableTeam.battles += 1;
  }

  private createViableTeam(
    teamId: string,
    battleTeam: TeamDetailedDto,
    allCards: CardDetailDto[],
  ): ViableTeam {
    const summonerCard = MapperService.mapCardDetailIdsToCards(
      [battleTeam.summoner.card_detail_id],
      allCards,
    )[0];

    return {
      id: teamId,
      wins: 0,
      battles: 0,
      summoner: {
        cardDetailId: summonerCard.id,
        level: battleTeam.summoner.level,
        mana: MapperService.mapCardMana(
          summonerCard,
          battleTeam.summoner.level,
        ),
        name: summonerCard.name,
        splinter: MapperService.mapColorToSplinter(summonerCard.color),
      },
      monsters: battleTeam.monsters.map((monster) => {
        const monsterCard = MapperService.mapCardDetailIdsToCards(
          [monster.card_detail_id],
          allCards,
        )[0];

        return {
          cardDetailId: monsterCard.id,
          level: battleTeam.summoner.level,
          mana: MapperService.mapCardMana(
            monsterCard,
            battleTeam.summoner.level,
          ),
          name: monsterCard.name,
          splinter: MapperService.mapColorToSplinter(monsterCard.color),
        };
      }),
    };
  }

  private playerHasCards(
    playerCardDetailIds: number[],
    otherTeam: TeamDetailedDto,
  ): boolean {
    const monsterCardDetailIds = otherTeam.monsters.map(
      (monster) => monster.card_detail_id,
    );

    // TODO: this can be optimized, many loops
    return (
      playerCardDetailIds.includes(otherTeam.summoner.card_detail_id) &&
      _.difference(monsterCardDetailIds, playerCardDetailIds).length === 0
    );
  }

  private mapTeamId(team: TeamDetailedDto): string {
    const orderedMonstersId = _.chain(team.monsters)
      .map((monster) => monster.card_detail_id)
      .sort()
      .join('|')
      .value();

    return `${team.summoner.card_detail_id}|${orderedMonstersId}`;
  }
}

export type ViableTeam = {
  readonly id: string;
  battles: number;
  wins: number;
  readonly summoner: Readonly<{
    cardDetailId: number;
    level: number;
    mana: number;
    name: string;
    splinter: string;
  }>;
  readonly monsters: Readonly<{
    cardDetailId: number;
    level: number;
    mana: number;
    name: string;
    splinter: string;
  }>[];
};
