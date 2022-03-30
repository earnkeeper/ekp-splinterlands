import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class PlannerViewBag extends DocumentDto {
  constructor(properties: PlannerViewBag) {
    super(properties);
  }

  readonly battleCount: number;
  readonly firstBattleTimestamp: number;
}
