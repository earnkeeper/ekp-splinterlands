import { CacheService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { validate } from 'bycontract';
import _ from 'lodash';
import { ApiService, CardDetailDto } from '../../api';
import { BASE_CARD_DETAIL_IDS } from '../constants';
import { Card, CardTemplate } from '../domain';
import { CardMapper } from '../mappers';
@Injectable()
export class CardService {
  constructor(
    private apiService: ApiService,
    private cacheService: CacheService,
  ) {}

  async getPlayerCards(
    playerName: string,
    includeStarterCards = true,
  ): Promise<Card[]> {
    if (!playerName) {
      return [];
    }

    const playerCollection = await this.apiService.fetchPlayerCollection(
      playerName,
    );

    const cardDetailsMap = await this.getCardDetailsMap();

    const playerCards = _.chain(playerCollection.cards)
      .map((cardDto) => {
        const cardDetail = cardDetailsMap[cardDto.card_detail_id];

        const cardTemplate: CardTemplate =
          CardMapper.mapToCardTemplate(cardDetail);

        return CardMapper.mapToCard(
          cardTemplate,
          cardDto.level,
          cardDto.edition,
          cardDto.gold,
          cardDto.xp,
          cardDto.uid,
        );
      })
      .value();

    if (includeStarterCards) {
      const starterCards = await this.getStarterCards();

      for (const starterCard of starterCards) {
        // TODO: fix this N*N loop for performance
        const alreadyPresent = _.some(
          playerCards,
          (it) => it.templateId === starterCard.templateId,
        );

        if (!alreadyPresent) {
          playerCards.push(starterCard);
        }
      }
    }

    return playerCards;
  }

  private async getCardDetailsMap(): Promise<Record<number, CardDetailDto>> {
    return this.cacheService.wrap(
      'getCardDetailsMap',
      async () => {
        const cardDetails = await this.apiService.fetchCardDetails();

        return _.chain(cardDetails).keyBy('id').value();
      },
      {
        ttl: 3600,
      },
    );
  }

  async getAllCardTemplates(): Promise<CardTemplate[]> {
    const cardDetails = await this.apiService.fetchCardDetails();

    const cardTemplates = _.chain(cardDetails)
      .map((cardDetail) => CardMapper.mapToCardTemplate(cardDetail))
      .value();

    return cardTemplates;
  }

  async getAllCardTemplatesMap(): Promise<Record<number, CardTemplate>> {
    const cardDetails = await this.apiService.fetchCardDetails();

    const map = _.chain(cardDetails)
      .map((cardDetail) => CardMapper.mapToCardTemplate(cardDetail))
      .keyBy('id')
      .value();

    return map;
  }

  async getCardTemplates(templateIds: number[]) {
    const cardDetailsMap = await this.getCardDetailsMap();

    return _.chain(templateIds)
      .map((templateId) => {
        const cardDetail = cardDetailsMap[templateId];
        return CardMapper.mapToCardTemplate(cardDetail);
      })
      .value();
  }

  async getCardTemplate(templateId: number) {
    const cardDetailsMap = await this.getCardDetailsMap();

    if (!cardDetailsMap[templateId]) {
      return undefined;
    }

    return CardMapper.mapToCardTemplate(cardDetailsMap[templateId]);
  }

  async getStarterCards(): Promise<Card[]> {
    const starterCardTemplates = await this.getCardTemplates(
      BASE_CARD_DETAIL_IDS,
    );

    return _.chain(starterCardTemplates)
      .map((cardTemplate) => {
        validate(cardTemplate, 'object');

        return CardMapper.mapToCard(
          cardTemplate,
          1,
          cardTemplate.distributions[0]?.editionNumber,
          false,
          1,
          `starter-${cardTemplate.id}`,
        );
      })
      .value();
  }
}
