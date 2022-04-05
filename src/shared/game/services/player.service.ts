import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { ApiService, PlayerCardDto, PlayerCollectionDto } from '../../api';
import { BASE_CARD_DETAIL_IDS } from '../constants';
import { MapperService } from './mapper.service';

@Injectable()
export class PlayerService {
  constructor(private apiService: ApiService) {}

  /**
   * Get the list of cards owned by a given player name, including base cards
   *
   * @param {string} playerName The in game name of the player to retrieve cards for
   * @returns {PlayerCardDto} Details of the cards owned by the player, including base cards.
   */
  async getPlayerCards(playerName: string): Promise<PlayerCardDto[]> {
    if (!playerName) {
      return [];
    }

    const playerCollection: PlayerCollectionDto =
      await this.apiService.fetchPlayerCollection(playerName);

    const allCards = await this.apiService.fetchCardDetails();

    // TODO: this performance could be improved by taking a snapshot of the response
    // The input BASE_CARD_DETAIL_IDS does not change at runtime
    const baseCards = MapperService.mapCardDetailIdsToCards(
      BASE_CARD_DETAIL_IDS,
      allCards,
    );

    // Turn player cards into a map, keyed by card_detail_id
    // This will improve performance in the next step
    const playerCardsMap = _.chain(playerCollection.cards)
      .clone()
      .groupBy((card) => card.card_detail_id)
      .mapValues((groupedCards) => groupedCards[0])
      .value();

    for (const baseCard of baseCards) {
      // Don't include base cards that have been upgraded and now included in the player collection
      if (playerCardsMap[baseCard.id]) {
        continue;
      }

      // Collection doesn't include the base card, add it, some values being set to defaults
      playerCardsMap[baseCard.id] = {
        card_detail_id: baseCard.id,
        edition: baseCard.distribution[0].edition,
        gold: false,
        level: 1,
        xp: 1,
        player: playerName,
        uid: `starter-${baseCard.id}`,
      };
    }

    return _.values(playerCardsMap);
  }
}
