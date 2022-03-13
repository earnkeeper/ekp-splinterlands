import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import {
  ApiService,
  BattleDto,
  CardDetailDto,
  TeamDetailedDto,
} from '../../shared/api';
import { Battle, BattleRepository } from '../../shared/db';
import { GameService, MapperService } from '../../shared/game';

@Injectable()
export class TeamGuideService {
  constructor(
    private apiService: ApiService,
    private battleRepository: BattleRepository,
    private gameService: GameService,
  ) {}

  async getViableTeams(
    playerName: string,
    manaCap: number,
    ruleset: string,
  ): Promise<{ teams: ViableTeam[]; battles: Battle[] }> {
    const battleModels =
      await this.battleRepository.findByManaCapRulesetAndTimestampGreaterThan(
        manaCap,
        ruleset,
        0,
      );

    const battles = battleModels.map((model) => model.raw);

    const allCards = await this.apiService.fetchCardDetails();

    const playerCards = await this.gameService.getPlayerCards(playerName);

    const playerCardDetailIds = playerCards.map((card) => card.card_detail_id);

    const viableTeams: Record<string, ViableTeam> = {};

    for (const battle of battles) {
      const { winner, loser } = this.mapWinnerAndLoser(battle);

      if (this.playerHasCards(playerCardDetailIds, winner)) {
        this.updateViableTeamsWith(viableTeams, winner, allCards, true);
      } else if (this.playerHasCards(playerCardDetailIds, loser)) {
        this.updateViableTeamsWith(viableTeams, loser, allCards, false);
      }
    }

    return { teams: _.values(viableTeams), battles: battleModels };
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

  private mapWinnerAndLoser(battle: BattleDto) {
    let winner: TeamDetailedDto;
    let loser: TeamDetailedDto;

    if (battle.winner === battle.details.team1.player) {
      winner = battle.details.team1;
      loser = battle.details.team2;
    } else {
      winner = battle.details.team2;
      loser = battle.details.team1;
    }

    return { winner, loser };
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
