import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IgnDocument = Ign & Document;

@Schema()
export class Ign {
  @Prop()
  readonly id: string;
}

export const IgnSchema = SchemaFactory.createForClass(Ign).index(
  { id: 1 },
  { unique: true },
);
