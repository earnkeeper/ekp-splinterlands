import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { validate } from 'bycontract';
import _ from 'lodash';
import { Model } from 'mongoose';
import { Card } from './card.schema';

@Injectable()
export class CardRepository {
  constructor(
    @InjectModel(Card.name)
    public cardModel: Model<Card>,
  ) {}

  async findAll(): Promise<Card[]> {
    const results = await this.cardModel.find().exec();

    return results ?? [];
  }

  async save(cards: Card[]): Promise<void> {
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
            $set: _.pick(model, ['id', 'blockNumber', 'dailyStats']),
          },
          upsert: true,
        },
      })),
    );
  }
}
