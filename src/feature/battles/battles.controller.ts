import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  collection,
  RpcEvent,
} from '@earnkeeper/ekp-sdk';
import { AbstractController, ClientService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { BattlesService } from './battles.service';
import { BattleDocument } from './ui/battle.document';
import uielement from './ui/battles.uielement';

const COLLECTION_NAME = collection(BattleDocument);
const PATH = 'battles';

@Injectable()
export class BattlesController extends AbstractController {
  constructor(
    clientService: ClientService,
    private battlesService: BattlesService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitPage(event, {
      id: `${PATH}/byCard/:cardId`,
      element: uielement(),
    });
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    const path = event?.state?.client?.path;

    if (!path?.startsWith(`${PATH}/byCard/`)) {
      return;
    }

    const cardId = path.replace(`${PATH}/byCard/`, '');

    const documents = await this.battlesService.getBattleDocuments(cardId);

    await this.clientService.emitDocuments(event, COLLECTION_NAME, documents);

    await this.clientService.emitDone(event, COLLECTION_NAME);
  }

  async onClientRpc(event: RpcEvent) {
    // Do nothing
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }
}
