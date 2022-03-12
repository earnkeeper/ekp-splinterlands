export type PlayerCollectionDto = Readonly<{
  player: string;
  cards: PlayerCardDto[];
}>;

export type PlayerCardDto = Readonly<{
  player: string;
  uid: string;
  card_detail_id: number;
  xp: number;
  gold: boolean;
  edition: number;
  level: number;
}>;
