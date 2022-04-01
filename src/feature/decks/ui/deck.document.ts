import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class DeckDocument extends DocumentDto {
  constructor(properties: DeckDocument) {
    super(properties);
  }

  readonly battles: number;
  readonly fiatSymbol: string;
  readonly mana: number;
  readonly monsters: DeckCard[];
  readonly name: string;
  readonly price: number;
  readonly splinter: string;
  readonly summoner: DeckCard;
  readonly teamName: string;
  readonly winpc: number;
}

export type DeckCard = Readonly<{
  id: number;
  imageUrl: string;
  level: number;
  mana: number;
  name: string;
  price: number;
  splinter: string;
}>;
