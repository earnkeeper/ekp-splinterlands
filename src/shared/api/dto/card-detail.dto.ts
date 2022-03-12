export type CardDetailDto = Readonly<{
  color: string;
  created_block_num: number;
  distribution: CardDistributionDto[];
  drop_rate: number;
  editions: string;
  id: number;
  is_promo: boolean;
  is_starter: false;
  last_update_tx: string;
  name: string;
  rarity: number;
  stats: CardStatsDto;
  total_printed: number;
  type: string;
}>;

export type CardStatsDto = Readonly<{
  abilities: string[][];
  armor: number[];
  attack: number[];
  health: number[];
  magic: number[];
  mana: number | number[];
  ranged: number[];
  speed: number[];
}>;

export type CardDistributionDto = Readonly<{
  card_detail_id: number;
  edition: number;
  gold: boolean;
  num_burned: string;
  num_cards: string;
  total_burned_xp: string;
  total_xp: string;
}>;
