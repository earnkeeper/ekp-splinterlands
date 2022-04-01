import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { validate } from 'bycontract';
import _ from 'lodash';
import { BattleForm } from 'src/util';
import { PlayerCardDto } from '../../shared/api';
import {
  GameService,
  MarketPriceMap,
  ResultsService,
  TeamResults,
} from '../../shared/game';
import { DeckCard, DeckDocument } from './ui/deck.document';

@Injectable()
export class DecksService {
  constructor(
    private resultsService: ResultsService,
    private gameService: GameService,
    private coingeckoService: CoingeckoService,
  ) {}

  async updateTeams(
    clientTeams: DeckDocument[],
    form: BattleForm,
    subscribed: boolean,
    currency: CurrencyDto,
  ) {
    validate([form, form.manaCap], ['object', 'number']);

    const { teams: teamResults } = await this.resultsService.getTeamResults(
      form.manaCap,
      form.ruleset,
      form.leagueName,
      subscribed,
    );

    const cardPrices: MarketPriceMap = await this.gameService.getMarketPrices();

    const playerCards = !!form.playerName
      ? await this.gameService.getPlayerCards(form.playerName)
      : undefined;

    return await this.mapDocuments(
      cardPrices,
      clientTeams,
      playerCards,
      teamResults,
      currency,
    );
  }

  async mapDocuments(
    cardPrices: MarketPriceMap,
    clientTeams: DeckDocument[],
    playerCards: PlayerCardDto[],
    teamResults: TeamResults[],
    currency: CurrencyDto,
  ) {
    let conversionRate = 1;

    if (currency.id !== 'usd') {
      const prices = await this.coingeckoService.latestPricesOf(
        ['usd-coin'],
        currency.id,
      );

      conversionRate = prices[0].price;
    }

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
        fiatSymbol: currency.symbol,
        monsters: newMonsters,
        price: _.chain(newMonsters)
          .map((it) => it.price)
          .filter((it) => !!it)
          .sum()
          .thru((it) => it * conversionRate)
          .value(),
        winpc: teamResult.wins / teamResult.battles,
        battles: teamResult.battles,
      };
    });

    return deckDocuments;
  }
}
