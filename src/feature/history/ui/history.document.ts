import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class HistoryDocument extends DocumentDto {
  constructor(properties: HistoryDocument) {
    super(properties);
  }
   readonly id: string;
   readonly created_date: Date;
   readonly current_streak: number;
   readonly mana_cap: number;
   readonly match_type: string;
   readonly player_1: string;
   readonly player_1_rating_final: number;
   readonly player_1_rating_initial: number;
   readonly player_2: string;
   readonly player_2_rating_final: number;
   readonly player_2_rating_initial: number;
   readonly rshares: number;
   readonly ruleset: number;
   readonly winner: string;
}