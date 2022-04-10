export type CardTemplate = Readonly<{
  id: number;
  distributions: CardDistribution[];
  name: string;
  rarity: number;
  splinter: string;
  stats: CardStatsTemplate;
  type: string;
}>;

export type CardDistribution = Readonly<{
  edition: string;
  editionNumber: number;
  gold: boolean;
}>;

export type CardStatsTemplate = Readonly<{
  abilities: string[][];
  armor: number[];
  attack: number[];
  health: number[];
  magic: number[];
  mana: number | number[];
  ranged: number[];
  speed: number[];
}>;
