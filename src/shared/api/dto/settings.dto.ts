export type SettingsDto = Readonly<{
  // TODO: add more properties here
  leaderboard_prizes: { [leagueName: string]: number[] };
}>;
