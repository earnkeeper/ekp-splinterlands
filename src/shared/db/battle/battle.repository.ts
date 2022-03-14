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

  async findLatestByBlockNumber(): Promise<Battle> {
    const results = await this.battleModel
      .find()
      .sort('-blockNumber')
      .limit(1)
      .exec();

    if (!results || results.length === 0) {
      return undefined;
    }

    return results[0];
  }

  async findByManaCapRulesetAndTimestampGreaterThan(
    manaCap: number,
    ruleset: string,
    timestamp: number,
  ): Promise<Battle[]> {
    validate([manaCap, ruleset, timestamp], ['number', 'string', 'number']);

    return this.battleModel
      .where({
        timestamp: {
          $gte: timestamp,
        },
        manaCap,
        ruleset,
      })
      .sort('timestamp')
      .exec();
  }

  async save(battles: Battle[]): Promise<void> {
    validate([battles], ['Array.<object>']);

    if (battles.length === 0) {
      return;
    }

    await this.battleModel.bulkWrite(
      battles.map((model) => ({
        updateOne: {
          filter: {
            id: model.id,
          },
          update: {
            $set: _.pick(model, [
              'id',
              'blockNumber',
              'timestamp',
              'manaCap',
              'ruleset',
              'players',
              'raw',
            ]),
          },
          upsert: true,
        },
      })),
    );
  }
}
