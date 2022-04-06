export type HistoryDto = Readonly<{
   playerame: string;
   battles: BattlesDto[];
  }>;
  
  export type BattlesDto= Readonly<{
    id: string;
    created_date: Date;
    current_streak: number;
    mana_cap: number;
    match_type: string;
    player_1: string;
    player_1_rating_final: number;
    player_1_rating_initial: number;
    player_2: string;
    player_2_rating_final: number;
    player_2_rating_initial: number;
    rshares: number;
    ruleset: number;
    winner: string;
  }>;
  


