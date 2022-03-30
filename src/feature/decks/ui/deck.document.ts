import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class DeckDocument extends DocumentDto {
  constructor(properties: DeckDocument) {
    super(properties);
  }

  readonly battles: number;
  readonly mana: number;
  readonly monsters: DeckCard[];
  readonly name: string;
  readonly price: number;
  readonly splinter: string;
  readonly summoner: DeckCard[];
}

export type DeckCard = Readonly<{
  id: string;
  imageUrl: string;
  level: number;
  mana: number;
  name: string;
  price: number;
  splinter: string;
}>;
