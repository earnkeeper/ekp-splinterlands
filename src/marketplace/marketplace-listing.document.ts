import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class MarketplaceListingDocument extends DocumentDto {
  constructor(properties: MarketplaceListingDocument) {
    super(properties);
  }

  readonly burned: number;
  readonly fiatSymbol: string;
  readonly gold: boolean;
  readonly level: number;
  readonly imageSmall: string;
  readonly imageTile: string;
  readonly name: string;
  readonly printed: number;
  readonly qty: number;
  readonly rarity: string;
  readonly price: number;
  readonly splinterLandsUrl: string;
}
