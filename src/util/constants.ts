import {
  CollectionForm,
  HistoryForm,
  LeaderboardForm,
  MarketplaceForm,
  PlannerForm,
} from './forms';

export const DEFAULT_PLANNER_FORM: PlannerForm = {
  leagueGroup: 'All',
  manaCap: 13,
  playerName: '',
};

export const DEFAULT_LEADERBOARD_FORM: LeaderboardForm = {
  leagueGroup: 'Bronze',
  season: 84,
};

export const DEFAULT_MARKETPLACE_FORM: MarketplaceForm = {
  leagueGroup: 'All',
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

export const FREE_DAYS_TO_KEEP = 28;
export const PREMIUM_DAYS_TO_KEEP = 28;

export const SPLINTER_IMAGE_MAP = {
  Death:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-death-2.svg',
  Dragon:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-dragon-2.svg',
  Earth:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-earth-2.svg',
  Fire: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-fire-2.svg',
  Life: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-life-2.svg',
  Neutral:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-neutral-2.svg',
  Water:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-water-2.svg',
};

export const ROLE_IMAGE_MAP = {
  Monster:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-type-monster.svg',
  Summoner:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-type-summoner.svg',
};

export const EDITION_IMAGE_MAP = {
  Alpha:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-alpha.svg',
  Beta: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-beta.svg',
  Promo:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-promo.svg',
  Reward:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-reward.svg',
  Untamed:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-untamed.svg',
  Dice: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-dice.svg',
  Gladius:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-gladius.svg',
  Chaos:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-chaos.svg',
  Unknown: 'https://www.iconsdb.com/icons/preview/black/question-mark-6-xl.png',
};

export const FOIL_IMAGE_MAP = {
  Regular:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon_foil_standard.svg',
  Gold: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon_foil_gold.svg',
};

export const RARITY_IMAGE_MAP = {
  Common:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-rarity-common.svg',
  Rare: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-rarity-rare.svg',
  Epic: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-rarity-epic.svg',
  Legendary:
    'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-rarity-legendary.svg',
};

export const MANA_IMAGE =
  'https://d36mxiodymuqjm.cloudfront.net/website/stats/stat_bg_mana.png';
export const MELEE_IMAGE =
  'https://d36mxiodymuqjm.cloudfront.net/website/stats/melee-attack.png';
export const SPEED_IMAGE =
  'https://d36mxiodymuqjm.cloudfront.net/website/stats/speed.png';
export const DEFENSE_IMAGE =
  'https://d36mxiodymuqjm.cloudfront.net/website/stats/defense.png';
export const HEALTH_IMAGE =
  'https://d36mxiodymuqjm.cloudfront.net/website/stats/health.png';

export const QUEST_IMAGE_MAP = {
  Earth:
    'https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/quests/btn_round_earth_active.svg',
  Death:
    'https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/quests/btn_round_death_active.svg',
  Life: 'https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/quests/btn_round_life_active.svg',
  Water:
    'https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/quests/btn_round_water_active.svg',
  Fire: 'https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/quests/btn_round_fire_active.svg',
  Dragon:
    'https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/quests/btn_round_dragon_active.svg',
  'No Neutral':
    'https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/quests/btn_round_no_neutral_active.svg',
  Sneak:
    'https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/quests/btn_round_sneak_active.svg',
  Snipe:
    'https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/quests/btn_round_snipe_active.svg',
};

export const CACHE_STATS_VIEW_BAG = 'CACHE_STATS_VIEW_BAG';
export const CACHE_STATS_BATTLES_BY_LEAGUE = 'CACHE_STATS_BATTLES_BY_LEAGUE';
export const CACHE_STATS_BATTLES_BY_TIMESTAMP =
  'CACHE_STATS_BATTLES_BY_TIMESTAMP';
export const CACHE_STATS_BATTLES_BY_MANA_CAP =
  'CACHE_STATS_BATTLES_BY_MANA_CAP';
