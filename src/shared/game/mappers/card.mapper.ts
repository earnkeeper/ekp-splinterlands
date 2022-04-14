import { validate } from 'bycontract';
import _ from 'lodash';
import { CardDetailDto, SettingsDto } from '../../api';
import { Card, CardTemplate } from '../domain';

export class CardMapper {
  static mapToCardTemplate(cardDetail: CardDetailDto): CardTemplate {
    validate(cardDetail, 'object');

    return {
      id: cardDetail.id,
      distributions: cardDetail.distribution.map((it) => ({
        edition: CardMapper.mapToEdition(it.edition),
        editionNumber: it.edition,
        gold: it.gold,
      })),
      stats: cardDetail.stats,
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
    validate(cardTemplate, 'object');

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
      stats: {
        abilities: _.chain(cardTemplate.stats.abilities)
          .slice(0, level - 1)
          .flatMap((it) => it)
          .value(),
        armor: cardTemplate.stats.armor[level - 1],
        attack: cardTemplate.stats.attack[level - 1],
        health: cardTemplate.stats.health[level - 1],
        magic: cardTemplate.stats.magic[level - 1],
        mana:
          cardTemplate.stats.mana[level - 1] ??
          cardTemplate.stats.mana[0] ??
          cardTemplate.stats.mana,
        ranged: cardTemplate.stats.ranged[level - 1],
        speed: cardTemplate.stats.speed[level - 1],
      },
      name: cardTemplate.name,
      power: CardMapper.mapToPower(edition, rarity, gold, cardTemplate.id) * xp,
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
      case 6:
        return 'Gladius';
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

  static mapToPower(
    edition: string,
    rarity: string,
    gold: boolean,
    cardDetailId: number,
  ) {
    let power: number;

    switch (edition) {
      case 'Alpha':
      case 'Promo':
        power = 30;
        break;
      case 'Beta':
        power = 15;
        break;
      case 'Dice':
      case 'Untamed':
      case 'Gladius':
        power = 10;
        break;
      case 'Reward':
        if (cardDetailId <= 220) {
          power = 15;
        } else if (cardDetailId <= 300) {
          power = 10;
        } else {
          power = 5;
        }
        break;
      default:
        power = 5;
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

  static mapToCardsToLevel(
    templateId: number,
    level: number,
    editionNumber: number,
    rarityNumber: number,
    tier: number,
    gold: boolean,
    settings: SettingsDto,
  ): number {
    if (
      (editionNumber === 3 && templateId >= 225) ||
      editionNumber >= 4 ||
      tier >= 4
    ) {
      const rates = gold
        ? settings.combine_rates_gold[rarityNumber - 1]
        : settings.combine_rates[rarityNumber - 1];

      return rates[level - 1];
    }

    const goldNa = [3, 2, 2, 1];

    if (gold && level <= goldNa[rarityNumber - 1]) {
      return undefined;
    }

    if (level === 1) {
      return 1;
    }

    const xpLevels = settings.xp_levels[rarityNumber - 1];

    const xpArray =
      editionNumber === 0 || (editionNumber === 2 && templateId < 100)
        ? gold
          ? 'gold_xp'
          : 'alpha_xp'
        : gold
        ? 'beta_gold_xp'
        : 'beta_xp';

    const bcx = settings[xpArray][rarityNumber - 1];

    return gold
      ? level <= goldNa[rarityNumber - 1]
        ? undefined
        : Math.ceil(xpLevels[level - 2] / bcx)
      : level == 1
      ? 1
      : Math.ceil(xpLevels[level - 2] / bcx) + 1;
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

  static mapToCardArtUrl(card: Card | CardTemplate): string {
    const baseUrl = 'https://d36mxiodymuqjm.cloudfront.net';
    const name = card.name;

    return `${baseUrl}/card_art/${name}.png`;
  }
}
