export type SettingsDto = Readonly<{
  // TODO: add more properties here
  alpha_xp: number[];
  gold_xp: number[];
  beta_xp: number[];
  beta_gold_xp: number[];
  combine_rates: number[][];
  combine_rates_gold: number[][];
  leaderboard_prizes: Readonly<{ [leagueGroup: string]: number[] }>;
  season: Readonly<{
    id: number;
    name: string;
    ends: string;
  }>;
  xp_levels: number[][];
}>;
