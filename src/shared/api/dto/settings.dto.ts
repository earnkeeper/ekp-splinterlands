export type SettingsDto = Readonly<{
  // TODO: add more properties here
  leaderboard_prizes: Readonly<{ [leagueGroup: string]: number[] }>;
  season: Readonly<{
    id: number;
    name: string;
    ends: string;
  }>;
}>;
