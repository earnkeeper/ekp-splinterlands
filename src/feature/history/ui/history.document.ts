import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class HistoryDocument extends DocumentDto {
  constructor(properties: HistoryDocument) {
    super(properties);
  }
   readonly id: string;
   readonly createdDate: Date;
   readonly currentStreak: number;
   readonly manaCap: number;
   readonly matchType: string;
   readonly player1: string;
   readonly player1RatingFinal: number;
   readonly player1RatingInitial: number;
   readonly player2: string;
   readonly player2RatingFinal: number;
   readonly player2RatingInitial: number;
   readonly rShares: number;
   readonly ruleSet: number;
   readonly winner: string;
}