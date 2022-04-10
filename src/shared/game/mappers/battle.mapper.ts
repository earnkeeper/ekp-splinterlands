import { TeamDetailedDto } from 'src/shared/api';
import { Battle } from '../../db';
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
}
