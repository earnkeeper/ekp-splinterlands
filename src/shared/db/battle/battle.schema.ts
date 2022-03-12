import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BattleDto, PlayerDto } from '../../api';

export type BattleDocument = Battle & Document;

@Schema()
export class Battle {
  @Prop({ index: true })
  readonly id: string;
  @Prop()
  readonly blockNumber: number;
  @Prop()
  readonly timestamp: number;
  @Prop()
  readonly manaCap: number;
  @Prop()
  readonly ruleset: string;
  @Prop({ type: 'array' })
  readonly players: PlayerDto[];
  @Prop({ type: 'object' })
  readonly raw: BattleDto;
}

export const BattleSchema = SchemaFactory.createForClass(Battle)
  .index({
    blockNumber: 1,
  })
  .index({
    timestamp: 1,
    manaCap: 1,
    ruleset: 1,
  });
