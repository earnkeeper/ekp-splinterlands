import { ClientService } from '@earnkeeper/ekp-sdk-nestjs';
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
import { TeamGuideService } from './team-guide.service';

describe('TeamGuideHandler', () => {
  let service: TeamGuideService;
  let moduleRef: TestingModule;
  let MY_COLLECTION: PlayerCollectionDto;
  let ALL_CARDS: CardDetailDto[];
  let BATTLES: Battle[];
  let PLAYER_CARDS: CardDetailDto[];

  beforeEach(async () => {
    MY_COLLECTION = JSON.parse(
      (
        await fs.promises.readFile(
          'reference/fixtures/my-collection.fixture.json',
        )
      ).toString(),
    );
    ALL_CARDS = JSON.parse(
      (
        await fs.promises.readFile(
          'reference/fixtures/card-details.fixture.json',
        )
      ).toString(),
    );
    BATTLES = JSON.parse(
      (
        await fs.promises.readFile(
          'reference/fixtures/battles-13-standard.fixture.json',
        )
      ).toString(),
    );
    PLAYER_CARDS = JSON.parse(
      (
        await fs.promises.readFile(
          'reference/fixtures/player-cards.fixture.json',
        )
      ).toString(),
    );

    moduleRef = await Test.createTestingModule({
      providers: [TeamGuideService],
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
            findByManaCapRulesetAndTimestampGreaterThan: jest
              .fn()
              .mockReturnValue(BATTLES),
          };
        }
        if (token === GameService) {
          return {
            getPlayerCards: jest.fn().mockReturnValue(PLAYER_CARDS),
          };
        }
      })
      .compile();

    service = moduleRef.get(TeamGuideService);
  });

  describe('getViableTeams', () => {
    it('creates teams when I have matching cards', async () => {
      const { teams } = await service.getViableTeams(
        'earnkeeper',
        13,
        'Standard',
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
