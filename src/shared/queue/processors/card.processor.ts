import { ApmService, logger } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { PREMIUM_DAYS_TO_KEEP } from '../../../util';
import {
  Battle,
  BattleRepository,
  CardStats,
  CardStatsRepository,
} from '../../db';
import { Card, CardService } from '../../game';
import { BattleMapper } from '../../game/mappers/battle.mapper';

@Injectable()
export class CardProcessor {
  constructor(
    private apmService: ApmService,
    private battleRepository: BattleRepository,
    private cardStatsRepository: CardStatsRepository,
    private cardService: CardService,
  ) {}

  async groupCards() {
    try {
      const battlePageSize = 10000;

      // Get all existing card statistics from the database
      // These were generated previously, if this is the first run, this will be empty
      const cardStatsRecords = await this.cardStatsRepository.findAll();

      const now = moment();

      // For each card, remove any battles that are older than our maximum days to keep
      // This is to improve database performance and space requirements
      for (const cardStatsRecord of cardStatsRecords) {
        _.remove(
          cardStatsRecord.dailyBattleStats,
          (it) => now.diff(moment(it.day), 'days') > PREMIUM_DAYS_TO_KEEP,
        );
      }

      // Last time we calculated card statistics, which block number did we get up to?
      let latestBlock = _.chain(cardStatsRecords)
        .maxBy('blockNumber')
        .get('blockNumber', 0)
        .value();

      // Create a map out of our list of card records, maps are easier on the CPU than lists when accessing them many times
      const cardStatsRecordMap = _.chain(cardStatsRecords)
        .keyBy((it) => it.id)
        .value();

      // Keep looping
      while (true) {
        // Get all battles from the database after the last block we retrieved
        // Up to a maximum of `battlePageSize` at a time
        // We can't get ALL battles as we will stress our memory limits
        // So we get them in pages
        const battles: Battle[] =
          await this.battleRepository.findAllAfterBlockNumber(
            latestBlock,
            battlePageSize,
          );

        // If there are no battles found, we are done for this cycle
        if (battles.length === 0) {
          break;
        }

        // Find the newest battle in the battles we just retrieved
        const latestBattle = _.chain(battles).maxBy('timestamp').value();

        logger.debug(
          `Read ${battles?.length} battles up to ${moment.unix(
            latestBattle.timestamp,
          )}, updating cards`,
        );

        // Use this method to update our list of cards based on the battles we just retrieved
        // This will add to each cards `dailyStats` list, which represents the number of battles and win rate per day for each card
        await this.getCardsFromBattles(cardStatsRecordMap, battles);
        const updatedCards = _.values(cardStatsRecordMap);

        // Save the updated cards to the database
        await this.cardStatsRepository.save(updatedCards);

        logger.debug(`Saved ${updatedCards?.length} cards to the database`);

        // If the number of battles we retrieved is less than our page size, we are done
        // There will not be more battles to retrieve until next cycle
        if (battles.length < battlePageSize) {
          break;
        }

        // If we reach here, there are more battles to retrieve, update our block number to the latest from this fetch
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

      for (const card of allBattleCards) {
        let cardStatsRecord = cardStatsRecordMap[card.hash];

        if (!cardStatsRecord) {
          cardStatsRecord = this.createCardStatsRecord(card);
          cardStatsRecordMap[cardStatsRecord.id] = cardStatsRecord;
        }

        cardStatsRecord.blockNumber = battle.blockNumber;

        let dailyStatsRecord = cardStatsRecord.dailyBattleStats.find(
          (it) =>
            it.day === battleDate && it.leagueGroup === battle.leagueGroup,
        );

        if (!dailyStatsRecord) {
          dailyStatsRecord = {
            day: battleDate,
            leagueGroup: battle.leagueGroup,
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
