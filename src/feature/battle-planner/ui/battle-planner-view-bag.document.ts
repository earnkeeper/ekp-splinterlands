import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class BattlePlannerViewBag extends DocumentDto {
  constructor(properties: BattlePlannerViewBag) {
    super(properties);
  }

  readonly battleCount: number;
  readonly firstBattleTimestamp: number;
}
