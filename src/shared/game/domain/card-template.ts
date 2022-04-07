export type CardTemplate = Readonly<{
  id: number;
  distributions: CardDistribution[];
  mana: number[] | number;
  name: string;
  rarity: number;
  splinter: string;
  type: string;
}>;

export type CardDistribution = Readonly<{
  edition: string;
  editionNumber: number;
  gold: boolean;
}>;
