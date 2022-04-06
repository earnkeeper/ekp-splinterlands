import {
  ApmService,
  logger,
  SCHEDULER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Process, Processor } from '@nestjs/bull';
import _ from 'lodash';
import moment from 'moment';
import { MapperService } from '../../../shared/game';
import { PREMIUM_DAYS_TO_KEEP } from '../../../util';
import { BattleRepository, BATTLE_VERSION } from '../../db';
import { MIGRATE_BATTLES } from '../constants';

@Processor(SCHEDULER_QUEUE)
export class MigrateProcessor {
  constructor(
    private apmService: ApmService,
    private battleRepository: BattleRepository,
  ) {}

  @Process(MIGRATE_BATTLES)
  async migrateBattles() {
    try {
      const pageSize = 5000;

      const oldestAllowed = moment().subtract(PREMIUM_DAYS_TO_KEEP, 'days');

      while (true) {
        const battles = await this.battleRepository.findWithVersionLessThan(
          BATTLE_VERSION,
          oldestAllowed.unix(),
          pageSize,
        );

        if (battles.length === 0) {
          return;
        }

        for (const battle of battles) {
          if (!battle.rulesets || battle.rulesets.length === 0) {
            battle.rulesets = battle.ruleset.split('|');
          }

          if (!battle.leagueGroup) {
            battle.leagueGroup = MapperService.mapLeagueGroup(
              battle.leagueName,
            );
          }

          battle.version = BATTLE_VERSION;
        }

        const latest = _.maxBy(battles, 'timestamp');

        await this.battleRepository.save(battles);

        logger.debug(
          `Upgraded ${battles.length} battles, up to ${moment.unix(
            latest.timestamp,
          )}`,
        );

        if (battles.length < pageSize) {
          return;
        }
      }
    } catch (error) {
      this.apmService.captureError(error);
      logger.error(error);
    }
  }
}
