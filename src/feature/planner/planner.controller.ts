import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  collection,
  RpcEvent,
} from '@earnkeeper/ekp-sdk';
import {
  AbstractController,
  ApmService,
  ClientService,
  logger,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { GameService, MarketPriceMap } from '../../shared/game';
import { PlannerService, ViableMonster, ViableTeam } from './planner.service';
import { PlannerViewBag } from './ui/planner-view-bag.document';
import { PlannerDocument } from './ui/planner.document';
import planner from './ui/planner.uielement';

const COLLECTION_NAME = collection(PlannerDocument);

@Injectable()
export class PlannerController extends AbstractController {
  constructor(
    clientService: ClientService,
    private apmService: ApmService,
    private gameService: GameService,
    private plannerService: PlannerService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitMenu(event, {
      id: `planner`,
      title: 'Battle Planner',
      navLink: `planner`,
      icon: 'cil-paw',
    });

    await this.clientService.emitPage(event, {
      id: `planner`,
      element: planner(),
    });
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    await this.clientService.emitBusy(event, COLLECTION_NAME);

    try {
      const form = event.state.forms?.planner;

      if (!form) {
        return;
      }

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

      const { teams, battles } = await this.plannerService.getViableTeams(
        playerName,
        manaCap,
        ruleset,
        leagueName,
        event.state.client.subscribed ?? false,
      );

      const cardPrices: MarketPriceMap =
        await this.gameService.getMarketPrices();

      const teamSummaryDocuments = this.mapDocuments(teams, cardPrices);

      await this.clientService.emitDocuments(
        event,
        COLLECTION_NAME,
        teamSummaryDocuments,
      );

      const viewBag = new PlannerViewBag({
        id: 'viewbag',
        battleCount: battles.length,
        firstBattleTimestamp: _.chain(battles)
          .map((battle) => battle.timestamp)
          .min()
          .value(),
      });

      await this.clientService.emitDocuments(
        event,
        collection(PlannerViewBag),
        [viewBag],
      );
    } catch (error) {
      this.apmService.captureError(error);
      logger.error('Error occurred while handling battle planner event', error);
      console.error(error);
    } finally {
      await this.clientService.emitDone(event, COLLECTION_NAME);
    }
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }

  async onClientRpc(event: RpcEvent) {
    // Do nothing
  }

  mapDocuments(
    detailedTeams: ViableTeam[],
    cardPrices: MarketPriceMap,
  ): PlannerDocument[] {
    const now = moment().unix();

    return _.chain(detailedTeams)
      .map((team) => {
        const mana = team.summoner.mana + _.sumBy(team.monsters, 'mana');

        const monsters = [];

        const getPrice = (monster: ViableMonster) => {
          if (!cardPrices[monster.cardDetailId.toString()]) {
            return undefined;
          }

          return cardPrices[monster.cardDetailId.toString()][
            monster.level.toString()
          ];
        };

        monsters.push({
          id: team.summoner.cardDetailId,
          fiatSymbol: '$',
          icon: `https://d36mxiodymuqjm.cloudfront.net/card_art/${team.summoner.name}.png`,
          level: team.summoner.level,
          mana: team.summoner.mana,
          name: team.summoner.name,
          price: getPrice(team.summoner),
          splinter: team.summoner.splinter,
          type: 'Summoner',
        });

        // TODO: check if these are added in the right order, order is important
        monsters.push(
          ...team.monsters.map((monster) => ({
            id: monster.cardDetailId,
            fiatSymbol: '$',
            icon: `https://d36mxiodymuqjm.cloudfront.net/card_art/${monster.name}.png`,
            level: team.summoner.level,
            mana: monster.mana,
            name: monster.name,
            price: getPrice(monster),
            splinter: monster.splinter,
            type: 'Monster',
          })),
        );

        return {
          id: team.id,
          updated: now,
          battles: team.battles,
          elementIcon: `https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-${team.summoner.splinter.toLowerCase()}-2.svg`,
          fiatSymbol: '$', // TODO: support multicurrency
          mana,
          monsterCount: team.monsters.length,
          monsters,
          price: _.chain(monsters)
            .filter((it) => !!it.price)
            .sumBy('price')
            .value(),
          splinter: team.summoner.splinter,
          summoner: team.summoner.name,
          summonerIcon: `https://d36mxiodymuqjm.cloudfront.net/card_art/${team.summoner.name}.png`,
          winpc: team.wins / team.battles,
        };
      })
      .value();
  }
}
