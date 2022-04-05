import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlayerDto, TeamDetailedDto } from '../../api';

export type BattleDocument = Battle & Document;
export const BATTLE_VERSION = 2;

@Schema()
export class Battle {
  @Prop({ index: true })
  readonly id: string;

  @Prop()
  version: number;

  @Prop()
  readonly blockNumber: number;

  @Prop()
  readonly timestamp: number;

  @Prop()
  readonly manaCap: number;

  @Prop()
  readonly ruleset?: string;

  @Prop([String])
  rulesets: string[];

  @Prop()
  readonly winner: string;

  @Prop()
  readonly loser: string;

  @Prop()
  readonly leagueName: string;

  @Prop({ type: 'array' })
  readonly players: PlayerDto[];

  @Prop({ type: 'object' })
  readonly team1: TeamDetailedDto;

  @Prop({ type: 'object' })
  readonly team2: TeamDetailedDto;
}

export const BattleSchema = SchemaFactory.createForClass(Battle)
  .index({
    blockNumber: 1,
  })
  .index(
    {
      timestamp: 1,
    },
    {
      expireAfterSeconds: 86400 * 14, // 14 days
    },
  )
  .index({
    timestamp: 1,
    manaCap: 1,
    rulesets: 1,
  })
  .index({
    version: 1,
    timestamp: 1,
  })
  .index({
    timestamp: 1,
    manaCap: 1,
    rulesets: 1,
    leagueName: 1,
  });
