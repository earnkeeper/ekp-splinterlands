export class NftMetadataDto {
  constructor(properties: NftMetadataDto) {
    Object.assign(this, properties);
  }

  attributes: [{ trait_type: string; value: any }];
  background_color: string;
  description: string;
  external_url: string;
  image: string;
  name: string;

  attribute(traitType: string) {
    return this.attributes?.find((it) => it.trait_type === traitType)?.value;
  }
}
