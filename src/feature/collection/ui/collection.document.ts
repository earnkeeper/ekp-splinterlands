import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class CollectionDocument extends DocumentDto {
  constructor(properties: CollectionDocument) {
    super(properties);
  }

  readonly id: string;
  readonly cardArtUrl: string;
  readonly cardByLevelUrl: string;
  readonly edition: string;
  readonly editionNumber: number;
  readonly fiatSymbol: string;
  readonly foil: string;
  readonly level: number;
  readonly mana: number;
  readonly marketPrice: number;
  readonly name: string;
  readonly rarity: string;
  readonly rarityNumber: number;
  readonly role: string;
  readonly splinter: string;
  readonly templateId: number;
  readonly xp: number;
}
