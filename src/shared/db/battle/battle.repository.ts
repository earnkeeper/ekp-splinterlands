import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { validate } from 'bycontract';
import _ from 'lodash';
import { Model } from 'mongoose';
import { Battle } from './battle.schema';
@Injectable()
export class BattleRepository {
  constructor(
    @InjectModel(Battle.name)
    public battleModel: Model<Battle>,
  ) {}

  async count(): Promise<number> {
    return this.battleModel.countDocuments();
  }

  async findOldest(): Promise<Battle> {
    const results = await this.battleModel
      .find()
      .sort('timestamp')
      .limit(1)
      .exec();

    if (!results || results.length === 0) {
      return undefined;
    }

    return results[0];
  }

  async findLatest(): Promise<Battle> {
    const results = await this.battleModel
      .find()
      .sort('-timestamp')
      .limit(1)
      .exec();

    if (!results || results.length === 0) {
      return undefined;
    }

    return results[0];
  }

  async groupByLeague(source: string) {
    validate(source, 'string');

    const results = await this.battleModel.aggregate([
      {
        $match: { source },
      },
      {
        $group: {
          _id: '$leagueGroup',
          count: { $sum: 1 },
        },
      },
    ]);

    return results;
  }

  async groupByTimestamp(source: string) {
    validate(source, 'string');

    const results = await this.battleModel.aggregate([
      {
        $match: { source },
      },
      {
        $group: {
          _id: { $dayOfYear: '$timestampDate' },
          count: { $sum: 1 },
        },
      },
    ]);

    return results;
  }

  async groupByManaCap(source: string) {
    validate(source, 'string');

    const results = await this.battleModel.aggregate([
      {
        $match: { source },
      },
      {
        $group: {
          _id: '$manaCap',
          count: { $sum: 1 },
        },
      },
    ]);

    return results;
  }

  async findByCardHashAndLeagueGroup(
    cardHash: string,
    leagueGroup: string,
    limit: number,
  ): Promise<Battle[]> {
    const query: { cardHashes: string; leagueGroup?: string } = {
      cardHashes: cardHash,
    };

    if (!!leagueGroup && leagueGroup !== 'All' && leagueGroup !== '0') {
      query.leagueGroup = leagueGroup;
    }

    const results = await this.battleModel
      .find(query)
      .sort('-timestamp')
      .limit(limit)
      .exec();

    return results ?? [];
  }

  async findByCardHashesAndMana(
    cardHashes: string[],
    mana: number,
    limit: number,
  ): Promise<Battle[]> {
    const query: { cardHashes: any; manaCap: number } = {
      cardHashes: { $all: cardHashes },
      manaCap: mana,
    };

    const results = await this.battleModel
      .find(query)
      .sort('-timestamp')
      .limit(limit)
      .exec();

    return results ?? [];
  }

  async findByTeamIdAndLeagueName(
    teamId: string,
    leagueGroup: string,
    limit: number,
  ): Promise<Battle[]> {
    const query: { cardHashes: string; leagueGroup?: string } = {
      cardHashes: teamId,
    };

    if (!!leagueGroup && leagueGroup !== 'All') {
      query.leagueGroup = leagueGroup;
    }

    const results = await this.battleModel
      .find(query)
      .sort('-timestamp')
      .limit(limit)
      .exec();

    return results ?? [];
  }

  async findAllAfterBlockNumber(
    blockNumber: number,
    limit: number,
  ): Promise<Battle[]> {
    validate([blockNumber, limit], ['number', 'number']);

    const results = await this.battleModel
      .find({
        blockNumber: {
          $gt: blockNumber,
        },
      })
      .sort('blockNumber')
      .limit(limit)
      .exec();

    return results ?? [];
  }

  async findWithVersionLessThan(
    version: number,
    oldestTimestamp: number,
    limit: number,
  ): Promise<Battle[]> {
    const results = await this.battleModel
      .find({
        $and: [
          { timestamp: { $gte: oldestTimestamp } },
          {
            $or: [
              {
                version: { $lt: version },
              },
              {
                version: null,
              },
            ],
          },
        ],
      })
      .sort('timestamp')
      .limit(limit)
      .exec();

    return results ?? [];
  }

  async findLatestByBlockNumber(source: string): Promise<Battle> {
    const results = await this.battleModel
      .find({ source })
      .sort('-blockNumber')
      .limit(1)
      .exec();

    if (!results || results.length === 0) {
      return undefined;
    }

    return results[0];
  }

  async findBattleByManaCap(
    manaCap: number,
    leagueGroup: string,
    startTimestamp: number,
  ): Promise<Battle[]> {
    validate(
      [manaCap, leagueGroup, startTimestamp],
      ['number', 'string', 'number'],
    );

    const query: {
      timestamp: any;
      manaCap: number;
      leagueGroup?: string;
    } = {
      timestamp: {
        $gte: startTimestamp,
      },
      manaCap,
    };

    if (leagueGroup !== 'All') {
      query.leagueGroup = leagueGroup;
    }

    return this.battleModel.where(query).sort('timestamp').exec();
  }

  async save(battles: Battle[]): Promise<void> {
    validate([battles], ['Array.<object>']);

    if (battles.length === 0) {
      return;
    }

    await this.battleModel.bulkWrite(
      battles.map((model) => {
        validate(model, 'object');
        return {
          updateOne: {
            filter: {
              id: model.id,
            },
            update: {
              $set: _.pick(model, [
                'id',
                'blockNumber',
                'cardHashes',
                'fetched',
                'fetchedDate',
                'leagueGroup',
                'loser',
                'manaCap',
                'players',
                'rulesets',
                'source',
                'team1',
                'team2',
                'timestamp',
                'timestampDate',
                'version',
                'winner',
              ]),
            },
            upsert: true,
          },
        };
      }),
    );
  }
}
