import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class DeckDocument extends DocumentDto {
  constructor(properties: DeckDocument) {
    super(properties);
  }

  readonly fiatSymbol: string;
  readonly mana: number;
  readonly monsters: DeckCard[];
  readonly price: number;
  readonly splinter: string;
  readonly summonerName: string;
  readonly summonerIcon: string;
  readonly summonerCardImg: string;
  readonly summonerEdition: string;
  readonly teamName: string;
}

export type DeckCard = Readonly<{
  id: number;
  edition: string;
  imageUrl: string;
  level: number;
  mana: number;
  name: string;
  price: number;
  splinter: string;
}>;
