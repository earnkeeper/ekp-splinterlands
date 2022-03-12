import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BattleRepository } from './battle/battle.repository';
import { Battle, BattleSchema } from './battle/battle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Battle.name, schema: BattleSchema }]),
  ],
  providers: [BattleRepository],
  exports: [BattleRepository],
})
export class BattleModule {}
