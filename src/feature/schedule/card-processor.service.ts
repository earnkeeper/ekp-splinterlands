import { logger, WORKER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import { Processor } from '@nestjs/bull';
import _ from 'lodash';
import moment from 'moment';
import { ApiService, TeamDetailedDto } from '../../shared/api';
import { Battle, BattleRepository } from '../../shared/db';

const BATTLE_FETCH_LIMIT = 20000;

@Processor(WORKER_QUEUE)
export class BattlePollService {
  constructor(
    private battleRepository: BattleRepository,
    private splinterlandsApiService: ApiService,
  ) {}

  async processCards() {
    const cards = await this.cardRepository.findAll();

    const latestBlock = _.chain(cards)
      .maxBy('blockNumber')
      .get('blockNumber', 0)
      .value();

    while (true) {
      const battles: Battle[] =
        await this.battleRepository.findAllAfterBlockNumber(
          latestBlock,
          BATTLE_FETCH_LIMIT,
        );

      if (battles.length === 0) {
        break;
      }

      const latestTimestamp = _.chain(battles)
        .maxBy('timestamp')
        .get('timestamp')
        .value();

      logger.debug(
        `Read ${battles?.length} battles up to ${moment.unix(
          latestTimestamp,
        )}, updating cards`,
      );

      this.updateCardsWithBattles(cards, battles);

      await this.battleRepository.save(cards);

      logger.debug(`Saved ${cards?.length} cards to the database`);
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

  updateCardsWithBattles(cards: any, battles: Battle[]) {
    const cardsMap = _.chain(cards)
      .groupBy((card) => card.id.toString())
      .mapValues((cards) => cards[0])
      .value();

    for (const battle of battles) {
      const battleCards = [
        this.mapSummonerCard(battle.team1),
        ...this.mapMonsterCards(battle.team1),
        this.mapSummonerCard(battle.team2),
        ...this.mapMonsterCards(battle.team2),
      ];

      for (const battleCard of battleCards) {
        let card = cardsMap[battleCard.card_detail_id.toString()];
        if (!card) {
          card = this.createCard(battleCard);
        }
      }
    }
  }
}

type BattleCard = Readonly<{
  uid: string;
  gold: boolean;
  card_detail_id: number;
  edition: number;
}>;
