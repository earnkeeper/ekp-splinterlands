import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class TeamGuideViewBag extends DocumentDto {
  constructor(properties: TeamGuideViewBag) {
    super(properties);
  }

  readonly battleCount: number;
  readonly firstBattleTimestamp: number;
}
