import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  collection,
  filterPath,
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
import { TeamGuideService, ViableTeam } from './team-guide.service';
import { TeamGuideViewBag } from './ui/team-guide-view-bag.document';
import { TeamGuideDocument } from './ui/team-guide.document';
import teamguide from './ui/team-guide.uielement';

const COLLECTION_NAME = collection(TeamGuideDocument);
const FILTER_PATH = `/plugin/${process.env.EKP_PLUGIN_ID}/team-guide`;

@Injectable()
export class TeamGuideController extends AbstractController {
  constructor(
    clientService: ClientService,
    private apmService: ApmService,
    private teamGuideService: TeamGuideService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitMenu(event, {
      id: `splinterlands-menu-team-guide`,
      title: 'Team Guide',
      navLink: `splinterlands/team-guide`,
      icon: 'cil-people',
    });

    await this.clientService.emitPage(event, {
      id: `splinterlands/team-guide`,
      element: teamguide(),
    });
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    if (!filterPath(event, FILTER_PATH)) {
      return;
    }

    await this.clientService.emitBusy(event, COLLECTION_NAME);

    try {
      const form = event.state.forms?.splinterlandsTeamGuide;

      if (!form) {
        return;
      }

      const manaCap = Number(form.manaCap);
      const playerName = form.playerName;
      const ruleset = form.ruleset;

      if (isNaN(manaCap) || !playerName || !ruleset) {
        return;
      }

      const { teams, battles } = await this.teamGuideService.getViableTeams(
        playerName,
        manaCap,
        ruleset,
      );

      const teamSummaryDocuments = this.mapDocuments(teams);

      await this.clientService.emitDocuments(
        event,
        COLLECTION_NAME,
        teamSummaryDocuments,
      );

      const viewBag = new TeamGuideViewBag({
        id: 'viewbag',
        battleCount: battles.length,
        firstBattleTimestamp: _.chain(battles)
          .map((battle) => battle.timestamp)
          .min()
          .value(),
      });

      await this.clientService.emitDocuments(
        event,
        collection(TeamGuideViewBag),
        [viewBag],
      );
    } catch (error) {
      this.apmService.captureError(error);
      logger.error('Error occurred while handling team guide event', error);
      console.error(error);
    } finally {
      await this.clientService.emitDone(event, COLLECTION_NAME);
    }
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }

  mapDocuments(detailedTeams: ViableTeam[]): TeamGuideDocument[] {
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
