import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { GameModule } from '../../shared/game';
import { PlannerController } from './planner.controller';
import { PlannerService } from './planner.service';
@Module({
  imports: [ApiModule, DbModule, GameModule],

  providers: [PlannerController, PlannerService],
})
export class PlannerModule {}
