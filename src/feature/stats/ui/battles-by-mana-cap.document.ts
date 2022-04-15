import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class BattlesByManaCapDocument extends DocumentDto {
  constructor(properties: BattlesByManaCapDocument) {
    super(properties);
  }

  readonly manaCap: number;
  readonly fromTransactions: number;
  readonly fromPlayerHistory: number;
}
