import {
  ApmService,
  logger,
  SCHEDULER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Process, Processor } from '@nestjs/bull';
import _ from 'lodash';
import moment from 'moment';
import { Battle, BattleRepository, BATTLE_VERSION } from '../../db';
import { MIGRATE_BATTLES } from '../constants';

@Processor(SCHEDULER_QUEUE)
export class MigrateProcessor {
  constructor(
    private apmService: ApmService,
    private battleRepository: BattleRepository,
  ) {}

  @Process(MIGRATE_BATTLES)
  async migrateBattles() {
    // Nothing to migrate at the moment
    await this.migrateWith([], BATTLE_VERSION);
  }

  private async migrateWith(
    methods: ((battle: Battle) => Battle)[],
    version: number,
  ) {
    if (methods.length === 0) {
      return;
    }

    try {
      const pageSize = 5000;

      while (true) {
        const battles = await this.battleRepository.findWithVersionLessThan(
          version,
          0,
          pageSize,
        );

        const updatedBattles = [];

        if (battles.length === 0) {
          return;
        }

        for (const battle of battles) {
          const results = [];

          for (const method of methods) {
            const result = method(battle);
            if (!!result) {
              results.push(result);
            }
          }

          results.push({ ...battle, version });

          const updatedBattle = _.clone(battle);

          for (const result of results) {
            _.assign(updatedBattle, result);
          }

          updatedBattles.push(updatedBattle);
        }

        const latest = _.maxBy(battles, 'timestamp');

        await this.battleRepository.save(updatedBattles);

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
