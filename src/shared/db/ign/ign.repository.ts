import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { validate } from 'bycontract';
import { Model } from 'mongoose';
import { Ign } from './ign.schema';

@Injectable()
export class IgnRepository {
  constructor(
    @InjectModel(Ign.name)
    public ignModel: Model<Ign>,
  ) {}

  async findAll(): Promise<Ign[]> {
    const results = await this.ignModel.find().exec();

    return results ?? [];
  }

  async findUpdatedEmpty(limit: number): Promise<Ign[]> {
    const results = await this.ignModel
      .find({
        updated: null,
      })
      .limit(limit)
      .exec();

    return results ?? [];
  }

  async findUpdatedLessThan(updated: number, limit: number): Promise<Ign[]> {
    const results = await this.ignModel
      .find({
        updated: { $lt: updated },
      })
      .limit(limit)
      .exec();

    return results ?? [];
  }

  async save(cards: Ign[]): Promise<void> {
    validate([cards], ['Array.<object>']);

    if (cards.length === 0) {
      return;
    }

    await this.ignModel.bulkWrite(
      cards.map((model) => {
        validate(model, 'object');
        const sets = ['id'];

        if (!!model.updated) {
          sets.push('updated');
        }

        return {
          updateOne: {
            filter: {
              id: model.id,
            },
            update: {
              $set: sets,
            },
            upsert: true,
          },
        };
      }),
    );
  }

  async delete(id: string) {
    await this.ignModel.deleteOne({ id });
  }
}
