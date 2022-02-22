import _ from 'lodash';

export function parseTokenUri(base64: string): TokenDetails {
  if (!base64.startsWith('data:application/json;base64,')) {
    return undefined;
  }

  const parsed = JSON.parse(
    atob(base64.replace('data:application/json;base64,', '')),
  );

  const tokenDetails: TokenDetails = {
    name: parsed.name,
    description: parsed.description,
    image: parsed.image,
    attributes: _.chain(parsed.attributes)
      .groupBy((attribute) => attribute.trait_type)
      .mapValues((attributes) => attributes[0])
      .value(),
    skinImage: parsed.skinImage,
  };

  return tokenDetails;
}

export interface TokenDetails {
  readonly name: string;
  readonly description: string;
  readonly image: string;
  readonly attributes: {
    [trait_type: string]: {
      readonly trait_type: string;
      readonly value: string;
      readonly display_type: string;
    };
  };
  readonly skinImage: string;
}
