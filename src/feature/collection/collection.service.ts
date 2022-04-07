import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { Card, CardService, MarketService } from '../../shared/game';
import { CollectionForm } from '../../util';
import { CollectionDocument } from './ui/collection.document';

@Injectable()
export class CollectionService {
  constructor(
    private cardService: CardService,
    private marketService: MarketService,
  ) {}

  async getCollectionDocuments(
    form: CollectionForm,
    currency: CurrencyDto,
  ): Promise<CollectionDocument[]> {
    if (!form.playerName) {
      return [];
    }

    const playerCards = await this.cardService.getPlayerCards(form.playerName);

    const cardPrices = await this.marketService.getMarketPrices();

    const conversionRate = await this.marketService.getConversionRate(
      'usd-coin',
      currency.id,
    );

    return this.mapDocuments(playerCards, cardPrices, currency, conversionRate);
  }

  mapDocuments(
    playerCards: Card[],
    cardPrices: Record<string, number>,
    currency: CurrencyDto,
    conversionRate: number,
  ): CollectionDocument[] {
    const now = moment().unix();

    return _.chain(playerCards)
      .map((card) => {
        const cardPrice = cardPrices[card.hash];

        const document: CollectionDocument = {
          id: card.id,
          updated: now,
          cardArtUrl: this.cardService.getCardArtUrl(card),
          cardByLevelUrl: this.cardService.getCardByLevelUrl(card),
          edition: card.edition,
          editionNumber: card.editionNumber,
          fiatSymbol: currency.symbol,
          foil: card.foil,
          level: card.level,
          marketPrice:
            !!cardPrice && !card.id.startsWith('starter-')
              ? cardPrice * conversionRate
              : undefined,
          mana: card.mana,
          name: card.name,
          rarity: card.rarity,
          rarityNumber: card.rarityNumber,
          role: card.type,
          splinter: card.splinter,
          templateId: card.templateId,
          xp: card.xp,
        };

        return document;
      })
      .value();
  }
}
