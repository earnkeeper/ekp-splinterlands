import { BattleForm, LeaderboardForm } from './forms';

export const DEFAULT_BATTLE_FORM: BattleForm = {
  leagueGroup: 'All',
  manaCap: 13,
  playerName: '',
  ruleset: 'Standard',
};

export const DEFAULT_LEADERBOARD_FORM: LeaderboardForm = {
  leagueGroup: 'Bronze',
  season: 84,
};

export const FREE_DAYS_TO_KEEP = 1;
export const PREMIUM_DAYS_TO_KEEP = 14;
