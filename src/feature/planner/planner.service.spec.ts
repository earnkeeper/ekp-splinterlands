import { ApmService, ClientService } from '@earnkeeper/ekp-sdk-nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import 'jest-extended';
import {
  ApiService,
  CardDetailDto,
  PlayerCollectionDto,
} from '../../shared/api';
import { Battle, BattleRepository } from '../../shared/db';
import { GameService } from '../../shared/game/game.service';
import { PlannerService } from './planner.service';

async function readFixture<T>(name: string): Promise<T> {
  const buffer = await fs.promises.readFile(`reference/fixtures/${name}`);

  return JSON.parse(buffer.toString());
}

describe('PlannerService', () => {
  let service: PlannerService;
  let moduleRef: TestingModule;
  let MY_COLLECTION: PlayerCollectionDto;
  let ALL_CARDS: CardDetailDto[];
  let BATTLES: Battle[];
  let PLAYER_CARDS: CardDetailDto[];

  beforeAll(async () => {
    MY_COLLECTION = await readFixture('my-collection.fixture.json');
    ALL_CARDS = await readFixture('card-details.fixture.json');
    BATTLES = await readFixture('battles-13-standard.fixture.json');
    PLAYER_CARDS = await readFixture('player-cards.fixture.json');
  });

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [PlannerService],
    })
      .useMocker((token) => {
        if (token === ApiService) {
          return {
            fetchPlayerCollection: jest.fn().mockReturnValue(MY_COLLECTION),
            fetchCardDetails: jest.fn().mockReturnValue(ALL_CARDS),
          };
        }
        if (token === ClientService) {
          return {};
        }
        if (token === BattleRepository) {
          return {
            findBattleByManaCap: jest.fn().mockReturnValue(BATTLES),
          };
        }
        if (token === GameService) {
          return {
            getPlayerCards: jest.fn().mockReturnValue(PLAYER_CARDS),
          };
        }
        if (token === ApmService) {
          return {
            startTransaction: jest.fn().mockReturnValue(undefined),
          };
        }
      })
      .compile();

    service = moduleRef.get(PlannerService);
  });

  // TODO: reenable this when we have updated data
  describe.skip('getViableTeams', () => {
    it('creates teams when I have matching cards', async () => {
      const { teams } = await service.getViableTeams(
        'earnkeeper',
        13,
        'Standard',
        'All',
        true,
      );

      expect(teams.length).toBeGreaterThan(30);

      for (const viableTeam of teams) {
        expect(viableTeam.id).toInclude('|');
        expect(viableTeam.battles).toBeGreaterThan(0);
        expect(viableTeam.wins).toBeGreaterThanOrEqual(0);
        expect(viableTeam.wins).toBeLessThanOrEqual(viableTeam.battles);
        expect(viableTeam.summoner).toBeTruthy();
        expect(viableTeam.summoner.cardDetailId).toBeGreaterThan(0);
        expect(viableTeam.summoner.mana).toBeGreaterThanOrEqual(0);
        expect(viableTeam.summoner.level).toBeGreaterThan(0);
        expect(viableTeam.summoner.name).toBeString();
        expect(viableTeam.summoner.splinter).toBeOneOf(GameService.SPLINTERS);
        expect(viableTeam.monsters).toBeArray();
        for (const monster of viableTeam.monsters) {
          expect(monster.cardDetailId).toBeGreaterThan(0);
          expect(monster.mana).toBeGreaterThan(0);
          expect(monster.level).toBeGreaterThan(0);
          expect(monster.name).toBeString();
          expect(monster.splinter).toBeOneOf(GameService.SPLINTERS);
        }
      }
      await fs.promises.writeFile(
        'reference/fixtures/viable-teams.fixture.json',
        JSON.stringify(teams, undefined, '  '),
      );
    });
  });
});
