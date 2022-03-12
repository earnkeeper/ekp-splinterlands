import { EkConfigService, SdkModule } from '@earnkeeper/ekp-sdk-nestjs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceModule } from './feature/marketplace/marketplace.module';
import { ScheduleModule } from './feature/schedule/schedule.module';
import { TeamGuideModule } from './feature/team-guide/team-guide.module';

export const MODULE_DEF = {
  imports: [
    MongooseModule.forRootAsync({ useClass: EkConfigService }),
    MarketplaceModule,
    SdkModule,
    ScheduleModule,
    TeamGuideModule,
  ],
};

@Module(MODULE_DEF)
export class AppModule {}
