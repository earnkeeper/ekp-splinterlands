import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  collection,
  RpcEvent,
} from '@earnkeeper/ekp-sdk';
import { AbstractController, ClientService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { MarketService } from '../../shared/game';
import { MarketplaceForm } from '../../util';
import { DEFAULT_MARKETPLACE_FORM } from '../../util/constants';
import { MarketplaceService } from './marketplace.service';
import { ListingDocument } from './ui/listing.document';
import marketplace from './ui/marketplace.uielement';

const COLLECTION_NAME = collection(ListingDocument);
const PATH = 'marketplace';

@Injectable()
export class MarketplaceController extends AbstractController {
  constructor(
    clientService: ClientService,
    private marketplaceService: MarketplaceService,
    private marketService: MarketService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitMenu(event, {
      id: PATH,
      title: 'Marketplace',
      navLink: PATH,
      icon: 'cil-cart',
    });

    await this.clientService.emitPage(event, {
      id: PATH,
      element: marketplace(),
    });
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    const currency = event.state.client.selectedCurrency;

    const conversionRate = await this.marketService.getConversionRate(
      'usd-coin',
      currency.id,
    );

    await this.clientService.emitPage(event, {
      id: PATH,
      element: marketplace(currency.symbol, [
        10 * conversionRate,
        100 * conversionRate,
        500 * conversionRate,
      ]),
    });

    if (PATH !== event?.state?.client?.path) {
      return;
    }

    const marketplaceForm: MarketplaceForm =
      event.state.forms?.marketplace ?? DEFAULT_MARKETPLACE_FORM;

    const favouritesForm = event.state.forms['marketplace-favourites'] ?? {};

    await this.clientService.emitBusy(event, COLLECTION_NAME);

    const listingDocuments = await this.marketplaceService.getListingDocuments(
      currency,
      conversionRate,
      marketplaceForm.leagueName ?? DEFAULT_MARKETPLACE_FORM.leagueName,
      favouritesForm
    );

    await this.clientService.emitDocuments(
      event,
      COLLECTION_NAME,
      listingDocuments,
    );

    await this.clientService.removeOldLayers(event, COLLECTION_NAME);

    await this.clientService.emitDone(event, COLLECTION_NAME);
  }

  async onClientRpc(event: RpcEvent) {
    // Do nothing
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }
}
