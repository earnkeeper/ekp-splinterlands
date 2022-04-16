import { CacheService, SCHEDULER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import { Process, Processor } from '@nestjs/bull';
import _ from 'lodash';
import moment from 'moment';
import { BattlesByLeagueDocument } from '../../../feature/stats/ui/battles-by-league.document';
import { BattlesByManaCapDocument } from '../../../feature/stats/ui/battles-by-mana-cap.document';
import { BattlesByTimestampDocument } from '../../../feature/stats/ui/battles-by-timestamp.document';
import { StatsViewBagDocument } from '../../../feature/stats/ui/stats-view-bag.document';
import {
  CACHE_STATS_BATTLES_BY_LEAGUE,
  CACHE_STATS_BATTLES_BY_MANA_CAP,
  CACHE_STATS_BATTLES_BY_TIMESTAMP,
  CACHE_STATS_VIEW_BAG,
} from '../../../util';
import { BattleRepository } from '../../db';
import { LEAGUES } from '../../game';
import { PROCESS_BATTLE_STATS } from '../constants';

@Processor(SCHEDULER_QUEUE)
export class StatsProcessor {
  constructor(
    private battleRepository: BattleRepository,
    private cacheService: CacheService,
  ) {}

  @Process(PROCESS_BATTLE_STATS)
  async processBattleStats() {
    const [viewBag, battlesByLeague, battlesByTimestamp, battlesByManaCap] =
      await Promise.all([
        this.getViewBag(),
        this.getBattlesByLeague(),
        this.getBattlesByTimestamp(),
        this.getBattlesByManaCap(),
      ]);

    await this.cacheService.set(CACHE_STATS_VIEW_BAG, viewBag);
    await this.cacheService.set(CACHE_STATS_BATTLES_BY_LEAGUE, battlesByLeague);
    await this.cacheService.set(
      CACHE_STATS_BATTLES_BY_TIMESTAMP,
      battlesByTimestamp,
    );
    await this.cacheService.set(
      CACHE_STATS_BATTLES_BY_MANA_CAP,
      battlesByManaCap,
    );
  }

  async getViewBag(): Promise<StatsViewBagDocument> {
    const [totalBattles, oldestBattle, latestBattle] = await Promise.all([
      this.battleRepository.count(),
      this.battleRepository.findOldest(),
      this.battleRepository.findLatest(),
    ]);

    return {
      id: '0',
      updated: moment().unix(),
      totalBattles,
      oldestBattle: oldestBattle?.timestamp,
      latestBattle: latestBattle?.timestamp,
    };
  }

  async getBattlesByLeague(): Promise<BattlesByLeagueDocument[]> {
    const fromTransactions = await this.battleRepository.groupByLeague(
      'transaction',
    );

    const fromPlayerHistory = await this.battleRepository.groupByLeague(
      'playerHistory',
    );

    const now = moment().unix();

    const documents: BattlesByLeagueDocument[] = _.chain(LEAGUES)
      .sortBy((league) => {
        return league.number;
      })
      .map((league) => league.group)
      .uniq()
      .map((leagueGroup) => {
        const resultFromTransactions = fromTransactions.find(
          (it) => it._id === leagueGroup,
        );
        const resultFromPlayerHistory = fromPlayerHistory.find(
          (it) => it._id === leagueGroup,
        );

        const document: BattlesByLeagueDocument = {
          id: leagueGroup,
          updated: now,
          leagueGroup,
          fromTransactions: resultFromTransactions?.count ?? 0,
          fromPlayerHistory: resultFromPlayerHistory?.count ?? 0,
        };

        return document;
      })
      .value();

    return documents;
  }

  async getBattlesByTimestamp(): Promise<BattlesByTimestampDocument[]> {
    const fromTransactions = await this.battleRepository.groupByTimestamp(
      'transaction',
    );
    const fromPlayerHistory = await this.battleRepository.groupByTimestamp(
      'playerHistory',
    );

    const days = _.chain([...fromTransactions, ...fromPlayerHistory])
      .map((it) => it._id)
      .uniq()
      .value();

    const now = moment().unix();

    const documents: BattlesByTimestampDocument[] = _.chain(days)
      .sort()
      .map((dayOfYear) => {
        const resultFromTransactions = fromTransactions.find(
          (it) => it._id === dayOfYear,
        );
        const resultFromPlayerHistory = fromPlayerHistory.find(
          (it) => it._id === dayOfYear,
        );

        const document: BattlesByTimestampDocument = {
          id: dayOfYear.toString(),
          updated: now,
          timestamp: moment().dayOfYear(dayOfYear).unix(),
          fromTransactions: resultFromTransactions?.count ?? 0,
          fromPlayerHistory: resultFromPlayerHistory?.count ?? 0,
        };

        return document;
      })
      .value();

    return documents;
  }

  async getBattlesByManaCap(): Promise<BattlesByManaCapDocument[]> {
    const fromTransactions = await this.battleRepository.groupByManaCap(
      'transaction',
    );
    const fromPlayerHistory = await this.battleRepository.groupByManaCap(
      'playerHistory',
    );

    const manaCaps = _.chain([...fromTransactions, ...fromPlayerHistory])
      .map((it) => it._id)
      .uniq()
      .value();

    const now = moment().unix();

    const documents: BattlesByManaCapDocument[] = _.chain(manaCaps)
      .sort()
      .map((manaCap) => {
        const resultFromTransactions = fromTransactions.find(
          (it) => it._id === manaCap,
        );
        const resultFromPlayerHistory = fromPlayerHistory.find(
          (it) => it._id === manaCap,
        );

        const document: BattlesByManaCapDocument = {
          id: manaCap.toString(),
          updated: now,
          manaCap,
          fromTransactions: resultFromTransactions?.count ?? 0,
          fromPlayerHistory: resultFromPlayerHistory?.count ?? 0,
        };

        return document;
      })
      .value();

    return documents;
  }
}
