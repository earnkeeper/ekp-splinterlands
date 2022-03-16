import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CardDocument = Card & Document;

@Schema()
export class Card {
  @Prop({ index: true })
  readonly id: number;

  @Prop({ index: true })
  blockNumber: number;

  @Prop({ type: 'object' })
  readonly dailyStats: Record<string, { wins: number; battles: number }>;
}

export const CardSchema = SchemaFactory.createForClass(Card);
