import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { GameModule } from '../../shared/game';
import { BattlePlannerController } from './battle-planner.controller';
import { BattlePlannerService } from './battle-planner.service';
@Module({
  imports: [ApiModule, DbModule, GameModule],

  providers: [BattlePlannerController, BattlePlannerService],
})
export class BattlePlannerModule {}
