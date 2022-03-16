import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { GameModule } from '../../shared/game';
import { MarketplaceController } from './marketplace.controller';

@Module({
  imports: [ApiModule, DbModule, GameModule],

  providers: [MarketplaceController],
})
export class MarketplaceModule {}
