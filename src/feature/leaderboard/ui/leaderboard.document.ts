import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class LeaderboardDocument extends DocumentDto {
  constructor(properties: LeaderboardDocument) {
    super(properties);
  }

  readonly avatarImgUrl: string;
  readonly battles: number;
  readonly guildName: string;
  readonly fiatSymbol: string;
  readonly player: string;
  readonly rank: number;
  readonly rating: number;
  readonly reward: number;
  readonly rewardFiat: number;
  readonly wins: number;
}
