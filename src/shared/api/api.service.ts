import {
  AbstractApiService,
  EkConfigService,
  getAndHandle,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { validate } from 'bycontract';
import { CardDetailDto, ForSaleGroupedDto, TransactionDto } from './dto';
import { PlayerCollectionDto } from './dto/player-collection.dto';

const BASE_URL = 'https://api2.splinterlands.com';
const STEEM_BASE_URL = 'https://api.steemmonsters.io';

@Injectable()
export class ApiService extends AbstractApiService {
  constructor(configService: EkConfigService) {
    super({
      name: 'SplinterlandsApiService',
    });

    console.log(configService);
  }

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

  async fetchBattleTransactions(
    fromBlock: number,
    limit: number,
  ): Promise<TransactionDto[]> {
    validate([fromBlock, limit], ['number', 'number']);

    const url = `${STEEM_BASE_URL}/transactions/history?from_block=${fromBlock}&limit=${limit}&types=sm_battle,battle`;

    return this.handleCall({ url }, async () => {
      const response = await getAndHandle(url);

      return Array.isArray(response.data) ? response.data : [];
    });
  }

  async fetchPlayerCollection(
    playerName: string,
  ): Promise<PlayerCollectionDto> {
    const url = `${BASE_URL}/cards/collection/${playerName}`;

    return this.handleCall({ url, ttl: 15 }, async () => {
      const response = await getAndHandle(url);

      return response.data;
    });
  }
}
