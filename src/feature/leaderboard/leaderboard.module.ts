import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { GameModule } from '../../shared/game';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
@Module({
  imports: [ApiModule, DbModule, GameModule],
  providers: [LeaderboardController, LeaderboardService],
})
export class LeaderboardModule {}
