import { AbstractApiService, getAndHandle } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { CardDetailDto, ForSaleGroupedDto } from './dto';

const BASE_URL = 'https://api2.splinterlands.com';

@Injectable()
export class SplinterlandsApiService extends AbstractApiService {
  async fetchCardSales(): Promise<ForSaleGroupedDto[]> {
    const url = `${BASE_URL}/market/for_sale_grouped`;

    return this.handleCall({ url, ttl: 30 }, async () => {
      const response = await getAndHandle(url);
      return response.data;
    });
  }

  async fetchCardDetails(): Promise<CardDetailDto[]> {
    const url = `${BASE_URL}/cards/get_details`;

    return this.handleCall({ url, ttl: 300 }, async () => {
      const response = await getAndHandle(url);
      return response.data;
    });
  }
}
