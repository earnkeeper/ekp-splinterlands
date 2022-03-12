import { ClientService } from '@earnkeeper/ekp-sdk-nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import 'jest-extended';
import _ from 'lodash';
import { PlayerCollectionDto } from 'src/shared/api/dto/player-collection.dto';
import { CardDetailDto } from '../../shared/api/dto';
import { SplinterlandsApiService } from '../../shared/api/api.service';
import { BattleRepository } from '../../shared/db/battle/battle.repository';
import { Battle } from '../../battle/repository/battle.schema';
import { SPLINTERS } from '../../util';
import { TeamGuideHandler, ViableTeam } from '../../feature/team-guide/team-guide.controller';

describe('TeamGuideHandler', () => {
  let service: TeamGuideHandler;
  let splinterLandsApiService: SplinterlandsApiService;
  let moduleRef: TestingModule;
  let MY_COLLECTION: PlayerCollectionDto;
  let ALL_CARDS: CardDetailDto[];
  let BATTLES: Battle[];
  let VIABLE_TEAMS: ViableTeam[];

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
    VIABLE_TEAMS = JSON.parse(
      (
        await fs.promises.readFile(
          'reference/fixtures/viableTeams.fixture.json',
        )
      ).toString(),
    );

    moduleRef = await Test.createTestingModule({
      providers: [TeamGuideHandler],
    })
      .useMocker((token) => {
        if (token === SplinterlandsApiService) {
          return {
            fetchPlayerCollection: jest.fn().mockReturnValue(MY_COLLECTION),
            fetchCardDetails: jest.fn().mockReturnValue(ALL_CARDS),
          };
        }
        if (token === ClientService) {
          return {};
        }
        if (token === BattleRepository) {
          return {};
        }
      })
      .compile();

    service = moduleRef.get<TeamGuideHandler>(TeamGuideHandler);
    splinterLandsApiService = moduleRef.get(SplinterlandsApiService);
  });

  describe('getMyCardDetailIds', () => {
    it('includes base card ids', async () => {
      splinterLandsApiService.fetchPlayerCollection = jest
        .fn()
        .mockReturnValue(MY_COLLECTION);

      const myCardDetailIds = await service.getMyCardDetailIds('earnkeeper');

      expect(myCardDetailIds).toHaveLength(106);
    });
  });

  describe('getViableTeams', () => {
    it('creates teams when I have matching cards', async () => {
      const battles = _.chain(BATTLES as Battle[])
        .map((it) => it.raw)
        .value();

      expect(battles.length).toBeGreaterThan(0);

      const myCardDetailIds = await service.getMyCardDetailIds('earnkeeper');

      const viableTeams = service.getViableTeams(battles, myCardDetailIds);

      expect(viableTeams.length).toBeGreaterThan(0);

      expect(viableTeams.length).toBeGreaterThan(30);

      for (const viableTeam of viableTeams) {
        expect(viableTeam.id).toInclude('|');
        expect(viableTeam.summoner).toBeTruthy();
        expect(viableTeam.summoner.cardDetailId).toBeGreaterThan(0);
        expect(viableTeam.summoner.level).toBeGreaterThan(0);
        expect(viableTeam.monsters).toBeArray();
        for (const monster of viableTeam.monsters) {
          expect(monster.cardDetailId).toBeGreaterThan(0);
          expect(monster.level).toBeGreaterThan(0);
        }
      }

      await fs.promises.writeFile(
        'reference/fixtures/viableTeams.fixture.json',
        JSON.stringify(viableTeams, undefined, '  '),
      );
    });
  });

  describe('getDetailedTeams', () => {
    it('adds extra information to viable teams', async () => {
      const viableTeams = VIABLE_TEAMS;

      const detailedTeams = await service.getDetailedTeams(viableTeams);

      expect(detailedTeams.length).toBeGreaterThan(0);

      for (const detailedTeam of detailedTeams) {
        expect(detailedTeam.id).toInclude('|');
        expect(detailedTeam.battles).toBeGreaterThan(0);
        expect(detailedTeam.wins).toBeGreaterThanOrEqual(0);
        expect(detailedTeam.winPc).toBeGreaterThanOrEqual(0);
        expect(detailedTeam.winPc).toBeLessThanOrEqual(1);
        expect(detailedTeam.manaCost).toBeGreaterThan(0);

        expect(detailedTeam.summoner).toBeTruthy();
        expect(detailedTeam.summoner.cardDetailId).toBeGreaterThanOrEqual(0);
        expect(detailedTeam.summoner.manaCost).toBeGreaterThanOrEqual(0);
        expect(detailedTeam.summoner.name).toBeString();
        expect(detailedTeam.summoner.splinter).toBeOneOf(SPLINTERS);

        expect(detailedTeam.monsters).toBeTruthy();
        for (const monster of detailedTeam.monsters) {
          expect(monster.cardDetailId).toBeGreaterThan(0);
          expect(monster.manaCost).toBeGreaterThan(0);
          expect(monster.name).toBeString();
          expect(monster.splinter).toBeOneOf(SPLINTERS);
        }
      }
    });
  });
});
