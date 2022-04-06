import { Injectable } from '@nestjs/common';
import { ApiService } from '../../api';

@Injectable()
export class MarketService {
  constructor(private apiService: ApiService) {}

  async getMarketPrices(): Promise<MarketPriceMap> {
    const sales = await this.apiService.fetchCardSales();

    const map = {};

    for (const sale of sales) {
      if (!sale.low_price || isNaN(sale.low_price)) {
        continue;
      }

      if (!map[sale.card_detail_id.toString()]) {
        map[sale.card_detail_id.toString()] = {};
      }

      if (!map[sale.card_detail_id.toString()][sale.level.toString()]) {
        map[sale.card_detail_id.toString()][sale.level.toString()] = 0;
      }

      map[sale.card_detail_id.toString()][sale.level.toString()] =
        map[sale.card_detail_id.toString()][sale.level.toString()] +
        sale.low_price;
    }

    return map;
  }
}

export type MarketPriceMap = {
  [cardDetailId: string]: { [level: string]: number };
};
