import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { DbModule } from '../db';
import { GameService } from './game.service';
import { ResultsService } from './results.service';
@Module({
  imports: [ApiModule, DbModule],
  providers: [GameService, ResultsService],
  exports: [GameService, ResultsService],
})
export class GameModule {}
