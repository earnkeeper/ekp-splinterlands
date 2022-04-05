import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import { MODULE_DEF } from '../../../src/worker.module';
import { BattleRepository } from '../../../src/shared/db/battle/battle.repository';

describe('BattleRepository (e2e)', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule(MODULE_DEF).compile();

    const app = moduleRef.createNestApplication();

    await app.init();
  });

  describe('findByManaCapRulesetAndTimestampGreaterThan', () => {
    it('returns valid battles', async () => {
      const battleRepository = moduleRef.get(BattleRepository);
      const battles = await battleRepository.findBattleByManaCap(
        13,
        'Standard',
        'All',
        0,
      );

      expect(battles.length).toBeGreaterThan(0);

      await fs.promises.writeFile(
        'reference/fixtures/battles-13-standard.fixture.json',
        JSON.stringify(battles, undefined, '  '),
      );
    });
  });
});
