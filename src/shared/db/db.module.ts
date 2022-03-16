import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BattleRepository } from './battle/battle.repository';
import { Battle, BattleSchema } from './battle/battle.schema';
import { Card, CardSchema } from './card';
import { CardRepository } from './card/card.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Battle.name, schema: BattleSchema },
      { name: Card.name, schema: CardSchema },
    ]),
  ],
  providers: [BattleRepository, CardRepository],
  exports: [BattleRepository, CardRepository],
})
export class DbModule {}
