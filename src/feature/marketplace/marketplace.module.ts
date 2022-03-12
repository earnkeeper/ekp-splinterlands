import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { GameModule } from '../../shared/game';
import { MarketplaceController } from './marketplace.controller';

@Module({
  imports: [ApiModule, GameModule],

  providers: [MarketplaceController],
})
export class MarketplaceModule {}
