import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { validate } from 'bycontract';
import _ from 'lodash';
import { Model } from 'mongoose';
import { CardStats } from './card-stats.schema';

@Injectable()
export class CardStatsRepository {
  constructor(
    @InjectModel(CardStats.name)
    public cardModel: Model<CardStats>,
  ) {}

  async findAll(): Promise<CardStats[]> {
    const results = await this.cardModel.find().exec();

    return results ?? [];
  }

  async save(cards: CardStats[]): Promise<void> {
    validate([cards], ['Array.<object>']);

    if (cards.length === 0) {
      return;
    }

    await this.cardModel.bulkWrite(
      cards.map((model) => ({
        updateOne: {
          filter: {
            id: model.id,
          },
          update: {
            $set: _.pick(model, [
              'id',
              'blockNumber',
              'hash',
              'level',
              'dailyBattleStats',
              'templateId',
              'gold',
              'editionNumber',
            ]),
          },
          upsert: true,
        },
      })),
    );
  }
}
