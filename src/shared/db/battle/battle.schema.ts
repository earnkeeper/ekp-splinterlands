import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PREMIUM_DAYS_TO_KEEP } from '../../../util';
import { PlayerDto, TeamDetailedDto } from '../../api';

export type BattleDocument = Battle & Document;
export const BATTLE_VERSION = 1;

@Schema({ collection: 'battles_v7' })
export class Battle {
  @Prop()
  readonly id: string;

  @Prop()
  readonly version: number;

  @Prop()
  readonly blockNumber: number;

  @Prop()
  readonly timestamp: number;

  @Prop()
  readonly manaCap: number;

  @Prop()
  readonly ruleset?: string;

  @Prop([String])
  readonly rulesets: string[];

  @Prop([String])
  readonly cardHashes: string[];

  @Prop({ type: Date })
  readonly timestampDate: Date;

  @Prop()
  readonly fetched: number;

  @Prop({ type: Date })
  readonly fetchedDate: Date;

  @Prop()
  readonly source: string;

  @Prop()
  readonly winner: string;

  @Prop()
  readonly loser: string;

  @Prop()
  readonly leagueGroup: string;

  @Prop({ type: 'array' })
  readonly players: PlayerDto[];

  @Prop({ type: 'object' })
  readonly team1: TeamDetailedDto;

  @Prop({ type: 'object' })
  readonly team2: TeamDetailedDto;
}

export const BattleSchema = SchemaFactory.createForClass(Battle)
  .index({ id: 1 }, { unique: true })
  .index({
    blockNumber: 1,
    source: 1,
  })
  .index(
    {
      timestamp: 1,
    },
    {
      expires: `${PREMIUM_DAYS_TO_KEEP}d`,
    },
  )
  .index({
    timestamp: 1,
    manaCap: 1,
  })
  .index({
    version: 1,
    timestamp: 1,
  })
  .index({
    timestamp: 1,
    manaCap: 1,
  })
  .index({
    timestamp: -1,
    cardHashes: 1,
  })
  .index({
    timestamp: -1,
    cardHashes: 1,
    manaCap: 1,
  })
  .index({
    source: 1,
    day: 1,
  })
  .index({
    source: 1,
    leagueGroup: 1,
  })
  .index({
    source: 1,
    fetchedDay: 1,
  })
  .index({
    source: 1,
    manaCap: 1,
  });
