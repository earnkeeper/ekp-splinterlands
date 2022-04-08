import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import {
  Card,
  CardService,
  MarketService,
  ResultsService,
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
    const cardPrices = await this.marketService.getMarketPrices();

    const playerCards = !!form.playerName
      ? await this.cardService.getPlayerCards(form.playerName)
      : undefined;

    return await this.mapDocuments(
      cardPrices,
      clientTeams,
      playerCards,
      currency,
    );
  }

  async mapDocuments(
    cardPrices: Record<string, number>,
    clientTeams: DeckDocument[],
    playerCards: Card[],
    currency: CurrencyDto,
  ) {
    const now = moment().unix();

    const conversionRate = await this.marketService.getConversionRate(
      'usd-coin',
      currency.id,
    );

    const deckDocuments: DeckDocument[] = clientTeams.map((clientDocument) => {
      const getPrice = (monster: DeckCard) => {
        if (!cardPrices[monster.id.toString()]) {
          return undefined;
        }

        return cardPrices[monster.id.toString()][monster.level.toString()];
      };

      const newMonsters = clientDocument.monsters.map((monster) => {
        const cardOwned = playerCards?.find(
          (it) => it.templateId === monster.id && it.level === monster.level,
        );

        return {
          ...monster,
          price: !!cardOwned ? undefined : getPrice(monster),
        };
      });

      const document: DeckDocument = {
        ...clientDocument,
        fiatSymbol: currency.symbol,
        monsters: newMonsters,
        price: _.chain(newMonsters)
          .map((it) => it.price)
          .filter((it) => !!it)
          .sum()
          .thru((it) => it * conversionRate)
          .value(),
        updated: now,
      };

      return document;
    });

    return deckDocuments;
  }
}
