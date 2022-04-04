import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [ApiModule, DbModule],
  providers: [LeaderboardController, LeaderboardService],
})
export class LeaderboardModule {}
