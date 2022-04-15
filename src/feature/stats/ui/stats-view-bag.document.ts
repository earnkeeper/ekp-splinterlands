import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class StatsViewBagDocument extends DocumentDto {
  constructor(properties: StatsViewBagDocument) {
    super(properties);
  }

  readonly totalBattles: number;
  readonly oldestBattle: number;
  readonly latestBattle: number;
}
