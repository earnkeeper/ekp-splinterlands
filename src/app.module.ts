import { EkConfigService, SdkModule } from '@earnkeeper/ekp-sdk-nestjs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DecksModule } from './feature/decks/decks.module';
import { LeaderboardModule } from './feature/leaderboard/leaderboard.module';
import { MarketplaceModule } from './feature/marketplace/marketplace.module';
import { PlannerModule } from './feature/planner/planner.module';
import { ScheduleModule } from './feature/schedule/schedule.module';

export const MODULE_DEF = {
  imports: [
    MongooseModule.forRootAsync({ useClass: EkConfigService }),
    DecksModule,
    LeaderboardModule,
    MarketplaceModule,
    PlannerModule,
    ScheduleModule,
    SdkModule,
  ],
};

@Module(MODULE_DEF)
export class AppModule {}
