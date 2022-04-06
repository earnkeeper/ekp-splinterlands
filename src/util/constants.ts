import { HistoryForm } from './forms/history-form';

export const DEFAULT_BATTLE_FORM = {
  leagueName: 'All',
  manaCap: 13,
  playerName: '',
  ruleset: 'Standard',
};

export const DEFAULT_LEADERBOARD_FORM = {
  leagueName: 'Bronze',
  season: 84,
};

export const DEFAULT_HISTORY_FORM: HistoryForm = {
  playerName: '',
  leagueName: 'Bronze',
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
