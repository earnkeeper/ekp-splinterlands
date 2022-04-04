import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  collection,
  CurrencyDto,
  RpcEvent,
} from '@earnkeeper/ekp-sdk';
import {
  AbstractController,
  ClientService,
  CoingeckoService,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { MapperService } from '../../shared/game';
import { EnhancedSale, MarketplaceService } from './marketplace.service';
import { ListingDocument } from './ui/listing.document';
import marketplace from './ui/marketplace.uielement';

const COLLECTION_NAME = collection(ListingDocument);
const PATH = 'marketplace';

@Injectable()
export class MarketplaceController extends AbstractController {
  constructor(
    clientService: ClientService,
    private marketplaceService: MarketplaceService,
    private coingeckoService: CoingeckoService,
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
    let conversionRate = 1;

    if (currency.id !== 'usd') {
      const prices = await this.coingeckoService.latestPricesOf(
        ['usd-coin'],
        currency.id,
      );

      conversionRate = prices[0].price;
    }

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

    await this.clientService.emitBusy(event, COLLECTION_NAME);

    const enhancedSales = await this.marketplaceService.getEnhancedSales(
      'earnkeeper',
    );

    const documents = await this.mapListingDocuments(
      enhancedSales,
      event,
      currency,
      conversionRate,
    );

    await this.clientService.emitDocuments(event, COLLECTION_NAME, documents);

    await this.clientService.removeOldLayers(event, COLLECTION_NAME);

    await this.clientService.emitDone(event, COLLECTION_NAME);
  }

  async onClientRpc(event: RpcEvent) {
    // Do nothing
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }

  async mapListingDocuments(
    sales: EnhancedSale[],
    clientEvent: ClientStateChangedEvent,
    currency: CurrencyDto,
    conversionRate: number,
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

        const document = new ListingDocument({
          // TODO: fiatSymbol: clientEvent.state.client.selectedCurrency.symbol,
          battles,
          burned: Number(sale.distribution.num_burned),
          editionString,
          elementString,
          fiatSymbol: currency.symbol,
          gold: sale.gold,
          id: `${sale.card_detail_id}-${sale.gold}-${sale.edition}`,
          imageSmall,
          imageTile,
          level: sale.level,
          name: sale.cardDetail.name,
          playerOwned: !!sale.playerCard ? 'Yes' : 'No',
          price: sale.low_price * conversionRate,
          printed: Number(sale.distribution.num_cards),
          qty: sale.qty,
          rarity: MapperService.mapRarityNumberToString(sale.cardDetail.rarity),
          splinterLandsUrl: '#',
          updated: nowMoment.unix(),
          winPc: !!battles ? (wins * 100) / battles : undefined,
        });

        return document;
      })
      .filter((sale) => !!sale)
      .value();
  }
}
