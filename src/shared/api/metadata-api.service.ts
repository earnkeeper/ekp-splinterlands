import { AbstractApiService, getAndHandle } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { NftMetadataDto } from './dto/nft-metadata.dto';

@Injectable()
export class MetadataApiService extends AbstractApiService {
  constructor() {
    super({
      name: `${process.env.EKP_PLUGIN_ID}_MetadataService`,
      limit: 20,
    });
  }

  async fetchMetadata(url: string): Promise<NftMetadataDto> {
    return this.handleCall({ ttl: 0, url }, async () => {
      const response = await getAndHandle(url, { allow404: true });
      return response.data;
    });
  }
}
