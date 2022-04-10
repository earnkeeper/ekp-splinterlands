import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class BattleDocument extends DocumentDto {
  constructor(properties: BattleDocument) {
    super(properties);
  }

  readonly timestamp: number;
  readonly winnerName: string;
  readonly loserName: string;
}
