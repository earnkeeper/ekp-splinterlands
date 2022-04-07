import {
  BattleForm,
  CollectionForm,
  HistoryForm,
  LeaderboardForm,
} from './forms';

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

export const DEFAULT_HISTORY_FORM: HistoryForm = {
  playerName: '',
};

export const DEFAULT_COLLECTION_FORM: CollectionForm = {
  playerName: '',
};

export const LEADERBOARD_LEAGUES = [
  {
    id: 0,
    name: 'Bronze',
  },
  {
    id: 1,
    name: 'Silver',
  },
  {
    id: 2,
    name: 'Gold',
  },
  {
    id: 3,
    name: 'Diamond',
  },
  {
    id: 4,
    name: 'Champion',
  },
];

export const FREE_DAYS_TO_KEEP = 1;
export const PREMIUM_DAYS_TO_KEEP = 14;
