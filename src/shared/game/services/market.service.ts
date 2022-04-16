import { CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { ApiService } from '../../api';
import { CardMapper } from '../mappers';

@Injectable()
export class MarketService {
  constructor(
    private apiService: ApiService,
    private coingeckoService: CoingeckoService,
  ) {}

  async getConversionRate(
    fromCurrencyId: string,
    toCurrencyId: string,
  ): Promise<number> {
    if (fromCurrencyId === 'usd-coin' && toCurrencyId === 'usd') {
      return 1;
    }

    const prices = await this.coingeckoService.latestPricesOf(
      [fromCurrencyId],
      toCurrencyId,
    );

    return prices[0]?.price;
  }

  async getMarketPrices(): Promise<Record<string, number>> {
    const sales = await this.apiService.fetchCardSales();

    const map = {};

    for (const sale of sales) {
      if (!sale.low_price || isNaN(sale.low_price)) {
        continue;
      }

      const hash = CardMapper.mapToCardHash(
        sale.card_detail_id,
        sale.level,
        sale.edition,
        sale.gold,
      );

      if (!map[hash]) {
        map[hash] = sale.low_price;
      } else {
        map[hash] += sale.low_price;
      }
    }

    return map;
  }
}
