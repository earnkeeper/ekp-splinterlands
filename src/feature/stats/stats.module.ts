import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { GameModule } from '../../shared/game/game.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [ApiModule, DbModule, GameModule],
  providers: [StatsController, StatsService],
})
export class StatsModule {}
