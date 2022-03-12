import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class MarketplaceListingDocument extends DocumentDto {
  constructor(properties: MarketplaceListingDocument) {
    super(properties);
  }

  readonly burned: number;
  readonly editionString: string;
  readonly elementString: string;
  readonly fiatSymbol: string;
  readonly gold: boolean;
  readonly imageSmall: string;
  readonly imageTile: string;
  readonly level: number;
  readonly name: string;
  readonly price: number;
  readonly printed: number;
  readonly qty: number;
  readonly rarity: string;
  readonly splinterLandsUrl: string;
}
