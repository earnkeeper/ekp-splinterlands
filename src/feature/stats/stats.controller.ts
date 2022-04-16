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
import { StatsService } from './stats.service';
import { BattlesByLeagueDocument } from './ui/battles-by-league.document';
import { BattlesByManaCapDocument } from './ui/battles-by-mana-cap.document';
import { BattlesByTimestampDocument } from './ui/battles-by-timestamp.document';
import { StatsViewBagDocument } from './ui/stats-view-bag.document';
import page from './ui/stats.uielement';

const PATH = 'stats';

@Injectable()
export class StatsController extends AbstractController {
  constructor(
    clientService: ClientService,
    private statsService: StatsService,
    private apmService: ApmService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitMenu(event, {
      id: PATH,
      title: 'Db Stats',
      navLink: PATH,
      icon: 'cil-chart',
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

    try {
      await Promise.all([
        this.fetchAndEmitByLeague(event),
        this.fetchAndEmitByTimestamp(event),
        this.fetchAndEmitByManaCap(event),
        this.fetchAndEmitViewBag(event),
      ]);
    } catch (error) {
      this.apmService.captureError(error);
      logger.error('Error occurred while handling event', error);
      console.error(error);
    } finally {
      await this.clientService.emitDone(
        event,
        collection(BattlesByLeagueDocument),
      );
      await this.clientService.emitDone(
        event,
        collection(BattlesByTimestampDocument),
      );
      await this.clientService.emitDone(
        event,
        collection(BattlesByManaCapDocument),
      );
      await this.clientService.emitDone(
        event,
        collection(StatsViewBagDocument),
      );
    }
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }

  private async fetchAndEmitByLeague(event: ClientStateChangedEvent) {
    await this.clientService.emitBusy(
      event,
      collection(BattlesByLeagueDocument),
    );

    const documents = await this.statsService.getBattlesByLeague();

    if (!documents?.length) {
      return;
    }

    await this.clientService.emitDocuments(
      event,
      collection(BattlesByLeagueDocument),
      documents,
    );
  }

  private async fetchAndEmitByTimestamp(event: ClientStateChangedEvent) {
    await this.clientService.emitBusy(
      event,
      collection(BattlesByTimestampDocument),
    );

    const documents = await this.statsService.getBattlesByTimestamp();

    if (!documents?.length) {
      return;
    }

    await this.clientService.emitDocuments(
      event,
      collection(BattlesByTimestampDocument),
      documents,
    );
  }

  private async fetchAndEmitByManaCap(event: ClientStateChangedEvent) {
    await this.clientService.emitBusy(
      event,
      collection(BattlesByManaCapDocument),
    );

    const documents = await this.statsService.getBattlesByManaCap();

    if (!documents?.length) {
      return;
    }

    await this.clientService.emitDocuments(
      event,
      collection(BattlesByManaCapDocument),
      documents,
    );
  }

  private async fetchAndEmitViewBag(event: ClientStateChangedEvent) {
    await this.clientService.emitBusy(event, collection(StatsViewBagDocument));

    const document = await this.statsService.getViewBag();

    if (!document) {
      return;
    }

    await this.clientService.emitDocuments(
      event,
      collection(StatsViewBagDocument),
      [document],
    );
  }
}
