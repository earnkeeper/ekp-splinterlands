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
import { DEFAULT_PLANNER_FORM } from '../../util/constants';
import { DecksService } from './decks.service';
import { DeckDocument } from './ui/deck.document';
import decks from './ui/decks.uielement';

const COLLECTION_NAME = collection(DeckDocument);
const PATH = 'saved';
@Injectable()
export class DecksController extends AbstractController {
  constructor(
    clientService: ClientService,
    private decksService: DecksService,
    private apmService: ApmService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitMenu(event, {
      id: PATH,
      title: 'Saved Teams',
      navLink: PATH,
      icon: 'cil-casino',
    });

    await this.clientService.emitPage(event, {
      id: PATH,
      element: decks(),
    });
  }

  async onClientRpc(event: RpcEvent) {
    // Do nothing
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    if (PATH !== event?.state?.client?.path) {
      return;
    }

    await this.clientService.emitBusy(event, COLLECTION_NAME);

    try {
      const clientTeams = event.state?.forms?.savedTeams;

      if (!clientTeams) {
        return;
      }

      const form = event.state.forms?.planner ?? DEFAULT_PLANNER_FORM;

      const updatedTeams = await this.decksService.updateTeams(
        clientTeams,
        form,
        event.state.client.subscribed,
        event.state.client.selectedCurrency,
      );

      this.clientService.emitDocuments(event, COLLECTION_NAME, updatedTeams);
    } catch (error) {
      this.apmService.captureError(error);
      logger.error('Error occurred while handling event', error);
      console.error(error);
    } finally {
      await this.clientService.emitDone(event, COLLECTION_NAME);
    }
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }
}
