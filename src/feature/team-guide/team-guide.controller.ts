import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  collection,
  filterPath,
} from '@earnkeeper/ekp-sdk';
import { AbstractController, ClientService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { TeamGuideService, ViableTeam } from './team-guide.service';
import teamguide from './ui/team-guide.uielement';
import { TeamSummaryDocument } from './ui/team-summary.document';

const COLLECTION_NAME = collection(TeamSummaryDocument);
const FILTER_PATH = `/plugin/${process.env.EKP_PLUGIN_ID}/team-guide`;

@Injectable()
export class TeamGuideController extends AbstractController {
  constructor(
    clientService: ClientService,
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

    const manaCap = 12;
    const playerName = 'earnkeeper';
    const ruleset = 'Standard';

    const teams = await this.teamGuideService.getViableTeams(
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

    await this.clientService.emitDone(event, COLLECTION_NAME);
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }

  mapDocuments(detailedTeams: ViableTeam[]): TeamSummaryDocument[] {
    const now = moment().unix();

    return _.chain(detailedTeams)
      .map((team) => {
        const mana = team.summoner.mana + _.sumBy(team.monsters, 'mana');

        return {
          id: team.id,
          updated: now,
          splinter: team.summoner.splinter,
          summoner: team.summoner.name,
          monsters: team.monsters.length,
          mana,
          battles: team.battles,
          winpc: team.wins / team.battles,
        };
      })
      .value();
  }
}
