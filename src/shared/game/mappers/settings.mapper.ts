import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { TeamDetailedDto } from 'src/shared/api';
import {
  BattleDetailsDto,
  BattleDto,
  PlayerDto,
  TransactionDto,
} from '../../api';
import { PlayerBattleDto } from '../../api/dto/player-battles.dto';
import { Battle } from '../../db';
import { LEAGUES } from '../constants';
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
      .map((it) => SettingsMapper.mapBattleFromPlayer(it, version))
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

    const leagueName = SettingsMapper.mapToLeagueName(
      players[0].initial_rating,
    );
    const leagueGroup = SettingsMapper.mapLeagueGroup(leagueName);

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
    version: number,
  ): Battle[] {
    return transactions
      .filter((it) => it.success && !!it.result)
      .map((it) => SettingsMapper.mapBattleFromTransaction(it, version))
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

    const leagueName = SettingsMapper.mapToLeagueName(
      battle.players[0].initial_rating,
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
