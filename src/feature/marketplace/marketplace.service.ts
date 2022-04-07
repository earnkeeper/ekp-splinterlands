import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { logger } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { ApiService } from '../../shared/api';
import { CardStatsRepository } from '../../shared/db';
import { CardService } from '../../shared/game';
import { ListingDocument } from './ui/listing.document';

@Injectable()
export class MarketplaceService {
  constructor(
    private apiService: ApiService,
    private cardStatsRepository: CardStatsRepository,
    private cardService: CardService,
  ) {}

  async getListingDocuments(
    currency: CurrencyDto,
    conversionRate: number,
  ): Promise<ListingDocument[]> {
    const sales = await this.apiService.fetchCardSales();
    const cardStatsRecords = await this.cardStatsRepository.findAll();
    const allCardTemplates = await this.cardService.getAllCardTemplates();
    const now = moment().unix();

    return _.chain(sales)
      .map((sale) => {
        const cardTemplate = allCardTemplates.find(
          (it) => it.id === sale.card_detail_id,
        );

        if (!cardTemplate) {
          logger.warn(
            'Could not find card detail for id: ' + sale.card_detail_id,
          );
          return undefined;
        }

        const card = this.cardService.mapCard(
          cardTemplate,
          sale.level,
          sale.edition,
          sale.gold,
        );

        const cardStatsRecord = cardStatsRecords.find(
          (it) => it.id === cardTemplate.id,
        );

        let battles: number;
        let wins: number;

        if (!!cardStatsRecord) {
          battles = _.chain(cardStatsRecord.dailyStats)
            .values()
            .sumBy('battles')
            .value();

          wins = _.chain(cardStatsRecord.dailyStats)
            .values()
            .sumBy('wins')
            .value();
        }

        const document = new ListingDocument({
          id: card.id,
          updated: now,

          fiatSymbol: currency.symbol,
          battles,
          splinter: card.splinter,
          gold: card.gold,

          cardArtUrl: this.cardService.getCardArtUrl(card),
          cardByLevelUrl: this.cardService.getCardByLevelUrl(card),
          level: card.level,
          name: card.name,
          price: sale.low_price * conversionRate,
          qty: sale.qty,
          rarity: card.rarity,

          winpc: !!battles ? (wins * 100) / battles : undefined,
        });

        return document;
      })
      .filter((it) => !!it)
      .value();
  }
}
