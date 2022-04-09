export type Card = Readonly<{
  edition: string;
  editionNumber: number;
  foil: 'Gold' | 'Regular';
  gold: boolean;
  hash: string;
  id: string;
  level: number;
  mana: number;
  name: string;
  power: number;
  rarityNumber: number;
  rarity: string;
  splinter: string;
  templateId: number;
  type: string;
  xp?: number;
}>;
