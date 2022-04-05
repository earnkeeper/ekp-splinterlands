import { BattleDetailsDto } from './battle-details.dto';

export type BattleDto = Readonly<{
  id: string;
  match_type: string;
  mana_cap: number;
  ruleset: string;
  players: PlayerDto[];
  winner: string;
  dec_info: DecInfoDto;
  details: BattleDetailsDto;
}>;

export type PlayerDto = Readonly<{
  name: string;
  initial_rating: number;
  final_rating: number;
  team: TeamSummaryDto;
}>;

export type TeamSummaryDto = Readonly<{
  summoner: string;
  monsters: string[];
}>;

export type DecInfoDto = Readonly<{
  rshares: number;
  capture_rate: number;
  reward: number;
  bonuses: Readonly<{
    streak: Readonly<{
      wins: number;
      bonus: number;
    }>;
    gold: Readonly<{
      cards: number;
      bonus: number;
    }>;
    alpha: Readonly<{
      cards: number;
      bonus: number;
    }>;
    beta: Readonly<{
      cards: number;
      bonus: number;
    }>;
    guild: Readonly<{
      level: number;
      bonus: number;
    }>;
  }>;
}>;
