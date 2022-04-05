export type PlayerBattlesDto = Readonly<{
  player: string;
  battles: PlayerBattleDto[];
}>;

export type PlayerBattleDto = Readonly<{
  battle_queue_id_1: string;
  battle_queue_id_2: string;
  player_1_rating_initial: number;
  player_2_rating_initial: number;
  winner: string;
  player_1_rating_final: number;
  player_2_rating_final: number;
  details: string;
  player_1: string;
  player_2: string;
  created_date: string;
  match_type: string;
  mana_cap: number;
  current_strak: number;
  ruleset: string;
  inactive: string;
  settings: string;
  block_num: number;
  rshares: number;
  dec_info: string;
  leaderboard: number;
  reward_dec: string;
}>;
