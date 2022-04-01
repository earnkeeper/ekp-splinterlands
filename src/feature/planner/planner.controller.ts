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
import { GameService } from '../../shared/game';
import { PlannerService } from './planner.service';
import { PlannerViewBag } from './ui/planner-view-bag.document';
import { PlannerDocument } from './ui/planner.document';
import planner from './ui/planner.uielement';

const COLLECTION_NAME = collection(PlannerDocument);
const PATH = 'planner';

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
      id: PATH,
      title: 'Battle Planner',
      navLink: PATH,
      icon: 'cil-paw',
    });

    await this.clientService.emitPage(event, {
      id: PATH,
      element: planner(),
    });
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    if (PATH !== event?.state?.client?.path) {
      return;
    }

    await this.clientService.emitBusy(event, COLLECTION_NAME);

    try {
      const form = event.state.forms?.planner;

      if (!form) {
        return;
      }

      const { plannerDocuments, battles } =
        await this.plannerService.getPlannerDocuments(
          form,
          event.state.client.subscribed,
        );

      await this.clientService.emitDocuments(
        event,
        COLLECTION_NAME,
        plannerDocuments,
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
}
