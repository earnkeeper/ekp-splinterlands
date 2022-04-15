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
      id: PATH,
      element: uielement(),
    });
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    if (PATH !== event?.state?.client?.path) {
      return;
    }

    await this.clientService.emitBusy(event, COLLECTION_NAME);

    const cardId = event.state?.client?.queryParams?.card;
    const leagueGroup = event.state?.client?.queryParams?.leagueGroup;

    const teamId = event.state?.client?.queryParams?.team;
    const mana = Number(event.state?.client?.queryParams?.mana);

    let documents: BattleDocument[] = [];

    if (!!cardId) {
      documents = await this.battlesService.getBattleDocumentsByCardId(
        cardId,
        leagueGroup,
        event.state?.client.subscribed ? 1000 : 50,
      );
    }

    if (!!teamId && !isNaN(mana)) {
      documents = await this.battlesService.getBattleDocumentsByTeamIdAndMana(
        teamId,
        mana,
        event.state?.client.subscribed ? 1000 : 50,
      );
    }

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
