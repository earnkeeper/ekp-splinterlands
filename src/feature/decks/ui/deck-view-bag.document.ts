import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class DeckViewBag extends DocumentDto {
  constructor(properties: DeckViewBag) {
    super(properties);
  }

  readonly battleCount: number;
  readonly firstBattleTimestamp: number;
}
