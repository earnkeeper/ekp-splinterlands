import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { CardMapper, CardService, CardTemplate } from '../../shared/game';
import { CardDocument } from './ui/cards.document';

@Injectable()
export class CardsService {
  constructor(private cardService: CardService) {}

  async getCardDocuments(): Promise<CardDocument[]> {
    const cardTemplates = await this.cardService.getAllCardTemplates();

    return this.mapDocuments(cardTemplates);
  }

  mapDocuments(cardTemplates: CardTemplate[]): CardDocument[] {
    const now = moment().unix();

    return _.chain(cardTemplates)
      .flatMap((cardTemplate) => {
        const cards = [];

        for (const distribution of cardTemplate.distributions) {
          for (const level of [1, 2, 3, 4]) {
            cards.push(
              CardMapper.mapToCard(
                cardTemplate,
                level,
                distribution.editionNumber,
                distribution.gold,
              ),
            );
          }
        }

        return cards;
      })
      .map((card) => {
        const document: CardDocument = {
          id: card.id,
          updated: now,
          cardArtUrl: CardMapper.mapToCardArtUrl(card),
          cardByLevelUrl: CardMapper.mapToCardByLevelUrl(card),
          cardDetailId: card.templateId,
          edition: card.edition,
          editionNumber: card.editionNumber,
          foil: card.foil,
          gold: card.foil === 'Gold',
          level: card.level,
          mana: card.stats.mana,
          name: card.name,
          rarity: card.rarity,
          rarityNumber: card.rarityNumber,
          role: card.type,
          splinter: card.splinter,
        };

        return document;
      })
      .value();
  }
}
