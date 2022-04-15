import {
  ApmService,
  logger,
  SCHEDULER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { validate } from 'bycontract';
import _ from 'lodash';
import moment from 'moment';
import { ApiService } from '../../api';
import { BattleRepository, BATTLE_VERSION } from '../../db';
import { IgnRepository } from '../../db/ign/ign.repository';
import { BattleMapper, CardService } from '../../game';
import {
  FETCH_BATTLE_TRANSACTIONS,
  FETCH_IGN_BATTLES,
  FETCH_LEADER_BATTLES,
} from '../constants';

export const DEFAULT_START_BLOCK = 62695197; // 2022-03-17T07:29:00

@Processor(SCHEDULER_QUEUE)
export class BattleProcessor {
  constructor(
    private apiService: ApiService,
    private apmService: ApmService,
    private battleRepository: BattleRepository,
    private cardService: CardService,
    private ignRepository: IgnRepository,
  ) {}

  @Process(FETCH_IGN_BATTLES)
  async fetchIgnBattles() {
    const igns = await this.ignRepository.findAll();

    const cardTemplatesMap = await this.cardService.getAllCardTemplatesMap();

    await Promise.all(
      igns.map(async (ign) => {
        const playerBattles = await this.apiService.fetchPlayerBattles(ign.id);

        if (
          !Array.isArray(playerBattles?.battles) ||
          playerBattles.battles.length === 0
        ) {
          await this.ignRepository.delete(ign.id);
          return;
        }

        const battles = BattleMapper.mapBattlesFromPlayer(
          playerBattles.battles,
          cardTemplatesMap,
          BATTLE_VERSION,
          moment(),
        );

        await this.battleRepository.save(battles);

        logger.log(
          `Saved ${battles?.length} battles from player ${ign.id} to the db.`,
        );
      }),
    );
  }
  catch(error) {
    this.apmService.captureError(error);
    logger.error(error);
  }

  @Process(FETCH_LEADER_BATTLES)
  async fetchLeaderBattles(job: Job<{ leagueNumber: number }>) {
    try {
      const leagueNumber = job.data.leagueNumber;

      validate(leagueNumber, 'number');

      const settings = await this.apiService.fetchSettings();

      validate(settings?.season?.id, 'number');

      const currentSeason = settings.season.id;

      const leagueLeaderboard = await this.apiService.fetchLeaderboard(
        currentSeason,
        leagueNumber,
      );

      const cardTemplatesMap = await this.cardService.getAllCardTemplatesMap();

      const leaders = leagueLeaderboard.leaderboard.map((it) => it.player);

      await Promise.all(
        leaders.map(async (playerName) => {
          const playerBattles = await this.apiService.fetchPlayerBattles(
            playerName,
          );

          if (
            !Array.isArray(playerBattles?.battles) ||
            playerBattles.battles.length === 0
          ) {
            return;
          }

          const battles = BattleMapper.mapBattlesFromPlayer(
            playerBattles.battles,
            cardTemplatesMap,
            BATTLE_VERSION,
            moment(),
          );

          await this.battleRepository.save(battles);

          logger.log(
            `Saved ${battles?.length} battles from player ${playerName} in league ${leagueNumber} to the db.`,
          );
        }),
      );
    } catch (error) {
      this.apmService.captureError(error);
      logger.error(error);
    }
  }

  @Process(FETCH_BATTLE_TRANSACTIONS)
  async fetchBattleTransactions() {
    try {
      const transactions = await this.apiService.fetchBattleTransactions();

      if (!transactions?.length) {
        return;
      }

      const igns = _.chain(transactions)
        .flatMap((transaction) => [
          transaction.affected_player,
          transaction.player,
        ])
        .uniq()
        .map((name) => ({ id: name }))
        .value();

      await this.ignRepository.save(igns);
    } catch (error) {
      this.apmService.captureError(error);
      logger.error(error);
    }
  }
}
