import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { validate } from 'bycontract';
import _ from 'lodash';
import moment from 'moment';
import {
  GameService,
  MarketPriceMap,
  ResultsService,
  TeamMonster,
  TeamResults,
} from '../../shared/game';
import { BattleForm } from '../../util';
import { PlannerDocument } from './ui/planner.document';

@Injectable()
export class PlannerService {
  constructor(
    private gameService: GameService,
    private resultsService: ResultsService,
    private coingeckoService: CoingeckoService,
  ) {}

  async getPlannerDocuments(
    form: BattleForm,
    subscribed: boolean,
    currency: CurrencyDto,
  ) {
    validate([form, form.manaCap], ['object', 'number']);

    const { teams, battles } = await this.resultsService.getTeamResults(
      form.manaCap,
      form.ruleset,
      form.leagueName,
      subscribed ?? false,
    );

    const cardPrices: MarketPriceMap = await this.gameService.getMarketPrices();

    const playerCards = await this.gameService.getPlayerCards(form.playerName);

    for (const playerCard of playerCards) {
      delete cardPrices[playerCard.card_detail_id.toString()][
        playerCard.level.toString()
      ];
    }

    const plannerDocuments = await this.mapDocuments(
      teams,
      cardPrices,
      currency,
    );

    return { plannerDocuments, battles };
  }

  async mapDocuments(
    detailedTeams: TeamResults[],
    cardPrices: MarketPriceMap,
    currency: CurrencyDto,
  ): Promise<PlannerDocument[]> {
    const now = moment().unix();

    let conversionRate = 1;

    if (currency.id !== 'usd') {
      const prices = await this.coingeckoService.latestPricesOf(
        ['usd-coin'],
        currency.id,
      );

      conversionRate = prices[0].price;
    }

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
          fiatSymbol: currency.symbol,
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
            edition: monster.edition,
            fiatSymbol: currency.symbol,
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
          fiatSymbol: currency.symbol,
          mana,
          monsterCount: team.monsters.length,
          monsters,
          price: _.chain(monsters)
            .filter((it) => !!it.price)
            .sumBy('price')
            .thru((it) => it * conversionRate)
            .value(),
          splinter: team.summoner.splinter,
          summonerName: team.summoner.name,
          summonerIcon: `https://d36mxiodymuqjm.cloudfront.net/card_art/${team.summoner.name}.png`,
          summonerCardImg: `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/${team.summoner.edition.toLowerCase()}/${
            team.summoner.name
          }_lv${team.summoner.level}.png`,
          summonerEdition: team.summoner.edition,
          winpc: team.wins / team.battles,
        };
      })
      .value();
  }
}
