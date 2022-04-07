import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { DbModule } from '../db';
import { CardService, MarketService, ResultsService } from './services';

@Module({
  imports: [ApiModule, DbModule],
  providers: [CardService, MarketService, ResultsService, CardService],
  exports: [CardService, MarketService, ResultsService, CardService],
})
export class GameModule {}
