import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import 'jest-extended';
import {
  ApiService,
  CardDetailDto,
  PlayerCollectionDto,
} from '../../shared/api';
import { GameService } from './game.service';

describe('TeamGuideHandler', () => {
  let service: GameService;
  let apiService: ApiService;
  let moduleRef: TestingModule;
  let MY_COLLECTION: PlayerCollectionDto;
  let ALL_CARDS: CardDetailDto[];

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

    moduleRef = await Test.createTestingModule({
      providers: [GameService],
    })
      .useMocker((token) => {
        if (token === ApiService) {
          return {
            fetchPlayerCollection: jest.fn().mockReturnValue(MY_COLLECTION),
            fetchCardDetails: jest.fn().mockReturnValue(ALL_CARDS),
          };
        }
      })
      .compile();

    service = moduleRef.get(GameService);
    apiService = moduleRef.get(ApiService);
  });

  describe('getPlayerCards', () => {
    it('includes base card ids', async () => {
      apiService.fetchPlayerCollection = jest
        .fn()
        .mockReturnValue(MY_COLLECTION);

      const playerCards = await service.getPlayerCards('earnkeeper');

      expect(playerCards).toHaveLength(106);

      await fs.promises.writeFile(
        'reference/fixtures/player-cards.fixture.json',
        JSON.stringify(playerCards, undefined, '  '),
      );
    });
  });
});
