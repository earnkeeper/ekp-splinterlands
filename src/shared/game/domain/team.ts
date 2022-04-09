import { Card } from './card';

export type Team = Readonly<{
  playerName: string;
  summoner: Card;
  monsters: Card[];
}>;
