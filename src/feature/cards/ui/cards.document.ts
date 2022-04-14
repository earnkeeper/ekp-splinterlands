import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class CardDocument extends DocumentDto {
  constructor(properties: CardDocument) {
    super(properties);
  }

  readonly cardArtUrl: string;
  readonly cardByLevelUrl: string;
  readonly cardDetailId: number;
  readonly edition: string;
  readonly editionNumber: number;
  readonly foil: string;
  readonly gold: boolean;
  readonly id: string;
  readonly level: number;
  readonly mana: number;
  readonly name: string;
  readonly rarity: string;
  readonly rarityNumber: number;
  readonly role: string;
  readonly splinter: string;
}
