import { ApmService, CacheService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { FREE_DAYS_TO_KEEP, PREMIUM_DAYS_TO_KEEP } from '../../../util';
import { Battle, BattleRepository } from '../../db';
import { Card, Team } from '../domain';
import { BattleMapper } from '../mappers/battle.mapper';
import { CardService } from './card.service';

@Injectable()
export class ResultsService {
  constructor(
    private apmService: ApmService,
    private battleRepository: BattleRepository,
    private cacheService: CacheService,
    private cardService: CardService,
  ) {}

  async getTeamResults(
    manaCap: number,
    leagueGroup: string,
    subscribed: boolean,
    minBattles: number,
  ): Promise<{ teams: TeamResults[]; battles: Battle[] }> {
    const cacheKey = _.chain([
      'v1_getTeamResults',
      manaCap,
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
        subscribed,
      },
    });

    const battles = await this.battleRepository.findBattleByManaCap(
      manaCap,
      leagueGroup,
      fetchSince,
    );

    tx?.setData('battleCount', battles.length);

    sp1?.finish();

    const sp2 = tx?.startChild({
      op: 'fetchCardDetails',
    });

    const cardTemplatesMap = await this.cardService.getAllCardTemplatesMap();

    sp2?.finish();

    const sp4 = tx?.startChild({
      op: 'computeTeams',
    });

    const viableTeams: Record<string, TeamResults> = {};

    for (const battle of battles) {
      const { winner, loser } = BattleMapper.mapToWinnerAndLoser(
        battle,
        cardTemplatesMap,
      );

      this.updateResultsWith(viableTeams, winner, battle.rulesets, true);
      this.updateResultsWith(viableTeams, loser, battle.rulesets, false);
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
    team: Team,
    rulesets: string[],
    win: boolean,
  ) {
    const id: string = this.mapTeamId(team, rulesets);

    let viableTeam = viableTeams[id];

    if (!viableTeam) {
      viableTeams[id] = viableTeam = this.createTeamResults(id, team, rulesets);
    }

    if (win) {
      viableTeam.wins += 1;
    }

    viableTeam.battles += 1;
  }

  private createTeamResults(
    teamId: string,
    team: Team,
    rulesets: string[],
  ): TeamResults {
    return {
      id: teamId,
      rulesets,
      wins: 0,
      battles: 0,
      summoner: team.summoner,
      monsters: team.monsters,
    };
  }

  private mapTeamId(team: Team, rulesets: string[]): string {
    const orderedMonstersId = _.chain(team.monsters)
      .map((monster) => monster.hash)
      .sort()
      .join(',')
      .value();

    const orderedRulesets = _.chain(rulesets).sort().join(';').value();

    return `${team.summoner.hash},${orderedMonstersId},${orderedRulesets}`;
  }
}

export type TeamResults = {
  readonly id: string;
  battles: number;
  wins: number;
  readonly rulesets: string[];
  readonly summoner: Card;
  readonly monsters: Card[];
};
