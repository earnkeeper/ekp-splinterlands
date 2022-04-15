import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CardStatsDocument = CardStats & Document;

@Schema({ collection: 'cardstats_v4' })
export class CardStats {
  @Prop()
  readonly id: string;

  @Prop()
  readonly hash: string;

  @Prop()
  blockNumber: number;

  @Prop()
  readonly level: number;

  @Prop()
  readonly templateId: number;

  @Prop()
  readonly gold: boolean;

  @Prop()
  readonly editionNumber: number;

  @Prop({ type: 'array' })
  readonly dailyBattleStats: DailyBattleStats[];
}

export const CardStatsSchema = SchemaFactory.createForClass(CardStats)
  .index({ id: 1 }, { unique: true })
  .index({ blockNumber: 1 });

export type DailyBattleStats = {
  battles: number;
  readonly day: string;
  readonly leagueGroup: string;
  wins: number;
};
