import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  collection,
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
import { PlannerService, ViableTeam } from './planner.service';
import { PlannerViewBag } from './ui/planner-view-bag.document';
import { PlannerDocument } from './ui/planner.document';
import planner from './ui/planner.uielement';

const COLLECTION_NAME = collection(PlannerDocument);

@Injectable()
export class PlannerController extends AbstractController {
  constructor(
    clientService: ClientService,
    private apmService: ApmService,
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

      const teamSummaryDocuments = this.mapDocuments(teams);

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

  mapDocuments(detailedTeams: ViableTeam[]): PlannerDocument[] {
    const now = moment().unix();

    return _.chain(detailedTeams)
      .map((team) => {
        const mana = team.summoner.mana + _.sumBy(team.monsters, 'mana');

        const monsters = [];

        monsters.push({
          id: team.summoner.cardDetailId,
          name: team.summoner.name,
          mana: team.summoner.mana,
          type: 'Summoner',
          splinter: team.summoner.splinter,
          icon: `https://d36mxiodymuqjm.cloudfront.net/card_art/${team.summoner.name}.png`,
        });

        // TODO: check if these are added in the right order, order is important
        monsters.push(
          ...team.monsters.map((monster) => ({
            id: monster.cardDetailId,
            name: monster.name,
            mana: monster.mana,
            type: 'Monster',
            splinter: monster.splinter,
            icon: `https://d36mxiodymuqjm.cloudfront.net/card_art/${monster.name}.png`,
          })),
        );

        return {
          id: team.id,
          updated: now,
          splinter: team.summoner.splinter,
          summoner: team.summoner.name,
          monsterCount: team.monsters.length,
          mana,
          battles: team.battles,
          winpc: team.wins / team.battles,
          elementIcon: `https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-${team.summoner.splinter.toLowerCase()}-2.svg`,
          summonerIcon: `https://d36mxiodymuqjm.cloudfront.net/card_art/${team.summoner.name}.png`,
          monsters,
        };
      })
      .value();
  }
}
