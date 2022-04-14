import _ from 'lodash';

/**
 * List of base card detail ids, not available on the API, so provided here.
 * These are the starter cards given to players when they first get started in the game.
 */
export const BASE_CARD_DETAIL_IDS = [
  135, 136, 137, 138, 139, 140, 141, 145, 146, 147, 148, 149, 150, 151, 152,
  156, 157, 158, 159, 160, 161, 162, 163, 167, 168, 169, 170, 171, 172, 173,
  174, 178, 179, 180, 181, 182, 183, 184, 185, 189, 190, 191, 192, 193, 194,
  195, 196, 224, 353, 354, 355, 356, 357, 358, 359, 360, 361, 367, 368, 369,
  370, 371, 372, 373, 374, 375, 381, 382, 383, 384, 385, 386, 387, 388, 389,
  395, 396, 397, 398, 399, 400, 401, 402, 403, 409, 410, 411, 412, 413, 414,
  415, 416, 417, 423, 424, 425, 426, 427, 428, 429, 437, 438, 439, 440, 441,
];

export const SPLINTERS = [
  'Fire',
  'Water',
  'Earth',
  'Life',
  'Death',
  'Dragon',
  'Neutral',
];

// TODO: dynamically fetch from settings api
export const RULESETS = [
  {
    active: true,
    name: 'Standard',
    description:
      'No modification to the standard gameplay rules and mechanics.',
  },
  {
    active: true,
    type: 'primary',
    name: 'Back to Basics',
    description: 'Monsters lose all abilities.',
    invalid: ['Healed Out', 'Heavy Hitters'],
  },
  {
    active: true,
    type: 'primary',
    name: 'Silenced Summoners',
    description:
      'Summoners do not give any stat buffs or debuffs or grant/use any abilities.',
    weight: 1,
  },
  {
    active: true,
    type: 'primary',
    name: 'Aim True',
    description: 'Melee and Ranged attacks always hit their target.',
  },
  {
    active: true,
    type: 'primary',
    name: 'Super Sneak',
    description: 'All Melee attack Monsters have the Sneak ability.',
    invalid: ['Melee Mayhem', 'Keep Your Distance'],
  },
  {
    active: true,
    type: 'primary',
    name: 'Weak Magic',
    description: 'Magic attacks hit Armor before reducing Health.',
    invalid: ['Up Close & Personal', 'Lost Magic'],
  },
  {
    active: true,
    type: 'primary',
    name: 'Unprotected',
    description:
      'Monsters do not have any armor and do not get armor from Abilities or Summoner Buffs.',
  },
  {
    active: true,
    type: 'primary',
    name: 'Target Practice',
    description: 'All Ranged and Magic attack Monsters have the Snipe ability.',
    invalid: ['Up Close & Personal'],
  },
  {
    active: true,
    type: 'primary',
    name: 'Fog of War',
    description: 'Monsters lose the Sneak and Snipe abilities.',
  },
  {
    active: true,
    type: 'primary',
    name: 'Armored Up',
    description:
      'All Monsters have 2 Armor in addition to their normal Armor stat.',
    weight: 1,
  },
  {
    active: true,
    type: 'any',
    name: 'Healed Out',
    description:
      'All healing abilities are removed from Monsters and Summoners.',
    weight: 1,
  },
  {
    active: true,
    type: 'any',
    name: 'Earthquake',
    description:
      'Non-flying Monsters take 2 Melee damage at the end of each round.',
    weight: 1,
  },
  {
    active: true,
    type: 'any',
    name: 'Reverse Speed',
    description:
      'Monsters with the lowest Speed attack first and have the highest chance of evading attacks.',
  },
  {
    active: true,
    type: 'any',
    name: 'Close Range',
    description: 'Ranged attacks may be used in the first position in battles.',
    weight: 1,
    invalid: ['Broken Arrows', 'Up Close & Personal'],
  },
  {
    active: true,
    type: 'any',
    name: 'Heavy Hitters',
    description: 'All Monsters have the Knock Out ability.',
    invalid: ['Back to Basics'],
  },
  {
    active: true,
    type: 'any',
    name: 'Equalizer',
    description:
      'The initial Health of all Monsters is equal to that of the Monster on either team with the highest base Health.',
  },
  {
    active: true,
    type: 'secondary',
    name: 'Keep Your Distance',
    description: 'Monsters with Melee attack may not be used in battles.',
    weight: 1,
  },
  {
    active: true,
    type: 'secondary',
    name: 'Lost Legendaries',
    description: 'Legendary Monsters may not be used in battles.',
  },
  {
    active: true,
    type: 'secondary',
    name: 'Melee Mayhem',
    description: 'Melee attack Monsters can attack from any position.',
  },
  {
    active: true,
    type: 'secondary',
    name: 'Taking Sides',
    description: 'Neutral Monsters may not be used in battles.',
  },
  {
    active: true,
    type: 'secondary',
    name: 'Rise of the Commons',
    description: 'Only Common and Rare Monsters may be used in battles.',
  },
  {
    active: true,
    type: 'secondary',
    name: 'Up Close & Personal',
    description: 'Only Monsters with Melee attack may be used in battles.',
  },
  {
    active: true,
    type: 'secondary',
    name: 'Broken Arrows',
    description: 'Ranged attack Monsters may not be used in battles.',
    weight: 1,
  },
  {
    active: true,
    type: 'secondary',
    name: 'Little League',
    description:
      'Only Monsters & Summoners that cost 4 Mana or less may be used in battles.',
  },
  {
    active: true,
    type: 'secondary',
    name: 'Lost Magic',
    description: 'Monsters with Magic attack may not be used in battles.',
    weight: 1,
    invalid: ['Weak Magic'],
  },
  {
    active: true,
    type: 'secondary',
    name: 'Even Stevens',
    description: 'Only Monsters with even Mana costs may be used in battles.',
    weight: 1,
  },
  {
    active: true,
    type: 'secondary',
    name: 'Odd Ones Out',
    description: 'Only Monsters with odd Mana costs may be used in battles.',
    weight: 1,
  },
  {
    active: true,
    type: 'any',
    name: 'Noxious Fumes',
    description: 'All Monsters start the battle Poisoned.',
    weight: 1,
  },
  {
    active: true,
    type: 'any',
    name: 'Stampede',
    description:
      'The Trample ability can trigger multiple times per attack if the trampled Monster is killed.',
    weight: 1,
    invalid: ['Keep Your Distance'],
  },
  {
    active: true,
    type: 'primary',
    name: 'Equal Opportunity',
    description: 'All Monsters have the Opportunity ability.',
    weight: 1,
  },
  {
    active: true,
    type: 'any',
    name: 'Explosive Weaponry',
    description: 'All Monsters have the Blast ability',
    weight: 1,
  },
  {
    active: true,
    type: 'any',
    name: 'Holy Protection',
    description: 'All Monsters have the Divine Shield ability.',
    weight: 1,
  },
  {
    active: true,
    type: 'any',
    name: 'Spreading Fury',
    description: 'All Monsters have the Enrage ability.',
    weight: 1,
  },
];

export const RULESET_IMAGE_MAP = _.chain(RULESETS)
  .map((it) => {
    const kebabCase = _.kebabCase(it.name);
    return {
      key: it.name,
      value: `https://d36mxiodymuqjm.cloudfront.net/website/icons/rulesets/new/img_combat-rule_${kebabCase}_150.png`,
    };
  })
  .keyBy('key')
  .mapValues((it) => it.value)
  .value();

export const MANA_CAPS = _.chain(_.range(12, 50))
  .union([99])
  .map((it) => it.toString())
  .value();

export const LEAGUES = [
  {
    number: 1,
    name: 'Novice',
    group: 'Novice',
    league_limit: 3,
    level: 0,
    min_rating: 0,
    min_power: 0,
    season_rating_reset: 0,
  },
  {
    number: 2,
    name: 'Bronze III',
    group: 'Bronze',
    league_limit: 3,
    level: 1,
    min_rating: 100,
    min_power: 0,
    season_rating_reset: 0,
  },
  {
    number: 3,
    name: 'Bronze II',
    group: 'Bronze',
    league_limit: 3,
    level: 1,
    min_rating: 400,
    min_power: 1000,
    season_rating_reset: 100,
  },
  {
    number: 4,
    name: 'Bronze I',
    group: 'Bronze',
    league_limit: 3,
    level: 1,
    min_rating: 700,
    min_power: 5000,
    season_rating_reset: 300,
  },
  {
    number: 5,
    name: 'Silver III',
    group: 'Silver',
    league_limit: 6,
    level: 2,
    min_rating: 1000,
    min_power: 15000,
    season_rating_reset: 500,
  },
  {
    number: 6,
    name: 'Silver II',
    group: 'Silver',
    league_limit: 6,
    level: 2,
    min_rating: 1300,
    min_power: 40000,
    season_rating_reset: 700,
  },
  {
    number: 7,
    name: 'Silver I',
    group: 'Silver',
    league_limit: 6,
    level: 2,
    min_rating: 1600,
    min_power: 70000,
    season_rating_reset: 900,
  },
  {
    number: 8,
    name: 'Gold III',
    group: 'Gold',
    league_limit: 9,
    level: 3,
    min_rating: 1900,
    min_power: 100000,
    season_rating_reset: 1200,
  },
  {
    number: 9,
    name: 'Gold II',
    group: 'Gold',
    league_limit: 9,
    level: 3,
    min_rating: 2200,
    min_power: 150000,
    season_rating_reset: 1400,
  },
  {
    number: 10,
    name: 'Gold I',
    group: 'Gold',
    league_limit: 9,
    level: 3,
    min_rating: 2500,
    min_power: 200000,
    season_rating_reset: 1600,
  },
  {
    number: 11,
    name: 'Diamond III',
    group: 'Diamond',
    league_limit: 12,
    level: 4,
    min_rating: 2800,
    min_power: 250000,
    season_rating_reset: 1900,
  },
  {
    number: 12,
    name: 'Diamond II',
    group: 'Diamond',
    league_limit: 12,
    level: 4,
    min_rating: 3100,
    min_power: 325000,
    season_rating_reset: 2200,
  },
  {
    number: 13,
    name: 'Diamond I',
    group: 'Diamond',
    league_limit: 12,
    level: 4,
    min_rating: 3400,
    min_power: 400000,
    season_rating_reset: 2500,
  },
  {
    number: 14,
    name: 'Champion III',
    group: 'Champion',
    league_limit: 15,
    level: 4,
    min_rating: 3700,
    min_power: 500000,
    season_rating_reset: 2800,
  },
  {
    number: 15,
    name: 'Champion II',
    group: 'Champion',
    league_limit: 15,
    level: 4,
    min_rating: 4200,
    min_power: 500000,
    season_rating_reset: 3100,
  },
  {
    number: 16,
    name: 'Champion I',
    group: 'Champion',
    league_limit: 15,
    level: 4,
    min_rating: 4700,
    min_power: 500000,
    season_rating_reset: 3400,
  },
];

export const LEAGUE_GROUPS = [
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
