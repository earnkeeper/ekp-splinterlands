import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class PlannerDocument extends DocumentDto {
  constructor(properties: PlannerDocument) {
    super(properties);
  }

  readonly battles: number;
  readonly fiatSymbol: string;
  readonly mana: number;
  readonly monsterCount: number;
  readonly owned: string;
  readonly price: number;
  readonly quests: string[];
  readonly rulesets: string[];
  readonly splinter: string;
  readonly summonerName: string;
  readonly summonerIcon: string;
  readonly summonerCardImg: string;
  readonly summonerEdition: string;
  readonly winpc: number;

  readonly monsters: {
    id: string;
    edition: string;
    fiatSymbol: string;
    icon: string;
    level: number;
    mana: string;
    name: string;
    price: number;
    splinter: string;
    type: string;
  }[];
}
