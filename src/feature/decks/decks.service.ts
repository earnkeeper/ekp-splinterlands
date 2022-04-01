import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { GameService, MarketPriceMap, ResultsService } from '../../shared/game';
import { DeckCard, DeckDocument } from './ui/deck.document';

@Injectable()
export class DecksService {
  constructor(
    private resultsService: ResultsService,
    private gameService: GameService,
  ) {}

  async updateTeams(
    clientTeams: DeckDocument[],
    form: any,
    subscribed: boolean,
  ) {
    const manaCap = Number(form.manaCap);

    if (isNaN(manaCap)) {
      // We need a mana cap, we will kill the db getting all battles
      // And the return teams are not meaningful without mana
      return;
    }

    // We don't need a player name, just get all teams in this case
    const playerName = form.playerName ?? '';

    // All other properties can have sensible defaults
    const ruleset = form.ruleset ?? 'Standard';
    const leagueName = form.leagueName ?? 'All';

    const { teams: teamResults } = await this.resultsService.getTeamResults(
      manaCap,
      ruleset,
      leagueName,
      subscribed,
    );

    const cardPrices: MarketPriceMap = await this.gameService.getMarketPrices();

    const playerCards = !!playerName
      ? await this.gameService.getPlayerCards(playerName)
      : undefined;

    const deckDocuments: DeckDocument[] = clientTeams.map((document) => {
      const getPrice = (monster: DeckCard) => {
        if (!cardPrices[monster.id.toString()]) {
          return undefined;
        }

        return cardPrices[monster.id.toString()][monster.level.toString()];
      };

      const newMonsters = document.monsters.map((monster) => {
        const cardOwned = playerCards?.find(
          (it) =>
            it.card_detail_id === monster.id && it.level === monster.level,
        );

        return {
          ...monster,
          price: !!cardOwned ? undefined : getPrice(monster),
        };
      });

      const teamResult = teamResults.find((it) => it.id === document.id);

      return {
        ...document,
        fiatSymbol: '$',
        monsters: newMonsters,
        price: _.chain(newMonsters)
          .map((it) => it.price)
          .filter((it) => !!it)
          .sum()
          .value(),
        winpc: teamResult.wins / teamResult.battles,
        battles: teamResult.battles,
      };
    });

    return deckDocuments;
  }
}
