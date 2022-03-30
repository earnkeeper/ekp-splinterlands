import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { GameModule } from '../../shared/game';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';

@Module({
  imports: [ApiModule, DbModule, GameModule],

  providers: [DecksController, DecksService],
})
export class DecksModule {}
