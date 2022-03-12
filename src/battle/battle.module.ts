import { SdkModule } from '@earnkeeper/ekp-sdk-nestjs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModule } from '../shared/api/api.module';
import { BattleRepository } from '../shared/db/battle/battle.repository';
import { Battle, BattleSchema } from './repository/battle.schema';
import { BattleScheduleService } from './schedule/battle-schedule.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Battle.name, schema: BattleSchema }]),
    ApiModule,
    SdkModule,
  ],
  providers: [BattleRepository, BattleScheduleService],
  exports: [BattleRepository, BattleScheduleService],
})
export class BattleModule {}
