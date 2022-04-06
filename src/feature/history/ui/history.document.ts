import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class HistoryDocument extends DocumentDto {
  constructor(properties: HistoryDocument) {
    super(properties);
  }

  readonly id: string;
  readonly currentStreak: number;
  readonly manaCap: number;
  readonly matchType: string;
  readonly myFinalRating: number;
  readonly opponentInitialRating: number;
  readonly opponentName: string;
  readonly result: string;
  readonly ruleSet: number;
  readonly timestamp: number;
  readonly leagueName: string;
}
