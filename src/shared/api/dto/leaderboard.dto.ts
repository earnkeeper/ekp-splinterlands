export type LeaderboardDto = Readonly<{
  player: string;
  leaderboard: LeaderDto[];
}>;

export type LeaderDto = Readonly<{
  rank: number;
  season: number;
  player: string;
  rating: number;
  battles: number;
  wins: number;
  longest_streak: number;
  max_rating: number;
  league: number;
  max_league: number;
  guild_id: string;
  guild_name: string;
  guild_data: string;
  avatar_id: number;
}>;
