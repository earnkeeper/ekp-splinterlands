import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';


@Module({
  imports: [ApiModule, DbModule],
  providers: [HistoryService , HistoryController],
})
export class HistoryModule {}
