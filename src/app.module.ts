import { EkConfigService, SdkModule } from '@earnkeeper/ekp-sdk-nestjs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModule } from './shared/api/api.module';
import { BattleModule } from './battle/battle.module';
import { EkpModule } from './ekp/ekp.module';

export const MODULE_DEF = {
  imports: [
    MongooseModule.forRootAsync({ useClass: EkConfigService }),
    ApiModule,
    BattleModule,
    EkpModule,
    SdkModule,
  ],
};

@Module(MODULE_DEF)
export class AppModule {}
