import { logger } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import {
  ApiService,
  CardDetailDto,
  CardDistributionDto,
  ForSaleGroupedDto,
  PlayerCardDto,
} from '../../shared/api';
import { CardRepository } from '../../shared/db';
import { PlayerService } from '../../shared/game';

@Injectable()
export class MarketplaceService {
  constructor(
    private apiService: ApiService,
    private cardRepository: CardRepository,
    private playerService: PlayerService,
  ) {}

  async getEnhancedSales(playerName: string): Promise<EnhancedSale[]> {
    const sales = await this.apiService.fetchCardSales();

    const cardDetails = await this.apiService.fetchCardDetails();

    const cardDetailsMap = _.keyBy(cardDetails, 'id');

    const cards = await this.cardRepository.findAll();

    const cardsMap = _.keyBy(cards, 'id');

    const playerCards = await this.playerService.getPlayerCards(playerName);

    return _.chain(sales)
      .map((sale) => {
        const cardDetail = cardDetailsMap[sale.card_detail_id];

        if (!cardDetail) {
          logger.warn(
            'Could not find card detail for id: ' + sale.card_detail_id,
          );
          return undefined;
        }

        const distribution = cardDetail.distribution.find(
          (it) => it.gold === sale.gold && it.edition === sale.edition,
        );

        if (!distribution) {
          logger.warn(
            'Could not find distribution for id: ' + sale.card_detail_id,
          );
          return undefined;
        }

        const card = cardsMap[sale.card_detail_id];

        let stats: { battles: number; wins: number };

        if (!!card) {
          stats = {
            battles: _.chain(card.dailyStats).values().sumBy('battles').value(),
            wins: _.chain(card.dailyStats).values().sumBy('wins').value(),
          };
        }

        const playerCard = playerCards.find(
          (it) =>
            it.card_detail_id === sale.card_detail_id && it.level <= sale.level,
        );

        const enhancedSale: EnhancedSale = {
          ...sale,
          cardDetail,
          distribution,
          stats,
          playerCard,
        };

        return enhancedSale;
      })
      .filter((it) => !!it)
      .value();
  }
}

export type EnhancedSale = Readonly<{
  cardDetail: CardDetailDto;
  distribution: CardDistributionDto;
  stats?: { wins?: number; battles: number };
  playerCard?: PlayerCardDto;
}> &
  ForSaleGroupedDto;
