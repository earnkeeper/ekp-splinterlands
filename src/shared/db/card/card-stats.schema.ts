import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CardStatsDocument = CardStats & Document;

@Schema()
export class CardStats {
  @Prop({ index: true })
  readonly id: number;

  @Prop({ index: true })
  blockNumber: number;

  @Prop({ type: 'object' })
  readonly dailyStats: Record<string, { wins: number; battles: number }>;
}

export const CardStatsSchema = SchemaFactory.createForClass(CardStats);
