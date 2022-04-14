import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { ApiService, SettingsDto } from '../../shared/api';
import { CardMapper, CardService, CardTemplate } from '../../shared/game';
import { CardDocument } from './ui/cards.document';

@Injectable()
export class CardsService {
  constructor(
    private apiService: ApiService,
    private cardService: CardService,
  ) {}

  async getCardDocuments(): Promise<CardDocument[]> {
    const cardTemplates = await this.cardService.getAllCardTemplates();
    const settings = await this.apiService.fetchSettings();

    return this.mapDocuments(cardTemplates, settings);
  }

  mapDocuments(
    cardTemplates: CardTemplate[],
    settings: SettingsDto,
  ): CardDocument[] {
    const now = moment().unix();

    return _.chain(cardTemplates)
      .flatMap((cardTemplate) => {
        const cards = [];

        for (const distribution of cardTemplate.distributions) {
          for (const level of _.range(1, 10)) {
            const xp = CardMapper.mapToCardsToLevel(
              cardTemplate.id,
              level,
              distribution.editionNumber,
              cardTemplate.rarity,
              undefined,
              distribution.gold,
              settings,
            );

            cards.push(
              CardMapper.mapToCard(
                cardTemplate,
                level,
                distribution.editionNumber,
                distribution.gold,
                xp,
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
          power: card.power,
          rarity: card.rarity,
          rarityNumber: card.rarityNumber,
          role: card.type,
          splinter: card.splinter,
          xp: card.xp,
        };

        return document;
      })
      .filter((it) => !!it.xp)
      .value();
  }
}
