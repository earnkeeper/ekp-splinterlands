import {
  ApmService,
  logger,
  SCHEDULER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Process, Processor } from '@nestjs/bull';
import _ from 'lodash';
import moment from 'moment';
import { PREMIUM_DAYS_TO_KEEP } from '../../../util';
import {
  Battle,
  BattleRepository,
  CardStats,
  CardStatsRepository,
} from '../../db';
import { Card, CardService, SettingsMapper } from '../../game';
import { BattleMapper } from '../../game/mappers/battle.mapper';
import { GROUP_CARDS } from '../constants';

@Processor(SCHEDULER_QUEUE)
export class CardProcessor {
  constructor(
    private apmService: ApmService,
    private battleRepository: BattleRepository,
    private cardStatsRepository: CardStatsRepository,
    private cardService: CardService,
  ) {}

  @Process(GROUP_CARDS)
  async groupCards() {
    try {
      const battlePageSize = 10000;

      const cardStatsRecords = await this.cardStatsRepository.findAll();

      const now = moment();

      // Remove stale statistics
      for (const cardStatsRecord of cardStatsRecords) {
        _.remove(
          cardStatsRecord.dailyBattleStats,
          (it) => now.diff(moment(it.day), 'days') > PREMIUM_DAYS_TO_KEEP,
        );
      }

      let latestBlock = _.chain(cardStatsRecords)
        .maxBy('blockNumber')
        .get('blockNumber', 0)
        .value();

      const cardStatsRecordMap = _.chain(cardStatsRecords)
        .keyBy((it) => it.id)
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

        await this.getCardsFromBattles(cardStatsRecordMap, battles);

        const updatedCards = _.values(cardStatsRecordMap);

        await this.cardStatsRepository.save(updatedCards);

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

  private async getCardsFromBattles(
    cardStatsRecordMap: Record<string, CardStats>,
    battles: Battle[],
  ) {
    const sortedBattles = _.chain(battles).sortBy('blockNumber').value();

    const cardTemplatesMap = await this.cardService.getAllCardTemplatesMap();

    for (const battle of sortedBattles) {
      const { winner, loser } = BattleMapper.mapToWinnerAndLoser(
        battle,
        cardTemplatesMap,
      );

      const battleDate = moment.unix(battle.timestamp).format('YYYY-MM-DD');

      const winnerCards: Card[] = [winner.summoner, ...winner.monsters];

      const loserCards: Card[] = [loser.summoner, ...loser.monsters];

      const allBattleCards = _.chain(winnerCards)
        .unionWith(loserCards, (a, b) => a.hash === b.hash)
        .value();

      const battleLeagueName: string = this.getLeagueName(
        battle,
        winnerCards,
        loserCards,
      );

      for (const card of allBattleCards) {
        let cardStatsRecord = cardStatsRecordMap[card.hash];

        if (!cardStatsRecord) {
          cardStatsRecord = this.createCardStatsRecord(card);
          cardStatsRecordMap[cardStatsRecord.id] = cardStatsRecord;
        }

        cardStatsRecord.blockNumber = battle.blockNumber;

        let dailyStatsRecord = cardStatsRecord.dailyBattleStats.find(
          (it) => it.day === battleDate && it.leagueName === battleLeagueName,
        );

        if (!dailyStatsRecord) {
          dailyStatsRecord = {
            day: battleDate,
            leagueName: battleLeagueName,
            wins: 0,
            battles: 0,
          };
          cardStatsRecord.dailyBattleStats.push(dailyStatsRecord);
        }

        dailyStatsRecord.battles++;

        const winnerHasCard = _.some(
          winnerCards,
          (it) => it.hash === card.hash,
        );

        if (winnerHasCard) {
          dailyStatsRecord.wins++;
        }
      }
    }

    return _.values(cardStatsRecordMap);
  }

  private getLeagueName(
    battle: Battle,
    winnerCards: Card[],
    loserCards: Card[],
  ): string {
    const minRating = _.min(battle.players.map((it) => it.initial_rating));

    const minPower = _.min(
      [winnerCards, loserCards].map((cards) =>
        _.sum(cards.map((card) => card.power)),
      ),
    );

    return SettingsMapper.mapToLeagueName(minRating, minPower);
  }

  private createCardStatsRecord(card: Card): CardStats {
    const cardStatsRecord: CardStats = {
      id: card.hash,
      blockNumber: 0,
      dailyBattleStats: [],
      editionNumber: card.editionNumber,
      gold: card.gold,
      hash: card.hash,
      level: card.level,
      templateId: card.templateId,
    };
    return cardStatsRecord;
  }
}
