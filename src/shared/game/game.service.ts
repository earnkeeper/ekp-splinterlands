import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { ApiService, PlayerCardDto, PlayerCollectionDto } from '../api';
import { MapperService } from './mapper.service';

@Injectable()
export class GameService {
  constructor(private apiService: ApiService) {}

  /**
   * Get the list of cards owned by a given player name, including base cards
   *
   * @param {string} playerName The in game name of the player to retrieve cards for
   * @returns {PlayerCardDto} Details of the cards owned by the player, including base cards.
   */
  async getPlayerCards(playerName: string): Promise<PlayerCardDto[]> {
    const playerCollection: PlayerCollectionDto =
      await this.apiService.fetchPlayerCollection(playerName);

    const allCards = await this.apiService.fetchCardDetails();

    // TODO: this performance could be improved by taking a snapshot of the response
    // The input BASE_CARD_DETAIL_IDS does not change at runtime
    const baseCards = MapperService.mapCardDetailIdsToCards(
      GameService.BASE_CARD_DETAIL_IDS,
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

  /**
   * List of base card detail ids, not available on the API, so provided here.
   * These are the starter cards given to players when they first get started in the game.
   */
  static BASE_CARD_DETAIL_IDS = [
    135, 136, 137, 138, 139, 140, 141, 145, 146, 147, 148, 149, 150, 151, 152,
    156, 157, 158, 159, 160, 161, 162, 163, 167, 168, 169, 170, 171, 172, 173,
    174, 178, 179, 180, 181, 182, 183, 184, 185, 189, 190, 191, 192, 193, 194,
    195, 196, 224, 353, 354, 355, 356, 357, 358, 359, 360, 361, 367, 368, 369,
    370, 371, 372, 373, 374, 375, 381, 382, 383, 384, 385, 386, 387, 388, 389,
    395, 396, 397, 398, 399, 400, 401, 402, 403, 409, 410, 411, 412, 413, 414,
    415, 416, 417, 423, 424, 425, 426, 427, 428, 429, 437, 438, 439, 440, 441,
  ];

  static SPLINTERS = [
    'Fire',
    'Water',
    'Earth',
    'Life',
    'Death',
    'Dragon',
    'Neutral',
  ];
  static RULESETS = [
    'Standard',
    'Aim True',
    'Armored Up',
    'Back to Basics',
    'Broken Arrows',
    'Close Range',
    'Earthquake',
    'Equal Opportunity',
    'Equalizer',
    'Even Stevens',
    'Explosive Weaponry',
    'Fog of War',
    'Healed Out',
    'Heavy Hitters',
    'Holy Protection',
    'Keep Your Distance',
    'Little League',
    'Lost Legendaries',
    'Lost Magic',
    'Melee Mayhem',
    'Noxious Fumes',
    'Odd Ones Out',
    'Reverse Speed',
    'Rise of the Commons',
    'Silenced Summoners',
    'Spreading Fury',
    'Stampede',
    'Super Sneak',
    'Taking Sides',
    'Target Practice',
    'Unprotected',
    'Up Close & Personal',
    'Weak Magic',
  ];

  static MANA_CAPS = _.chain(_.range(12, 50))
    .union([99])
    .map((it) => it.toString())
    .value();
}
