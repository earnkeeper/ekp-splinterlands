import _ from 'lodash';
import moment from 'moment';
import {
  BattleDetailsDto,
  PlayerBattleDto,
  PlayerDto,
  TeamDetailedDto,
} from '../../api';
import { Battle } from '../../db';
import { LEAGUES } from '../constants';
import { CardTemplate, Team } from '../domain';
import { CardMapper } from './card.mapper';

export class BattleMapper {
  static mapToTeam(
    teamDetailedDto: TeamDetailedDto,
    cardTemplatesMap: Record<number, CardTemplate>,
  ) {
    const summonerCardTemplate =
      cardTemplatesMap[teamDetailedDto.summoner.card_detail_id];
    return {
      playerName: teamDetailedDto.player,
      summoner: CardMapper.mapToCard(
        summonerCardTemplate,
        teamDetailedDto.summoner.level,
        teamDetailedDto.summoner.edition,
        teamDetailedDto.summoner.gold,
        teamDetailedDto.summoner.xp,
        teamDetailedDto.summoner.uid,
      ),
      monsters: teamDetailedDto.monsters.map((monster) => {
        const monsterCardTemplate = cardTemplatesMap[monster.card_detail_id];
        return CardMapper.mapToCard(
          monsterCardTemplate,
          monster.level,
          monster.edition,
          monster.gold,
          monster.xp,
          monster.uid,
        );
      }),
    };
  }

  static mapToWinnerAndLoser(
    battle: Battle,
    cardTemplatesMap: Record<number, CardTemplate>,
  ): { winner: Team; loser: Team } {
    const team1 = BattleMapper.mapToTeam(battle.team1, cardTemplatesMap);
    const team2 = BattleMapper.mapToTeam(battle.team2, cardTemplatesMap);

    if (battle.winner === battle.team1.player) {
      return { winner: team1, loser: team2 };
    } else {
      return { winner: team2, loser: team1 };
    }
  }

  static mapBattlesFromPlayer(
    playerBattles: PlayerBattleDto[],
    cardTemplatesMap: Record<number, CardTemplate>,
    version: number,
    fetchedMoment: moment.Moment,
  ): Battle[] {
    return playerBattles
      .map((it) => BattleMapper.mapBattleFromPlayer(it, version, fetchedMoment))
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
    fetchedMoment: moment.Moment,
  ): Battle {
    const battleDetails: BattleDetailsDto = JSON.parse(playerBattle.details);

    if (battleDetails?.type === 'Surrender') {
      return undefined;
    }

    const timestampMoment = moment(playerBattle.created_date);

    const players = this.mapPlayersFromPlayerBattle(
      playerBattle,
      battleDetails,
    );

    const settings = JSON.parse(playerBattle.settings);

    const leagueGroup = LEAGUES.find(
      (it) => it.level === settings.rating_level,
    )?.group;

    const loser =
      playerBattle.winner === battleDetails.team1.player
        ? battleDetails.team2.player
        : battleDetails.team1.player;

    const cardHashes = BattleMapper.mapToCardHashes([
      battleDetails.team1,
      battleDetails.team2,
    ]);

    return {
      id: playerBattle.battle_queue_id_1,
      blockNumber: playerBattle.block_num,
      cardHashes,
      fetched: fetchedMoment.unix(),
      fetchedDate: fetchedMoment.toDate(),
      leagueGroup,
      loser,
      manaCap: playerBattle.mana_cap,
      players,
      rulesets: playerBattle.ruleset.split('|'),
      source: 'playerHistory',
      team1: battleDetails.team1,
      team2: battleDetails.team2,
      timestamp: timestampMoment.unix(),
      timestampDate: timestampMoment.toDate(),
      version,
      winner: playerBattle.winner,
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
}
