import { EkConfigService, SdkModule } from '@earnkeeper/ekp-sdk-nestjs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SplinterlandsApiService } from './api/splinterlands-api.service';
import { MarketplaceService } from './marketplace/marketplace.service';
import { MetadataService } from './metadata/metadata.service';
import { UiProcessor } from './ui/ui.processor';

@Module({
  imports: [
    MongooseModule.forRootAsync({ useClass: EkConfigService }),
    SdkModule,
  ],
  providers: [
    MarketplaceService,
    MetadataService,
    SplinterlandsApiService,
    UiProcessor,
  ],
})
export class WorkerApp {}
