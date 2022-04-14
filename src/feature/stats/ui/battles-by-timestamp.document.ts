import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class BattlesByTimestampDocument extends DocumentDto {
  constructor(properties: BattlesByTimestampDocument) {
    super(properties);
  }

  readonly timestamp: number;
  readonly fromTransactions: number;
  readonly fromPlayerHistory: number;
}
