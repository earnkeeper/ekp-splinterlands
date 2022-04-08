import { ApmService, SCHEDULER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import { Process, Processor } from '@nestjs/bull';
import { BattleRepository } from '../../db';
import { MIGRATE_BATTLES } from '../constants';

@Processor(SCHEDULER_QUEUE)
export class MigrateProcessor {
  constructor(
    private apmService: ApmService,
    private battleRepository: BattleRepository,
  ) {}

  @Process(MIGRATE_BATTLES)
  async migrateBattles() {
    // No migrate needed at the moment
  }
}
