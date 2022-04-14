import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class BattlesByLeagueDocument extends DocumentDto {
  constructor(properties: BattlesByLeagueDocument) {
    super(properties);
  }

  leagueName: string;
  battles: number;
}
