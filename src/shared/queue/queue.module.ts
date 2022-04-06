import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { DbModule } from '../db';
import { BattleProcessor } from './processors';
import { CardPollProcessor } from './processors/card.processor';
import { MigrateProcessor } from './processors/migrate.processor';
import { QueueEventsService } from './queue-events.service';
@Module({
  imports: [ApiModule, DbModule],
  providers: [
    BattleProcessor,
    CardPollProcessor,
    MigrateProcessor,
    QueueEventsService,
  ],
})
export class QueueModule {}
