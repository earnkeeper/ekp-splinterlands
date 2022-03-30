import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  collection,
} from '@earnkeeper/ekp-sdk';
import { AbstractController, ClientService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { DeckDocument } from './ui/deck.document';
import decks from './ui/decks.uielement';

const COLLECTION_NAME = collection(DeckDocument);

@Injectable()
export class DecksController extends AbstractController {
  constructor(clientService: ClientService) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitMenu(event, {
      id: `decks`,
      title: 'Fantasy Decks',
      navLink: `decks`,
      icon: 'cil-casino',
    });

    await this.clientService.emitPage(event, {
      id: `decks`,
      element: decks(),
    });
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    // TODO: Do nothing for now, building the UI first
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }
}
