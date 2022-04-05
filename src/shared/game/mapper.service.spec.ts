import fs from 'fs';
import 'jest-extended';
import { TransactionDto } from '../api';
import { Battle } from '../db';
import { MapperService } from './mapper.service';

async function readFixture<T>(name: string): Promise<T> {
  const buffer = await fs.promises.readFile(`reference/fixtures/${name}`);

  return JSON.parse(buffer.toString());
}

describe('MapperService', () => {
  let TRANSACTIONS_251: TransactionDto[];
  let TRANSACTIONS_1000: TransactionDto[];
  let BATTLES: Battle[];

  beforeAll(async () => {
    TRANSACTIONS_251 = await readFixture('transactions-251.fixture.json');
    TRANSACTIONS_1000 = await readFixture('transactions-1000.fixture.json');
    BATTLES = await readFixture('battles-13-standard.fixture.json');
  });

  describe('mapBattles', () => {
    it('maps array of battles', async () => {
      const battles = MapperService.mapBattlesFromTransactions(TRANSACTIONS_251);

      expect(battles).toBeTruthy();
      expect(battles.length).toEqual(43);
    });
  });

  describe('mapBattle', () => {
    it('maps required fields correctly', () => {
      const battles = MapperService.mapBattlesFromTransactions(TRANSACTIONS_1000);

      expect(battles.length).toBeGreaterThan(0);

      for (const battle of battles) {
        expect(battle).toBeTruthy();
        expect(battle.id).toBeString();
        expect(battle.blockNumber).toBeNumber();
        expect(battle.blockNumber).toBeGreaterThan(0);
        expect(battle.timestamp).toBeNumber();
        expect(battle.timestamp).toBeGreaterThan(1577829600); // 1 Jan 2020
        expect(battle.timestamp).toBeLessThan(2208981600); // 1 Jan 2040
        expect(battle.manaCap).toBeGreaterThan(0);
        expect(battle.ruleset).toBeString();
        expect(battle.ruleset.length).toBeGreaterThan(0);
        expect(battle.winner).toBeString();
        expect(battle.winner.length).toBeGreaterThan(0);
        expect(battle.loser).toBeString();
        expect(battle.loser.length).toBeGreaterThan(0);
        expect(battle.leagueName).toBeString();
        expect(battle.players.length).toBeGreaterThan(0);
        expect(battle.team1).toBeTruthy();
        expect(battle.team2).toBeTruthy();
      }
    });
  });

  describe('mapLeagueName', () => {
    it('maps sample leagues correctly for rating only', async () => {
      expect(MapperService.mapLeagueName(50)).toEqual('Novice');
      expect(MapperService.mapLeagueName(100)).toEqual('Bronze III');
      expect(MapperService.mapLeagueName(410)).toEqual('Bronze II');
      expect(MapperService.mapLeagueName(2900)).toEqual('Diamond III');
      expect(MapperService.mapLeagueName(4701)).toEqual('Champion I');
    });

    it('does not error on sample battle set', async () => {
      expect(BATTLES.length).toBeGreaterThan(0);

      for (const battle of BATTLES) {
        const player1LeagueName = MapperService.mapLeagueName(
          battle.players[0].initial_rating,
        );
        const player2LeagueName = MapperService.mapLeagueName(
          battle.players[1].initial_rating,
        );

        expect(player1LeagueName).toBeString();
        expect(player2LeagueName).toBeString();
      }
    });
  });
});
