import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class HistoryDocument extends DocumentDto {
  constructor(properties: HistoryDocument) {
    super(properties);
  }

  readonly id: string;
  readonly manaCap: number;
  readonly myFinalRating: number;
  readonly opponentInitialRating: number;
  readonly opponentName: string;
  readonly mySplinter: string;
  readonly opponentSplinter: string;
  readonly result: string;
  readonly rulesets: string[];
  readonly timestamp: number;
  readonly leagueName: string;
}
