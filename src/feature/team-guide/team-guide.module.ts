import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { GameModule } from '../../shared/game';
import { TeamGuideController } from './team-guide.controller';
import { TeamGuideService } from './team-guide.service';
@Module({
  imports: [ApiModule, DbModule, GameModule],

  providers: [TeamGuideController, TeamGuideService],
})
export class TeamGuideModule {}
