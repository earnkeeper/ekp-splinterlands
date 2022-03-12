export type BattleDto = Readonly<{
  id: string;
  match_type: string;
  mana_cap: number;
  ruleset: string;
  players: PlayerDto[];
  winner: string;
  dec_info: DecInfoDto;
  details: DetailsDto;
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

export type DetailsDto = Readonly<{
  seed: string;
  rounds: RoundDto[];
  team1: TeamDetailedDto;
  team2: TeamDetailedDto;
  pre_battle: PreBattleActionDto[];
  winner: string;
  loser: string;
  type?: string;
}>;

export type RoundDto = Readonly<{
  num: number;
  actions: ActionDto[];
}>;

export type ActionDto = Readonly<{
  type: string;
  result: string;
  initiator: string;
  target: string;
  damage: number;
  state: {
    alive: boolean;
    stats: number[];
    base_health: number;
    other: any[][];
  };
}>;

export type TeamDetailedDto = Readonly<{
  player: string;
  rating: number;
  color: string;
  summoner: SummonerDto;
  monsters: MonsterDto[];
}>;

export type SummonerDto = Readonly<{
  uid: string;
  xp: number;
  gold: boolean;
  card_detail_id: number;
  level: number;
  edition: number;
  state: Readonly<{
    stats: number[];
    abilities: string[];
  }>;
}>;

export type MonsterDto = Readonly<{
  uid: string;
  xp: number;
  gold: boolean;
  card_detail_id: number;
  level: number;
  edition: number;
  state: Readonly<{
    alive: boolean;
    stats: number[];
    base_health: number;
    other: any[];
  }>;
  abilities: string[];
}>;

export type PreBattleActionDto = Readonly<{
  type: string;
  initiator: string;
  details: Readonly<{
    name: string;
    stats: Record<string, any>;
  }>;
  group_state: GroupStateDto[];
}>;

export type GroupStateDto = Readonly<{
  monster: string;
  state: {
    alive: boolean;
    stats: number[];
    base_health: number;
    other: any[];
  };
}>;
