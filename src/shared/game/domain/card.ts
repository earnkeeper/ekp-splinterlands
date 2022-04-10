export type Card = Readonly<{
  edition: string;
  editionNumber: number;
  foil: 'Gold' | 'Regular';
  gold: boolean;
  hash: string;
  id: string;
  level: number;
  name: string;
  power: number;
  rarityNumber: number;
  rarity: string;
  splinter: string;
  stats: CardStats;
  templateId: number;
  type: string;
  xp?: number;
}>;

export type CardStats = Readonly<{
  abilities: string[];
  armor: number;
  attack: number;
  health: number;
  magic: number;
  mana: number;
  ranged: number;
  speed: number;
}>;
