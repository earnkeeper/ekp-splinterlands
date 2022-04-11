import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import {
  BattleDetailsDto,
  BattleDto,
  PlayerDto,
  TeamDetailedDto,
  TransactionDto,
} from '../../api';
import { PlayerBattleDto } from '../../api/dto/player-battles.dto';
import { Battle } from '../../db';
import { LEAGUES } from '../constants';
import { Card, CardTemplate } from '../domain';
import { BattleMapper } from './battle.mapper';
import { CardMapper } from './card.mapper';

@Injectable()
export class SettingsMapper {
  static mapToLeagueName(rating: number, power?: number): string {
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

  static mapToLeagueNameFromTeams(
    rating: number,
    team1: Card[],
    team2: Card[],
  ): string {
    const minPower = _.min(
      [team1, team2].map((cards) => _.sum(cards.map((card) => card.power))),
    );

    return SettingsMapper.mapToLeagueName(rating, minPower);
  }

  static mapLeagueGroup(leagueName: string): string {
    if (!leagueName) {
      return leagueName;
    }

    return leagueName.split(' ')[0];
  }

  static mapBattlesFromPlayer(
    playerBattles: PlayerBattleDto[],
    cardTemplatesMap: Record<number, CardTemplate>,
    version: number,
  ): Battle[] {
    return playerBattles
      .map((it) =>
        SettingsMapper.mapBattleFromPlayer(it, cardTemplatesMap, version),
      )
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
    cardTemplatesMap: Record<number, CardTemplate>,
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

    const team1 = BattleMapper.mapToTeam(battleDetails.team1, cardTemplatesMap);
    const team2 = BattleMapper.mapToTeam(battleDetails.team2, cardTemplatesMap);

    const minRating = _.chain(players)
      .map((it) => it.initial_rating)
      .min()
      .value();

    const leagueName = SettingsMapper.mapToLeagueNameFromTeams(
      minRating,
      [team1.summoner, ...team1.monsters],
      [team2.summoner, ...team2.monsters],
    );

    const leagueGroup = SettingsMapper.mapLeagueGroup(leagueName);

    return {
      id: playerBattle.battle_queue_id_1,
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
      cardHashes: SettingsMapper.mapToCardHashes([
        battleDetails.team1,
        battleDetails.team2,
      ]),
      version,
    };
  }

  static mapToCardHashes(teams: TeamDetailedDto[]) {
    return _.chain(teams)
      .flatMap((team) => [team.summoner, ...team.monsters])
      .map((monster) =>
        CardMapper.mapToCardHash(
          monster.card_detail_id,
          monster.level,
          monster.edition,
          monster.gold,
        ),
      )
      .uniq()
      .value();
  }

  static mapBattlesFromTransactions(
    transactions: TransactionDto[],
    cardTemplatesMap: Record<number, CardTemplate>,
    version: number,
  ): Battle[] {
    return transactions
      .filter((it) => it.success && !!it.result)
      .map((it) =>
        SettingsMapper.mapBattleFromTransaction(it, cardTemplatesMap, version),
      )
      .filter((it) => !!it);
  }

  static mapBattleFromTransaction(
    transaction: TransactionDto,
    cardTemplatesMap: Record<number, CardTemplate>,
    version: number,
  ): Battle {
    if (!transaction.success || !transaction.result) {
      return undefined;
    }

    const battle: BattleDto = JSON.parse(transaction.result);

    if (battle.details?.type === 'Surrender') {
      return undefined;
    }

    const team1 = BattleMapper.mapToTeam(
      battle.details.team1,
      cardTemplatesMap,
    );
    const team2 = BattleMapper.mapToTeam(
      battle.details.team2,
      cardTemplatesMap,
    );

    const minRating = _.chain(battle.players)
      .map((it) => it.initial_rating)
      .min()
      .value();

    const leagueName = SettingsMapper.mapToLeagueNameFromTeams(
      minRating,
      [team1.summoner, ...team1.monsters],
      [team2.summoner, ...team2.monsters],
    );

    const leagueGroup = SettingsMapper.mapLeagueGroup(leagueName);

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
      cardHashes: SettingsMapper.mapToCardHashes([
        battle.details.team1,
        battle.details.team2,
      ]),
      version,
    };
  }
}
