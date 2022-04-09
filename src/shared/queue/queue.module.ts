import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { DbModule } from '../db';
import { GameModule } from '../game/game.module';
import { BattleProcessor } from './processors';
import { CardProcessor } from './processors/card.processor';
import { MigrateProcessor } from './processors/migrate.processor';
import { QueueEventsService } from './queue-events.service';
@Module({
  imports: [ApiModule, DbModule, GameModule],
  providers: [
    BattleProcessor,
    CardProcessor,
    MigrateProcessor,
    QueueEventsService,
  ],
})
export class QueueModule {}
