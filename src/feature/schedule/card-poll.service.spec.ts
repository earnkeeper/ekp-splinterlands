import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import 'jest-extended';
import { Battle, Card } from '../../shared/db';
import { BattleRepository } from '../../shared/db/battle/battle.repository';
import { CardRepository } from '../../shared/db/card/card.repository';
import { CardPollService } from './card-poll.service';

describe('BattleScheduleService', () => {
  let service: CardPollService;
  let moduleRef: TestingModule;
  let BATTLES: Battle[];
  let cardRepository: CardRepository;

  beforeEach(async () => {
    BATTLES = JSON.parse(
      (
        await fs.promises.readFile(
          'reference/fixtures/battles-13-standard.fixture.json',
        )
      ).toString(),
    );

    moduleRef = await Test.createTestingModule({
      providers: [CardPollService],
    })
      .useMocker((token) => {
        if (token === BattleRepository) {
          return {
            findAllAfterBlockNumber: jest.fn().mockReturnValue(BATTLES),
          };
        }
        if (token === CardRepository) {
          return {
            findAll: jest.fn().mockReturnValue([]),
            save: jest.fn().mockReturnValue(Promise.resolve()),
          };
        }
      })
      .compile();

    service = moduleRef.get(CardPollService);
    cardRepository = moduleRef.get(CardRepository);
  });

  describe('processCards', () => {
    it('maps battles into card models', async () => {
      await service.processCards(14, 20000);

      expect(cardRepository.save).toHaveBeenCalledWith(
        expect.toSatisfy((cards: Card[]) => cards.length > 0),
      );
    });
  });
});
