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
import { PlayerHistoryForm } from 'src/util/forms/player-history-form';
  import { DEFAULT_LEADERBOARD_FORM} from '../../util';
  import { PlayerhistoryService } from './playerhistory.service';
  import { PlayerhistoryDocument } from './ui/playerhistory.document';
  import Playerhistory from './ui/playerhistory.uielement';
  
  const COLLECTION_NAME = collection(PlayerhistoryDocument);
  const PATH = 'playerhistory';
  
  @Injectable()
  export class PlayerHistoryController extends AbstractController {
    constructor(
      clientService: ClientService,
      private PlayerhistoryService: PlayerhistoryService,
      private apmService: ApmService,
    ) {
      super(clientService);
    }
  
    async onClientConnected(event: ClientConnectedEvent) {
      await this.clientService.emitMenu(event, {
        id: PATH,
        title: 'Player History',
        navLink: PATH,
        icon: 'award',
      });
  
      await this.clientService.emitPage(event, {
        id: PATH,
        element: Playerhistory(),
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
        const form: PlayerHistoryForm =
          event.state.forms?.leaderboard ?? DEFAULT_LEADERBOARD_FORM;
  
        const PlayerhistoryDocuments =
          await this.PlayerhistoryService.getPlayerHistoryDocuments(
            form,
            event.state.client.selectedCurrency,
          );
  
        this.clientService.emitDocuments(
          event,
          COLLECTION_NAME,
          PlayerhistoryDocuments,
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
  