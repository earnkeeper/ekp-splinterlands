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
import { DEFAULT_LEADERBOARD_FORM, LeaderboardForm } from '../../util';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardDocument } from './ui/leaderboard.document';
import leaderboard from './ui/leaderboard.uielement';

const COLLECTION_NAME = collection(LeaderboardDocument);
const PATH = 'leaderboard';

@Injectable()
export class LeaderboardController extends AbstractController {
  constructor(
    clientService: ClientService,
    private leaderboardService: LeaderboardService,
    private apmService: ApmService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitMenu(event, {
      id: PATH,
      title: 'Leaderboard',
      navLink: PATH,
      icon: 'award',
    });

    await this.clientService.emitPage(event, {
      id: PATH,
      element: leaderboard(),
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
      const form: LeaderboardForm =
        event.state.forms?.leaderboard ?? DEFAULT_LEADERBOARD_FORM;

      const leaderboardDocuments =
        await this.leaderboardService.getLeaderDocuments(
          form,
          event.state.client.selectedCurrency,
        );

      this.clientService.emitDocuments(
        event,
        COLLECTION_NAME,
        leaderboardDocuments,
      );
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
