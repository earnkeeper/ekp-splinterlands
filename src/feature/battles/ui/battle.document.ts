import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class BattleDocument extends DocumentDto {
  constructor(properties: BattleDocument) {
    super(properties);
  }

  readonly leagueGroup: string;
  readonly loserName: string;
  readonly loserSplinter: string;
  readonly loserSummonerName: string;
  readonly manaCap: number;
  readonly rulesets: string[];
  readonly splinters: string[];
  readonly timestamp: number;
  readonly winnerName: string;
  readonly winnerSplinter: string;
  readonly winnerSummonerName: string;
}
