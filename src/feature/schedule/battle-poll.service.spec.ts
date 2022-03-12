import {
  ApmService,
  LimiterService,
  WorkerService,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import 'jest-extended';
import { ApiService, TransactionDto } from '../../shared/api';
import { BattleRepository } from '../../shared/db/battle/battle.repository';
import { MapperService } from '../../shared/game';
import { BattlePollService, DEFAULT_START_BLOCK } from './battle-poll.service';

describe('BattleScheduleService', () => {
  let service: BattlePollService;
  let splinterLandsApiService: ApiService;
  let battleRepository: BattleRepository;
  let moduleRef: TestingModule;
  let TRANSACTIONS_251: TransactionDto[];
  let TRANSACTIONS_1000: TransactionDto[];

  beforeEach(async () => {
    TRANSACTIONS_251 = JSON.parse(
      (
        await fs.promises.readFile(
          'reference/fixtures/transactions-251.fixture.json',
        )
      ).toString(),
    );
    TRANSACTIONS_1000 = JSON.parse(
      (
        await fs.promises.readFile(
          'reference/fixtures/transactions-1000.fixture.json',
        )
      ).toString(),
    );

    moduleRef = await Test.createTestingModule({
      providers: [BattlePollService],
    })
      .useMocker((token) => {
        if (token === ApiService) {
          return {};
        }
        if (token === ApmService) {
          return {};
        }
        if (token === LimiterService) {
          return {
            createMutex: jest.fn().mockReturnValue(undefined),
          };
        }
        if (token === BattleRepository) {
          return {
            findLatestByBlockNumber: jest.fn().mockReturnValue(undefined),
            save: jest.fn().mockReturnValue(Promise.resolve()),
          };
        }
        if (token === WorkerService) {
          return {};
        }
      })
      .compile();

    service = moduleRef.get<BattlePollService>(BattlePollService);
    splinterLandsApiService = moduleRef.get(ApiService);
    battleRepository = moduleRef.get(BattleRepository);
  });

  describe('fetchBattles', () => {
    it('saves one page of fetched values', async () => {
      const splinterLandsApiService = moduleRef.get(ApiService);
      const battleRepository = moduleRef.get(BattleRepository);

      splinterLandsApiService.fetchBattleTransactions = jest
        .fn()
        .mockReturnValue(TRANSACTIONS_251);

      await service.fetchBattles(1000);

      expect(battleRepository.save).toHaveBeenCalledTimes(1);

      expect(battleRepository.save).toHaveBeenCalledWith(expect.toBeArray());
    });

    it('saves nothing when api response is empty', async () => {
      splinterLandsApiService.fetchBattleTransactions = jest
        .fn()
        .mockReturnValue([]);

      await service.fetchBattles(1000);

      expect(battleRepository.save).toHaveBeenCalledTimes(0);
    });

    it('saves two pages of data', async () => {
      splinterLandsApiService.fetchBattleTransactions = jest
        .fn()
        .mockReturnValueOnce(TRANSACTIONS_1000)
        .mockReturnValueOnce(TRANSACTIONS_251);

      await service.fetchBattles(1000);

      expect(battleRepository.save).toHaveBeenCalledTimes(2);

      expect(battleRepository.save).toHaveBeenNthCalledWith(
        1,
        expect.toBeArray(),
      );

      expect(battleRepository.save).toHaveBeenNthCalledWith(
        2,
        expect.toBeArray(),
      );

      expect(
        splinterLandsApiService.fetchBattleTransactions,
      ).toHaveBeenCalledTimes(2);

      expect(
        splinterLandsApiService.fetchBattleTransactions,
      ).toHaveBeenNthCalledWith(1, DEFAULT_START_BLOCK, 1000);

      expect(
        splinterLandsApiService.fetchBattleTransactions,
      ).toHaveBeenNthCalledWith(2, 61572255, 1000);
    });

    it('fetches from the last saved block number on start', async () => {
      splinterLandsApiService.fetchBattleTransactions = jest
        .fn()
        .mockReturnValue([]);

      battleRepository.findLatestByBlockNumber = jest.fn().mockReturnValue({
        blockNumber: 1234,
      });

      await service.fetchBattles(1000);

      expect(
        splinterLandsApiService.fetchBattleTransactions,
      ).toHaveBeenCalledTimes(1);

      expect(
        splinterLandsApiService.fetchBattleTransactions,
      ).toHaveBeenCalledWith(1234, 1000);
    });
  });

  describe('mapBattles', () => {
    it('maps all indexes correctly', () => {
      const battles = MapperService.mapBattles(
        TRANSACTIONS_1000 as TransactionDto[],
      );

      expect(battles).toBeTruthy();
      expect(battles.length).toEqual(268);

      for (const battle of battles) {
        expect(battle).toBeTruthy();
        expect(battle.id).toBeString();
        expect(battle.blockNumber).toBeNumber();
        expect(battle.blockNumber).toBeGreaterThan(0);
        expect(battle.timestamp).toBeNumber();
        expect(battle.timestamp).toBeGreaterThan(1577829600); // 1 Jan 2020
        expect(battle.timestamp).toBeLessThan(2208981600); // 1 Jan 2040
        expect(battle.raw).toBeTruthy();
      }
    });

    it('maps raw data correctly', () => {
      const battles = MapperService.mapBattles(
        TRANSACTIONS_251 as TransactionDto[],
      );

      expect(battles).toBeTruthy();
      expect(battles.length).toEqual(43);

      for (const battle of battles) {
        expect(battle).toBeTruthy();
        expect(battle.raw).toBeTruthy();
        expect(battle.raw.id).toBeString();
        expect(battle.raw.players).toBeArray();
        expect(battle.raw.players.length).toEqual(2);
        for (const player of battle.raw.players) {
          expect(player.team).toBeTruthy();
          expect(player.name).toBeString();
          expect(player.team.monsters).toBeArray();
          for (const monster of player.team.monsters) {
            expect(monster).toBeString();
            expect(monster.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });
});
