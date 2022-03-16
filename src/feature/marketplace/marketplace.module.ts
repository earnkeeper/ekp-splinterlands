import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { GameModule } from '../../shared/game';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

@Module({
  imports: [ApiModule, DbModule, GameModule],

  providers: [MarketplaceController, MarketplaceService],
})
export class MarketplaceModule {}
