import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class HistoryDocument extends DocumentDto {
  constructor(properties: HistoryDocument) {
    super(properties);
  }

  readonly leagueGroup: string;
  readonly manaCap: number;
  readonly myFinalRating: number;
  readonly mySplinter: string;
  readonly opponentInitialRating: number;
  readonly opponentName: string;
  readonly opponentSplinter: string;
  readonly result: string;
  readonly rulesets: string[];
  readonly timestamp: number;
}
