import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { logger } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { ApiService } from '../../shared/api';
import { CardStatsRepository } from '../../shared/db';
import { CardMapper, CardService } from '../../shared/game';
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
    leagueName: string,
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

        const card = CardMapper.mapToCard(
          cardTemplate,
          sale.level,
          sale.edition,
          sale.gold,
        );

        const cardStatsRecord = cardStatsRecords.find(
          (it) => it.hash === card.hash,
        );

        let battles: number;
        let wins: number;

        if (!!cardStatsRecord) {
          battles = _.chain(cardStatsRecord.dailyBattleStats)
            .filter(
              (it) => leagueName === 'All' || it.leagueName === leagueName,
            )
            .sumBy('battles')
            .value();

          wins = _.chain(cardStatsRecord.dailyBattleStats)
            .filter(
              (it) => leagueName === 'All' || it.leagueName === leagueName,
            )
            .sumBy('wins')
            .value();
        }

        const document = new ListingDocument({
          id: card.id,
          updated: now,
          battles,
          cardArtUrl: CardMapper.mapToCardArtUrl(card),
          cardByLevelUrl: CardMapper.mapToCardByLevelUrl(card),
          edition: card.edition,
          fiatSymbol: currency.symbol,
          foil: card.gold ? 'Gold' : 'Regular',
          gold: card.gold,
          level: card.level,
          name: card.name,
          price: sale.low_price * conversionRate,
          qty: sale.qty,
          rarity: card.rarity,
          role: card.type,
          splinter: card.splinter,
          winpc: !!battles ? (wins * 100) / battles : undefined,
        });

        return document;
      })
      .filter((it) => !!it)
      .value();
  }
}
