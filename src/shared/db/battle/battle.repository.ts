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

  async findByCardHashAndLeagueName(
    cardHash: string,
    leagueName: string,
    limit: number,
  ): Promise<Battle[]> {
    const query: { cardHashes: string; leagueName?: string } = {
      cardHashes: cardHash,
    };

    if (!!leagueName && leagueName !== 'All' && leagueName !== '0') {
      query.leagueName = leagueName;
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
    leagueName: string,
    limit: number,
  ): Promise<Battle[]> {
    const query: { cardHashes: string; leagueName?: string } = {
      cardHashes: teamId,
    };

    if (!!leagueName && leagueName !== 'All') {
      query.leagueName = leagueName;
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

  async findLatestByBlockNumber(): Promise<Battle> {
    const results = await this.battleModel
      .find({ source: { $not: { $eq: 'playerHistory' } } })
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
    leagueName: string,
    startTimestamp: number,
  ): Promise<Battle[]> {
    validate(
      [manaCap, leagueName, startTimestamp],
      ['number', 'string', 'number'],
    );

    const query: {
      timestamp: any;
      manaCap: number;
      leagueName?: string;
    } = {
      timestamp: {
        $gte: startTimestamp,
      },
      manaCap,
    };

    if (leagueName !== 'All') {
      query.leagueName = leagueName;
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
                'leagueGroup',
                'leagueName',
                'loser',
                'manaCap',
                'players',
                'rulesets',
                'team1',
                'team2',
                'timestamp',
                'version',
                'winner',
                'cardHashes',
              ]),
            },
            upsert: true,
          },
        };
      }),
    );
  }
}
