import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import {
  BattleDetailsDto,
  BattleDto,
  CardDetailDto,
  PlayerDto,
  TeamDetailedDto,
  TransactionDto,
} from '../../api';
import { PlayerBattleDto } from '../../api/dto/player-battles.dto';
import { Battle } from '../../db';
import { LEAGUES } from '../constants';

@Injectable()
export class MapperService {
  /**
   * Map a list of numeric card_detail_ids to full CardDetails objects
   *
   * @param {number[]} cardDetailIds list of numeric card details ids, usually card_detail_id on api responses
   * @param {CardDetailDto[]} allCards list of all cards in the game, returned by getDetails on the api
   * @returns {CardDetailDto[]} the card details for the given ids
   */
  static mapCardDetailIdsToCards(
    cardDetailIds: number[],
    allCards: CardDetailDto[],
  ): CardDetailDto[] {
    return _.chain(cardDetailIds)
      .map((id) => allCards.find((card) => card.id === id))
      .value();
  }

  static mapCardMana(card: CardDetailDto, level: number): number {
    let mana = card.stats.mana;

    if (Array.isArray(mana)) {
      mana = mana[level];
    }

    return mana;
  }

  static mapWinnerAndLoser(battle: Battle) {
    let winner: TeamDetailedDto;
    let loser: TeamDetailedDto;

    if (battle.winner === battle.team1.player) {
      winner = battle.team1;
      loser = battle.team2;
    } else {
      winner = battle.team2;
      loser = battle.team1;
    }

    return { winner, loser };
  }

  static mapLeagueName(rating: number, power?: number): string {
    // TODO: could cache this, minor performance issue (cpu)
    const sortedLeagues = _.chain(LEAGUES)
      .sortBy('min_rating')
      .reverse()
      .value();

    for (const league of sortedLeagues) {
      if (
        rating >= league.min_rating &&
        (!power || power >= league.min_power)
      ) {
        return league.name;
      }
    }
    return _.last(sortedLeagues).name;
  }

  static mapLeagueGroup(leagueName: string): string {
    if (!leagueName) {
      return leagueName;
    }

    return leagueName.split(' ')[0];
  }

  static mapBattlesFromPlayer(
    playerBattles: PlayerBattleDto[],
    version: number,
  ): Battle[] {
    return playerBattles
      .map((it) => MapperService.mapBattleFromPlayer(it, version))
      .filter((it) => !!it);
  }

  static mapBattleId(player1: string, player2: string, timestamp: number) {
    return [player1, player2, timestamp].join('|');
  }

  static mapPlayersFromPlayerBattle(
    playerBattle: PlayerBattleDto,
    battleDetails: BattleDetailsDto,
  ) {
    const player1: PlayerDto = {
      name: playerBattle.player_1,
      initial_rating: playerBattle.player_1_rating_initial,
      final_rating: playerBattle.player_1_rating_final,
      team: {
        summoner: battleDetails.team1.summoner.uid,
        monsters: battleDetails.team1.monsters.map((it) => it.uid),
      },
    };
    const player2: PlayerDto = {
      name: playerBattle.player_2,
      initial_rating: playerBattle.player_2_rating_initial,
      final_rating: playerBattle.player_2_rating_final,
      team: {
        summoner: battleDetails.team2.summoner.uid,
        monsters: battleDetails.team2.monsters.map((it) => it.uid),
      },
    };

    return [player1, player2];
  }

  static mapBattleFromPlayer(
    playerBattle: PlayerBattleDto,
    version: number,
  ): Battle {
    const battleDetails: BattleDetailsDto = JSON.parse(playerBattle.details);

    if (battleDetails?.type === 'Surrender') {
      return undefined;
    }

    const timestamp = moment(playerBattle.created_date).unix();

    const players = this.mapPlayersFromPlayerBattle(
      playerBattle,
      battleDetails,
    );

    const leagueName = MapperService.mapLeagueName(players[0].initial_rating);
    const leagueGroup = MapperService.mapLeagueGroup(leagueName);

    return {
      id: this.mapBattleId(
        playerBattle.player_1,
        playerBattle.player_2,
        timestamp,
      ),
      blockNumber: playerBattle.block_num,
      timestamp: timestamp,
      manaCap: playerBattle.mana_cap,
      players,
      rulesets: playerBattle.ruleset.split('|'),
      team1: battleDetails.team1,
      team2: battleDetails.team2,
      winner: playerBattle.winner,
      loser:
        playerBattle.winner === battleDetails.team1.player
          ? battleDetails.team2.player
          : battleDetails.team1.player,
      leagueName,
      leagueGroup,
      source: 'playerHistory',
      version,
    };
  }

  static mapBattlesFromTransactions(
    transactions: TransactionDto[],
    version: number,
  ): Battle[] {
    return transactions
      .filter((it) => it.success && !!it.result)
      .map((it) => MapperService.mapBattleFromTransaction(it, version))
      .filter((it) => !!it);
  }

  static mapBattleFromTransaction(
    transaction: TransactionDto,
    version: number,
  ): Battle {
    if (!transaction.success || !transaction.result) {
      return undefined;
    }

    const battle: BattleDto = JSON.parse(transaction.result);

    if (battle.details?.type === 'Surrender') {
      return undefined;
    }

    const leagueName = MapperService.mapLeagueName(
      battle.players[0].initial_rating,
    );
    const leagueGroup = MapperService.mapLeagueGroup(leagueName);

    return {
      id: battle.id,
      blockNumber: transaction.block_num,
      timestamp: moment(transaction.created_date).unix(),
      manaCap: battle.mana_cap,
      players: battle.players,
      rulesets: battle.ruleset.split('|'),
      team1: battle.details.team1,
      team2: battle.details.team2,
      winner: battle.winner,
      loser:
        battle.winner === battle.details.team1.player
          ? battle.details.team2.player
          : battle.details.team1.player,
      leagueName,
      leagueGroup,
      source: 'transaction',
      version,
    };
  }

  static mapRarityNumberToString(rarity: number): string {
    switch (rarity) {
      case 1:
        return 'Common';
      case 2:
        return 'Rare';
      case 3:
        return 'Epic';
      case 4:
        return 'Legendary';
      default:
        return 'Unknown';
    }
  }

  static mapColorToSplinter(color: string) {
    switch (color) {
      case 'Red':
        return 'Fire';
      case 'Blue':
        return 'Water';
      case 'Green':
        return 'Earth';
      case 'White':
        return 'Life';
      case 'Black':
        return 'Death';
      case 'Gold':
        return 'Dragon';
      case 'Gray':
        return 'Neutral';
      default:
        return 'Unknown';
    }
  }

  static mapEditionString(editionIndex: number) {
    switch (editionIndex) {
      case 0:
        return 'Alpha';
      case 1:
        return 'Beta';
      case 2:
        return 'Promo';
      case 3:
        return 'Reward';
      case 4:
        return 'Untamed';
      case 5:
        return 'Dice';
      case 7:
        return 'Chaos';
      default:
        return 'Unknown';
    }
  }
}
