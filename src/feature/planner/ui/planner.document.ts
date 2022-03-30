import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class PlannerDocument extends DocumentDto {
  constructor(properties: PlannerDocument) {
    super(properties);
  }

  readonly battles: number;
  readonly mana: number;
  readonly monsterCount: number;
  readonly splinter: string;
  readonly summoner: string;
  readonly winpc: number;
  readonly elementIcon: string;
  readonly summonerIcon: string;
  readonly monsters: {
    id: string;
    name: string;
    mana: string;
    type: string;
    splinter: string;
    icon: string;
  }[];
}
