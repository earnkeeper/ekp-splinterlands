import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BattleRepository } from './battle/battle.repository';
import { Battle, BattleSchema } from './battle/battle.schema';
import { CardStats, CardStatsSchema } from './card';
import { CardStatsRepository } from './card/card-stats.repository';
import { Ign, IgnRepository, IgnSchema } from './ign';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Battle.name, schema: BattleSchema },
      { name: CardStats.name, schema: CardStatsSchema },
      { name: Ign.name, schema: IgnSchema },
    ]),
  ],
  providers: [BattleRepository, CardStatsRepository, IgnRepository],
  exports: [BattleRepository, CardStatsRepository, IgnRepository],
})
export class DbModule {}
