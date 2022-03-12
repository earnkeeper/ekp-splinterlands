import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class TeamSummaryDocument extends DocumentDto {
  constructor(properties: TeamSummaryDocument) {
    super(properties);
  }

  readonly battles: number;
  readonly mana: number;
  readonly monsters: number;
  readonly splinter: string;
  readonly summoner: string;
  readonly winpc: number;
}
