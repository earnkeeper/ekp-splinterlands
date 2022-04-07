import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { DbModule } from '../../shared/db';
import { GameModule } from '../../shared/game/game.module';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';

@Module({
  imports: [ApiModule, DbModule, GameModule],
  providers: [CollectionController, CollectionService],
})
export class CollectionModule {}
