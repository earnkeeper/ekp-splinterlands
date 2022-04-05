import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { PlayerHistoryController } from './playerhistory.controller';
import { PlayerhistoryService } from './playerhistory.service';


@Module({
  imports: [ApiModule, DbModule],
  providers: [PlayerhistoryService , PlayerHistoryController],
})
export class PlayerHistoryModule {}
