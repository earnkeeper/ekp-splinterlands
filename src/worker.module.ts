import { EkConfigService, SdkModule } from '@earnkeeper/ekp-sdk-nestjs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectionModule } from './feature/collection/collection.module';
import { DecksModule } from './feature/decks/decks.module';
import { HistoryModule } from './feature/history/history.module';
import { LeaderboardModule } from './feature/leaderboard/leaderboard.module';
import { MarketplaceModule } from './feature/marketplace/marketplace.module';
import { PlannerModule } from './feature/planner/planner.module';
import { QueueModule } from './shared/queue/queue.module';

export const MODULE_DEF = {
  imports: [
    MongooseModule.forRootAsync({ useClass: EkConfigService }),
    CollectionModule,
    DecksModule,
    HistoryModule,
    LeaderboardModule,
    MarketplaceModule,
    PlannerModule,
    QueueModule,
    SdkModule,
  ],
};

@Module(MODULE_DEF)
export class WorkerModule {}
