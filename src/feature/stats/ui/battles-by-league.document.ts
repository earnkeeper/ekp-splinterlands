import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class BattlesByLeagueDocument extends DocumentDto {
  constructor(properties: BattlesByLeagueDocument) {
    super(properties);
  }

  minRating: number;
  leagueName: string;
  source: string;
  leagueNumber: number;
  battles: number;
}
