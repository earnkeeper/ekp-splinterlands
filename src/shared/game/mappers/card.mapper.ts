import { CardDetailDto } from '../../api';
import { Card, CardTemplate } from '../domain';

export class CardMapper {
  static mapToCardTemplate(cardDetail: CardDetailDto): CardTemplate {
    return {
      id: cardDetail.id,
      distributions: cardDetail.distribution.map((it) => ({
        edition: CardMapper.mapToEdition(it.edition),
        editionNumber: it.edition,
        gold: it.gold,
      })),
      mana: cardDetail.stats.mana,
      name: cardDetail.name,
      rarity: cardDetail.rarity,
      splinter: CardMapper.mapToSplinter(cardDetail.color),
      type: cardDetail.type,
    };
  }

  static mapToCard(
    cardTemplate: CardTemplate,
    level: number,
    editionNumber: number,
    gold: boolean,
    xp?: number,
    id?: string,
  ): Card {
    const hash = this.mapToCardHash(
      cardTemplate.id,
      level,
      editionNumber,
      gold,
    );

    const edition = CardMapper.mapToEdition(editionNumber);

    const rarity = CardMapper.mapToRarity(cardTemplate.rarity);

    return {
      id: id ?? hash,
      editionNumber,
      edition,
      foil: gold ? 'Gold' : 'Regular',
      gold,
      hash,
      level,
      mana:
        cardTemplate.mana[level] ?? cardTemplate.mana[0] ?? cardTemplate.mana,
      name: cardTemplate.name,
      power: CardMapper.mapToPower(edition, rarity, gold) * xp,
      rarity,
      rarityNumber: cardTemplate.rarity,
      splinter: cardTemplate.splinter,
      type: cardTemplate.type,
      templateId: cardTemplate.id,
      xp,
    };
  }

  static mapToCardHash(
    templateId: number,
    level: number,
    editionNumber: number,
    gold: boolean,
  ): string {
    return `${templateId}|${level}|${editionNumber}${gold ? '|G' : ''}`;
  }

  static mapToEdition(editionNumber: number) {
    switch (editionNumber) {
      case 0:
        return 'Alpha';
      case 1:
        return 'Beta';
      case 2:
        return 'Promo';
      case 3:
        return 'Reward';
      case 4:
        return 'Untamed';
      case 5:
        return 'Dice';
      case 7:
        return 'Chaos';
      default:
        return 'Unknown';
    }
  }

  static mapToRarity(rarityNumber: number): string {
    switch (rarityNumber) {
      case 1:
        return 'Common';
      case 2:
        return 'Rare';
      case 3:
        return 'Epic';
      case 4:
        return 'Legendary';
      default:
        return 'Unknown';
    }
  }

  static mapToPower(edition: string, rarity: string, gold: boolean) {
    let power = 5;

    switch (edition) {
      case 'Dice':
      case 'Untamed':
        power *= 2;
        break;
      case 'Beta':
        power *= 3;
        break;
      case 'Alpha':
        power *= 6;
        break;
    }

    switch (rarity) {
      case 'Rare':
        power *= 4;
        break;
      case 'Epic':
        power *= 20;
        break;
      case 'Legendary':
        power *= 100;
        break;
    }

    if (gold) {
      power *= 50;
    }

    return power;
  }

  static mapToSplinter(color: string) {
    switch (color) {
      case 'Red':
        return 'Fire';
      case 'Blue':
        return 'Water';
      case 'Green':
        return 'Earth';
      case 'White':
        return 'Life';
      case 'Black':
        return 'Death';
      case 'Gold':
        return 'Dragon';
      case 'Gray':
        return 'Neutral';
      default:
        return 'Unknown';
    }
  }

  static mapToCardByLevelUrl(card: Card): string {
    const baseUrl = 'https://d36mxiodymuqjm.cloudfront.net';
    const edition = card.edition.toLowerCase();
    const name = card.name;
    const level = card.level.toString();

    return `${baseUrl}/cards_by_level/${edition}/${name}_lv${level}.png`;
  }

  static mapToCardArtUrl(card: Card): string {
    const baseUrl = 'https://d36mxiodymuqjm.cloudfront.net';
    const name = card.name;

    return `${baseUrl}/card_art/${name}.png`;
  }
}
