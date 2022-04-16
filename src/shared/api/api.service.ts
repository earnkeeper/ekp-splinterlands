import { AbstractApiService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import axios from 'axios-https-proxy-fix';
import {
  CardDetailDto,
  ForSaleGroupedDto,
  LeaderboardDto,
  SettingsDto,
  TransactionDto,
} from './dto';
import { PlayerBattlesDto } from './dto/player-battles.dto';
import { PlayerCollectionDto } from './dto/player-collection.dto';

const BASE_URL = 'https://api2.splinterlands.com';
const STEEM_BASE_URL = 'https://api.steemmonsters.io';
const CACHE_BASE_URL = 'https://cache-api.splinterlands.com';

@Injectable()
export class ApiService extends AbstractApiService {
  private readonly proxy: { host: string; port: number };

  constructor() {
    super({
      name: 'SplinterlandsApiService',
      limit: {
        maxConcurrent: 30,
        reservoir: 30,
        reservoirRefreshAmount: 30,
        reservoirRefreshInterval: 15000,
      },
    });

    if (process.env.PROXY_HOST) {
      this.proxy = {
        host: process.env.PROXY_HOST,
        port: !!process.env.PROXY_PORT ? Number(process.env.PROXY_PORT) : 3128,
      };
    }
  }

  async fetchSettings(): Promise<SettingsDto> {
    const url = `${BASE_URL}/settings`;

    return this.handleCall({ url, ttl: 86400 }, async () => {
      const response = await axios.get(url, { proxy: this.proxy });
      return response.data;
    });
  }

  async fetchCardSales(): Promise<ForSaleGroupedDto[]> {
    const url = `${BASE_URL}/market/for_sale_grouped`;

    return this.handleCall({ url, ttl: 60 }, async () => {
      const response = await axios.get(url, { proxy: this.proxy });
      return response.data;
    });
  }

  async fetchLeaderboard(
    season: number,
    leagueId: number,
  ): Promise<LeaderboardDto> {
    const url = `${CACHE_BASE_URL}/players/leaderboard_with_player?season=${season}&leaderboard=${leagueId}`;

    return this.handleCall({ url, ttl: 3600 }, async () => {
      const response = await axios.get(url, { proxy: this.proxy });
      return response.data;
    });
  }

  async fetchCardDetails(): Promise<CardDetailDto[]> {
    const url = `${BASE_URL}/cards/get_details`;

    return this.handleCall({ url, ttl: 3600 }, async () => {
      const response = await axios.get(url, { proxy: this.proxy });
      return response.data;
    });
  }

  async fetchBattleTransactions(): Promise<TransactionDto[]> {
    const url = `${STEEM_BASE_URL}/transactions/history?limit=1000&types=sm_battle,battle`;

    return this.handleCall({ url }, async () => {
      const response = await axios.get(url, { proxy: this.proxy });

      return Array.isArray(response.data) ? response.data : [];
    });
  }

  async fetchPlayerCollection(
    playerName: string,
  ): Promise<PlayerCollectionDto> {
    const url = `${BASE_URL}/cards/collection/${playerName}`;

    return this.handleCall({ url, ttl: 60 }, async () => {
      const response = await axios.get(url, { proxy: this.proxy });

      return response.data;
    });
  }

  async fetchPlayerBattles(playerName: string): Promise<PlayerBattlesDto> {
    const url = `${BASE_URL}/battle/history?player=${playerName}`;

    return this.handleCall({ url }, async () => {
      const response = await axios.get(url, { proxy: this.proxy });

      return response.data;
    });
  }
}
