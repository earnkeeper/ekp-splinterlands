import { CacheService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { ApiService, CardDetailDto } from '../../api';
import { BASE_CARD_DETAIL_IDS } from '../constants';
import { Card, CardTemplate } from '../domain';
import { MapperService } from './mapper.service';

@Injectable()
export class CardService {
  constructor(
    private apiService: ApiService,
    private cacheService: CacheService,
  ) {}

  /**
   * Get the list of cards owned by a given player name, including base cards
   *
   * @param {string} playerName The in game name of the player to retrieve cards for
   * @returns {Card} Details of the cards owned by the player, including base cards.
   */
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

        const cardTemplate: CardTemplate = this.mapCardTemplate(cardDetail);

        return this.mapCard(
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

    return _.chain(cardDetails)
      .map((cardDetail) => this.mapCardTemplate(cardDetail))
      .value();
  }

  getCardHash(
    templateId: number,
    level: number,
    editionNumber: number,
    gold: boolean,
  ): string {
    return `${templateId}|${level}|${editionNumber}${gold ? '|G' : ''}`;
  }

  mapCard(
    cardTemplate: CardTemplate,
    level: number,
    editionNumber: number,
    gold: boolean,
    xp?: number,
    id?: string,
  ): Card {
    const hash = this.getCardHash(cardTemplate.id, level, editionNumber, gold);

    return {
      id: id ?? hash,
      editionNumber,
      edition: MapperService.mapEditionString(editionNumber),
      foil: gold ? 'Gold' : 'Regular',
      gold,
      hash,
      level,
      mana:
        cardTemplate.mana[level] ?? cardTemplate.mana[0] ?? cardTemplate.mana,
      name: cardTemplate.name,
      rarity: MapperService.mapRarityNumberToString(cardTemplate.rarity),
      rarityNumber: cardTemplate.rarity,
      splinter: cardTemplate.splinter,
      type: cardTemplate.type,
      templateId: cardTemplate.id,
      xp,
    };
  }

  mapCardTemplate(cardDetail: CardDetailDto): CardTemplate {
    return {
      id: cardDetail.id,
      distributions: cardDetail.distribution.map((it) => ({
        edition: MapperService.mapEditionString(it.edition),
        editionNumber: it.edition,
        gold: it.gold,
      })),
      mana: cardDetail.stats.mana,
      name: cardDetail.name,
      rarity: cardDetail.rarity,
      splinter: MapperService.mapColorToSplinter(cardDetail.color),
      type: cardDetail.type,
    };
  }

  async getCardTemplates(templateIds: number[]) {
    const cardDetailsMap = await this.getCardDetailsMap();

    return _.chain(templateIds)
      .map((templateId) => {
        const cardDetail = cardDetailsMap[templateId];
        return this.mapCardTemplate(cardDetail);
      })
      .value();
  }

  async getCardTemplate(templateId: number) {
    const cardDetailsMap = await this.getCardDetailsMap();

    if (!cardDetailsMap[templateId]) {
      return undefined;
    }

    return this.mapCardTemplate(cardDetailsMap[templateId]);
  }

  async getStarterCards(): Promise<Card[]> {
    const starterCardTemplates = await this.getCardTemplates(
      BASE_CARD_DETAIL_IDS,
    );

    return _.chain(starterCardTemplates)
      .map((cardTemplate) =>
        this.mapCard(
          cardTemplate,
          1,
          cardTemplate.distributions[0]?.editionNumber,
          false,
          1,
          `starter-${cardTemplate.id}`,
        ),
      )
      .value();
  }

  getCardByLevelUrl(card: Card): string {
    const baseUrl = 'https://d36mxiodymuqjm.cloudfront.net';
    const edition = card.edition.toLowerCase();
    const name = card.name;
    const level = card.level.toString();

    return `${baseUrl}/cards_by_level/${edition}/${name}_lv${level}.png`;
  }

  getCardArtUrl(card: Card): string {
    const baseUrl = 'https://d36mxiodymuqjm.cloudfront.net';
    const name = card.name;

    return `${baseUrl}/card_art/${name}.png`;
  }
}
