import { ApmService, CacheService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { FREE_DAYS_TO_KEEP, PREMIUM_DAYS_TO_KEEP } from '../../../util';
import { ApiService, TeamDetailedDto } from '../../api';
import { Battle, BattleRepository } from '../../db';
import { Card, CardTemplate } from '../domain';
import { CardService } from './card.service';
import { MapperService } from './mapper.service';

@Injectable()
export class ResultsService {
  constructor(
    private apiService: ApiService,
    private apmService: ApmService,
    private battleRepository: BattleRepository,
    private cacheService: CacheService,
    private cardService: CardService,
  ) {}

  async getTeamResults(
    manaCap: number,
    ruleset: string,
    leagueGroup: string,
    subscribed: boolean,
    minBattles: number,
  ): Promise<{ teams: TeamResults[]; battles: Battle[] }> {
    const cacheKey = _.chain([
      manaCap,
      ruleset,
      leagueGroup,
      subscribed,
      minBattles,
    ])
      .join('|')
      .value();

    const cached: { teams: TeamResults[]; battles: Battle[] } =
      await this.cacheService.get(cacheKey);

    if (!!cached) {
      return cached;
    }

    const tx = this.apmService.startTransaction({
      name: 'PlannerService',
      op: 'getViableTeams',
    });

    const fetchSince = !subscribed
      ? moment().subtract(FREE_DAYS_TO_KEEP, 'days').unix()
      : moment().subtract(PREMIUM_DAYS_TO_KEEP, 'days').unix();

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
      leagueGroup,
      fetchSince,
    );

    tx?.setData('battleCount', battles.length);

    sp1?.finish();

    const sp2 = tx?.startChild({
      op: 'fetchCardDetails',
    });

    const cardTemplates = await this.cardService.getAllCardTemplates();

    tx?.setData('allCardCount', cardTemplates.length);

    sp2?.finish();

    const sp4 = tx?.startChild({
      op: 'computeTeams',
    });

    const viableTeams: Record<string, TeamResults> = {};

    for (const battle of battles) {
      const { winner, loser } = MapperService.mapWinnerAndLoser(battle);

      this.updateResultsWith(viableTeams, winner, cardTemplates, true);
      this.updateResultsWith(viableTeams, loser, cardTemplates, false);
    }

    const teams = _.values(viableTeams);

    tx?.setData('teamCount', teams.length);

    sp4?.finish();

    tx?.finish();

    const result = {
      teams: teams.filter((it) => it.battles >= minBattles),
      battles,
    };

    await this.cacheService.set(cacheKey, result, { ttl: 3600 });

    return result;
  }

  private updateResultsWith(
    viableTeams: Record<string, TeamResults>,
    team: TeamDetailedDto,
    cardTemplates: CardTemplate[],
    win: boolean,
  ) {
    const id: string = this.mapTeamId(team);

    let viableTeam = viableTeams[id];

    if (!viableTeam) {
      viableTeams[id] = viableTeam = this.createTeamResults(
        id,
        team,
        cardTemplates,
      );
    }

    if (win) {
      viableTeam.wins += 1;
    }

    viableTeam.battles += 1;
  }

  private createTeamResults(
    teamId: string,
    battleTeam: TeamDetailedDto,
    cardTemplates: CardTemplate[],
  ): TeamResults {
    const summonerTemplate = cardTemplates.find(
      (it) => it.id === battleTeam.summoner.card_detail_id,
    );

    const summoner = this.cardService.mapCard(
      summonerTemplate,
      battleTeam.summoner.level,
      battleTeam.summoner.edition,
      battleTeam.summoner.gold,
      battleTeam.summoner.xp,
    );

    const monsters = _.chain(battleTeam.monsters)
      .map((monster) => {
        const monsterTemplate = cardTemplates.find(
          (it) => it.id === monster.card_detail_id,
        );

        return this.cardService.mapCard(
          monsterTemplate,
          monster.level,
          monster.edition,
          monster.gold,
          monster.xp,
        );
      })
      .value();

    return {
      id: teamId,
      wins: 0,
      battles: 0,
      summoner,
      monsters,
    };
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

export type TeamResults = {
  readonly id: string;
  battles: number;
  wins: number;
  readonly summoner: Card;
  readonly monsters: Card[];
};
