import { Module } from '@nestjs/common';
import { ApiModule } from '../shared/api/api.module';
import { BattleModule } from '../battle/battle.module';
import { MarketplaceHandler } from './marketplace/marketplace.handler';
import { TeamGuideHandler } from '../feature/team-guide/team-guide.controller';
import { UiHandler } from './ui/ui.controller';

@Module({
  imports: [ApiModule, BattleModule],
  providers: [MarketplaceHandler, TeamGuideHandler, UiHandler],
})
export class EkpModule {}
