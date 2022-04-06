export type BattleDetailsDto = Readonly<{
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
