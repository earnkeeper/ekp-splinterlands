import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { GameModule } from '../../shared/game';
import { BattlesController } from './battles.controller';
import { BattlesService } from './battles.service';

@Module({
  imports: [ApiModule, DbModule, GameModule],

  providers: [BattlesService, BattlesController],
})
export class BattlesModule {}
