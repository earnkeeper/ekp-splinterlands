import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { DbModule } from '../db';
import { MarketService, PlayerService, ResultsService } from './services';
@Module({
  imports: [ApiModule, DbModule],
  providers: [MarketService, ResultsService, PlayerService],
  exports: [MarketService, ResultsService, PlayerService],
})
export class GameModule {}
