export type SettingsDto = Readonly<{
  // TODO: add more properties here
  leaderboard_prizes: Readonly<{ [leagueName: string]: number[] }>;
  season: Readonly<{
    id: number;
    name: string;
    ends: string;
  }>;
}>;
