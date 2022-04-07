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
import { CollectionForm, DEFAULT_COLLECTION_FORM } from '../../util';
import { CollectionService } from './collection.service';
import { CollectionDocument } from './ui/collection.document';
import page from './ui/collection.uielement';

const COLLECTION_NAME = collection(CollectionDocument);
const PATH = 'cards';

@Injectable()
export class CollectionController extends AbstractController {
  constructor(
    clientService: ClientService,
    private collectionService: CollectionService,
    private apmService: ApmService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitMenu(event, {
      id: PATH,
      title: 'Card Collection',
      navLink: PATH,
      icon: 'cil-color-palette',
    });

    await this.clientService.emitPage(event, {
      id: PATH,
      element: page(),
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
      const form: CollectionForm =
        event.state.forms?.collection ?? DEFAULT_COLLECTION_FORM;

      const currency = event.state.client.selectedCurrency;

      const documents = await this.collectionService.getCollectionDocuments(
        form,
        currency,
      );

      this.clientService.emitDocuments(event, COLLECTION_NAME, documents);
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
