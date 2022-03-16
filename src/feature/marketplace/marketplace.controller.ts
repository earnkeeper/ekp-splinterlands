import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  collection,
  filterPath,
} from '@earnkeeper/ekp-sdk';
import { AbstractController, ClientService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { MapperService } from '../../shared/game';
import { EnhancedSale, MarketplaceService } from './marketplace.service';
import { MarketplaceListingDocument } from './ui/marketplace-listing.document';
import marketplace from './ui/marketplace.uielement';

const FILTER_PATH = `/plugin/${process.env.EKP_PLUGIN_ID}/marketplace`;
const COLLECTION_NAME = collection(MarketplaceListingDocument);

@Injectable()
export class MarketplaceController extends AbstractController {
  constructor(
    clientService: ClientService,
    private marketplaceService: MarketplaceService,
  ) {
    super(clientService);
  }

  async onClientConnected(event: ClientConnectedEvent) {
    await this.clientService.emitMenu(event, {
      id: `splinterlands-menu-marketplace`,
      title: 'Marketplace',
      navLink: `splinterlands/marketplace`,
      icon: 'cil-cart',
    });

    await this.clientService.emitPage(event, {
      id: `${process.env.EKP_PLUGIN_ID}/marketplace`,
      element: marketplace(),
    });
  }

  async onClientStateChanged(event: ClientStateChangedEvent) {
    if (!filterPath(event, FILTER_PATH)) {
      return;
    }

    await this.clientService.emitBusy(event, COLLECTION_NAME);

    const enhancedSales = await this.marketplaceService.getEnhancedSales(
      'earnkeeper',
    );

    const documents = this.mapListingDocuments(enhancedSales, event);

    await this.clientService.emitDocuments(event, COLLECTION_NAME, documents);

    await this.clientService.removeOldLayers(event, COLLECTION_NAME);

    await this.clientService.emitDone(event, COLLECTION_NAME);
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }

  mapListingDocuments(
    sales: EnhancedSale[],
    clientEvent: ClientStateChangedEvent,
  ) {
    const nowMoment = moment.unix(clientEvent.received);

    return _.chain(sales)
      .map((sale) => {
        const editionString = MapperService.mapEditionString(sale.edition);
        const elementString = MapperService.mapColorToSplinter(
          sale.cardDetail.color,
        );

        let battles: number;
        let wins: number;

        if (sale.stats) {
          battles = sale.stats.battles;
          wins = sale.stats.wins;
        }

        const imageSmall = `https://d36mxiodymuqjm.cloudfront.net/card_art/${sale.cardDetail.name}.png`;

        const imageTile = `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/${editionString.toLowerCase()}/${
          sale.cardDetail.name
        }_lv${sale.level}.png`;

        const document = new MarketplaceListingDocument({
          // fiatSymbol: clientEvent.state.client.selectedCurrency.symbol,
          battles,
          burned: Number(sale.distribution.num_burned),
          editionString,
          elementString,
          fiatSymbol: '$',
          gold: sale.gold,
          id: `${sale.card_detail_id}-${sale.gold}-${sale.edition}`,
          imageSmall,
          imageTile,
          level: sale.level,
          name: sale.cardDetail.name,
          playerOwned: !!sale.playerCard ? 'Yes' : 'No',
          price: sale.low_price,
          printed: Number(sale.distribution.num_cards),
          qty: sale.qty,
          rarity: MapperService.mapRarityNumberToString(sale.cardDetail.rarity),
          splinterLandsUrl: '#',
          updated: nowMoment.unix(),
          winPc: !!battles ? wins / battles : undefined,
        });

        return document;
      })
      .filter((sale) => !!sale)
      .value();
  }
}
