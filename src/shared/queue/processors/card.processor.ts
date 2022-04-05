import {
  ApmService,
  logger,
  SCHEDULER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Process, Processor } from '@nestjs/bull';
import _ from 'lodash';
import moment from 'moment';
import { PREMIUM_DAYS_TO_KEEP } from 'src/util';
import { TeamDetailedDto } from '../../api';
import { Battle, BattleRepository, Card, CardRepository } from '../../db';
import { MapperService } from '../../game';
import { GROUP_CARDS } from '../constants';

@Processor(SCHEDULER_QUEUE)
export class CardPollProcessor {
  constructor(
    private apmService: ApmService,
    private battleRepository: BattleRepository,
    private cardRepository: CardRepository,
  ) {}

  @Process(GROUP_CARDS)
  async groupCards() {
    try {
      const battlePageSize = 10000;

      const cards = await this.cardRepository.findAll();

      const cardsMap = _.chain(cards)
        .groupBy((card) => card.id.toString())
        .mapValues((cards) => cards[0])
        .value();

      const now = moment();

      // Remove stale statistics
      // TODO: this might be able to be improved performance wise
      for (const card of cards) {
        const keys = _.keys(card.dailyStats);

        for (const key of keys) {
          if (now.diff(moment(key), 'days') > PREMIUM_DAYS_TO_KEEP) {
            delete card.dailyStats[key];
          }
        }
      }

      let latestBlock = _.chain(cards)
        .maxBy('blockNumber')
        .get('blockNumber', 0)
        .value();

      while (true) {
        const battles: Battle[] =
          await this.battleRepository.findAllAfterBlockNumber(
            latestBlock,
            battlePageSize,
          );

        if (battles.length === 0) {
          break;
        }

        const latestBattle = _.chain(battles).maxBy('timestamp').value();

        logger.debug(
          `Read ${battles?.length} battles up to ${moment.unix(
            latestBattle.timestamp,
          )}, updating cards`,
        );

        this.mapCardsFromBattles(cardsMap, battles);

        const updatedCards = _.values(cardsMap);

        await this.cardRepository.save(updatedCards);

        logger.debug(`Saved ${updatedCards?.length} cards to the database`);

        if (battles.length < battlePageSize) {
          break;
        }

        latestBlock = latestBattle.blockNumber;
      }
    } catch (error) {
      this.apmService.captureError(error);
      logger.error(error);
    }
  }

  private mapSummonerCard(team: TeamDetailedDto): BattleCard {
    return _.pick(team.summoner, ['uid', 'gold', 'card_detail_id', 'edition']);
  }

  private mapMonsterCards(team: TeamDetailedDto): BattleCard[] {
    return team.monsters.map((monster) =>
      _.pick(monster, ['uid', 'gold', 'card_detail_id', 'edition']),
    );
  }

  private mapCardsFromBattles(
    cardsMap: Record<string, Card>,
    battles: Battle[],
  ) {
    const sortedBattles = _.chain(battles).sortBy('blockNumber').value();

    for (const battle of sortedBattles) {
      const { winner, loser } = MapperService.mapWinnerAndLoser(battle);

      const battleDate = moment.unix(battle.timestamp).format('YYYY-MM-DD');

      const winnerCards = [
        this.mapSummonerCard(winner),
        ...this.mapMonsterCards(winner),
      ];

      const loserCards = [
        this.mapSummonerCard(loser),
        ...this.mapMonsterCards(loser),
      ];

      const allCards = _.chain(winnerCards)
        .unionWith(loserCards, (a, b) => a.card_detail_id === b.card_detail_id)
        .value();

      for (const battleCard of allCards) {
        let card = cardsMap[battleCard.card_detail_id];

        if (!card) {
          card = this.createCard(battleCard);
          cardsMap[battleCard.card_detail_id] = card;
        }

        card.blockNumber = battle.blockNumber;

        if (!card.dailyStats[battleDate]) {
          card.dailyStats[battleDate] = {
            wins: 0,
            battles: 0,
          };
        }

        card.dailyStats[battleDate].battles++;

        const winnerHasCard = _.some(
          winnerCards,
          (it) => it.card_detail_id === battleCard.card_detail_id,
        );

        if (winnerHasCard) {
          card.dailyStats[battleDate].wins++;
        }
      }
    }

    return _.values(cardsMap);
  }

  private createCard(battleCard: BattleCard): Card {
    return {
      id: battleCard.card_detail_id,
      blockNumber: 0,
      dailyStats: {},
    };
  }
}

type BattleCard = Readonly<{
  uid: string;
  gold: boolean;
  card_detail_id: number;
  edition: number;
}>;
