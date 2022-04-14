import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class BattlesByLeagueDocument extends DocumentDto {
  constructor(properties: BattlesByLeagueDocument) {
    super(properties);
  }

  readonly leagueName: string;
  readonly fromTransactions: number;
  readonly fromPlayerHistory: number;
}
