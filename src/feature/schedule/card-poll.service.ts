import { logger, WORKER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import { Processor } from '@nestjs/bull';
import _ from 'lodash';
import moment from 'moment';
import { TeamDetailedDto } from '../../shared/api';
import { Battle, BattleRepository, Card } from '../../shared/db';
import { CardRepository } from '../../shared/db/card/card.repository';
import { MapperService } from '../../shared/game';

@Processor(WORKER_QUEUE)
export class CardPollService {
  constructor(
    private battleRepository: BattleRepository,
    private cardRepository: CardRepository,
  ) {}

  async processCards(maxDaysToKeep: number, pageSize: number) {
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
        if (now.diff(moment(key), 'days') > maxDaysToKeep) {
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
          pageSize,
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

      if (battles.length < pageSize) {
        break;
      }

      latestBlock = latestBattle.blockNumber;
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

  mapCardsFromBattles(cardsMap: Record<string, Card>, battles: Battle[]) {
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
