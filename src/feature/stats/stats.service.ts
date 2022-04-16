import { CacheService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import {
  CACHE_STATS_BATTLES_BY_LEAGUE,
  CACHE_STATS_BATTLES_BY_MANA_CAP,
  CACHE_STATS_BATTLES_BY_TIMESTAMP,
  CACHE_STATS_VIEW_BAG,
} from '../../util';
import { BattlesByLeagueDocument } from './ui/battles-by-league.document';
import { BattlesByManaCapDocument } from './ui/battles-by-mana-cap.document';
import { BattlesByTimestampDocument } from './ui/battles-by-timestamp.document';
import { StatsViewBagDocument } from './ui/stats-view-bag.document';

@Injectable()
export class StatsService {
  constructor(private cacheService: CacheService) {}

  async getViewBag(): Promise<StatsViewBagDocument> {
    return this.cacheService.get(CACHE_STATS_VIEW_BAG);
  }

  async getBattlesByLeague(): Promise<BattlesByLeagueDocument[]> {
    return this.cacheService.get(CACHE_STATS_BATTLES_BY_LEAGUE) ?? [];
  }

  async getBattlesByTimestamp(): Promise<BattlesByTimestampDocument[]> {
    return this.cacheService.get(CACHE_STATS_BATTLES_BY_TIMESTAMP) ?? [];
  }

  async getBattlesByManaCap(): Promise<BattlesByManaCapDocument[]> {
    return this.cacheService.get(CACHE_STATS_BATTLES_BY_MANA_CAP) ?? [];
  }
}
