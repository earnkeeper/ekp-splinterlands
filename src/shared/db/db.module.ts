import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BattleRepository } from './battle/battle.repository';
import { Battle, BattleSchema } from './battle/battle.schema';
import { CardStats, CardStatsSchema } from './card';
import { CardStatsRepository } from './card/card-stats.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Battle.name, schema: BattleSchema },
      { name: CardStats.name, schema: CardStatsSchema },
    ]),
  ],
  providers: [BattleRepository, CardStatsRepository],
  exports: [BattleRepository, CardStatsRepository],
})
export class DbModule {}
