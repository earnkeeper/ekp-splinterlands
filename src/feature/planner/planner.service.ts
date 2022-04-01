import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import {
  GameService,
  MarketPriceMap,
  ResultsService,
  TeamMonster,
  TeamResults,
} from '../../shared/game';
import { PlannerDocument } from './ui/planner.document';

@Injectable()
export class PlannerService {
  constructor(
    private gameService: GameService,
    private resultsService: ResultsService,
  ) {}

  async getPlannerDocuments(form: any, subscribed: boolean) {
    const manaCap = Number(form.manaCap);

    if (isNaN(manaCap)) {
      // We need a mana cap, we will kill the db getting all battles
      // And the return teams are not meaningful without mana
      return;
    }

    // We don't need a player name, just get all teams in this case
    const playerName = form.playerName ?? '';

    // All other properties can have sensible defaults
    const ruleset = form.ruleset ?? 'Standard';
    const leagueName = form.leagueName ?? 'All';

    const { teams, battles } = await this.resultsService.getTeamResults(
      manaCap,
      ruleset,
      leagueName,
      subscribed ?? false,
    );

    const cardPrices: MarketPriceMap = await this.gameService.getMarketPrices();

    const playerCards = await this.gameService.getPlayerCards(playerName);

    for (const playerCard of playerCards) {
      delete cardPrices[playerCard.card_detail_id.toString()][
        playerCard.level.toString()
      ];
    }

    const plannerDocuments = this.mapDocuments(teams, cardPrices);

    return { plannerDocuments, battles };
  }

  mapDocuments(
    detailedTeams: TeamResults[],
    cardPrices: MarketPriceMap,
  ): PlannerDocument[] {
    const now = moment().unix();

    return _.chain(detailedTeams)
      .map((team) => {
        const mana = team.summoner.mana + _.sumBy(team.monsters, 'mana');

        const monsters = [];

        const getPrice = (monster: TeamMonster) => {
          if (!cardPrices[monster.cardDetailId.toString()]) {
            return undefined;
          }

          return cardPrices[monster.cardDetailId.toString()][
            monster.level.toString()
          ];
        };

        monsters.push({
          id: team.summoner.cardDetailId,
          fiatSymbol: '$',
          icon: `https://d36mxiodymuqjm.cloudfront.net/card_art/${team.summoner.name}.png`,
          level: team.summoner.level,
          mana: team.summoner.mana,
          name: team.summoner.name,
          price: getPrice(team.summoner),
          splinter: team.summoner.splinter,
          type: 'Summoner',
        });

        // TODO: check if these are added in the right order, order is important
        monsters.push(
          ...team.monsters.map((monster) => ({
            id: monster.cardDetailId,
            fiatSymbol: '$',
            icon: `https://d36mxiodymuqjm.cloudfront.net/card_art/${monster.name}.png`,
            level: team.summoner.level,
            mana: monster.mana,
            name: monster.name,
            price: getPrice(monster),
            splinter: monster.splinter,
            type: 'Monster',
          })),
        );

        return {
          id: team.id,
          updated: now,
          battles: team.battles,
          splinterIcon: `https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-${team.summoner.splinter.toLowerCase()}-2.svg`,
          fiatSymbol: '$', // TODO: support multicurrency
          mana,
          monsterCount: team.monsters.length,
          monsters,
          price: _.chain(monsters)
            .filter((it) => !!it.price)
            .sumBy('price')
            .value(),
          splinter: team.summoner.splinter,
          summonerName: team.summoner.name,
          summonerIcon: `https://d36mxiodymuqjm.cloudfront.net/card_art/${team.summoner.name}.png`,
          winpc: team.wins / team.battles,
        };
      })
      .value();
  }
}
