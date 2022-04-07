import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { Injectable } from '@nestjs/common';
import { validate } from 'bycontract';
import _ from 'lodash';
import moment from 'moment';
import {
  Card,
  CardService,
  MarketService,
  ResultsService,
  TeamResults,
} from '../../shared/game';
import { BattleForm } from '../../util';
import { DeckCard, DeckDocument } from './ui/deck.document';

@Injectable()
export class DecksService {
  constructor(
    private resultsService: ResultsService,
    private marketService: MarketService,
    private cardService: CardService,
  ) {}

  async updateTeams(
    clientTeams: DeckDocument[],
    form: BattleForm,
    subscribed: boolean,
    currency: CurrencyDto,
  ) {
    validate([form, form.manaCap], ['object', 'number']);

    const { teams: teamResults } = await this.resultsService.getTeamResults(
      form.manaCap,
      form.ruleset,
      form.leagueGroup,
      subscribed,
      5,
    );

    const cardPrices = await this.marketService.getMarketPrices();

    const playerCards = !!form.playerName
      ? await this.cardService.getPlayerCards(form.playerName)
      : undefined;

    return await this.mapDocuments(
      cardPrices,
      clientTeams,
      playerCards,
      teamResults,
      currency,
    );
  }

  async mapDocuments(
    cardPrices: Record<string, number>,
    clientTeams: DeckDocument[],
    playerCards: Card[],
    teamResults: TeamResults[],
    currency: CurrencyDto,
  ) {
    const now = moment().unix();

    const conversionRate = await this.marketService.getConversionRate(
      'usd-coin',
      currency.id,
    );

    const deckDocuments: DeckDocument[] = clientTeams.map((document) => {
      const getPrice = (monster: DeckCard) => {
        if (!cardPrices[monster.id.toString()]) {
          return undefined;
        }

        return cardPrices[monster.id.toString()][monster.level.toString()];
      };

      const newMonsters = document.monsters.map((monster) => {
        const cardOwned = playerCards?.find(
          (it) => it.templateId === monster.id && it.level === monster.level,
        );

        return {
          ...monster,
          price: !!cardOwned ? undefined : getPrice(monster),
        };
      });

      const teamResult = teamResults.find((it) => it.id === document.id);

      return {
        ...document,
        fiatSymbol: currency.symbol,
        monsters: newMonsters,
        price: _.chain(newMonsters)
          .map((it) => it.price)
          .filter((it) => !!it)
          .sum()
          .thru((it) => it * conversionRate)
          .value(),
        winpc: !!teamResult
          ? (teamResult.wins * 100) / teamResult.battles
          : undefined,
        battles: !!teamResult ? teamResult.battles : undefined,
        updated: now,
      };
    });

    return deckDocuments;
  }
}
