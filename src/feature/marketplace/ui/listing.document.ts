import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class ListingDocument extends DocumentDto {
  constructor(properties: ListingDocument) {
    super(properties);
  }

  readonly battles: number;
  readonly cardArtUrl: string;
  readonly cardByLevelUrl: string;
  readonly cardHash: string;
  readonly edition: string;
  readonly fiatSymbol: string;
  readonly foil: string;
  readonly gold: boolean;
  readonly level: number;
  readonly name: string;
  readonly price: number;
  readonly qty: number;
  readonly rarity: string;
  readonly role: string;
  readonly starred: string;
  readonly splinter: string;
  readonly winpc: number;

  readonly melee: number;
  readonly speed: number;
  readonly defense: number;
  readonly health: number;
  readonly mana: number;
}
