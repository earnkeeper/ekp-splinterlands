import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { GameService } from './game.service';

@Module({
  imports: [ApiModule],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
