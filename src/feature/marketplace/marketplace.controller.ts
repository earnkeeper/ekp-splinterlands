import {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  ClientStateChangedEvent,
  collection,
  filterPath,
} from '@earnkeeper/ekp-sdk';
import {
  AbstractController,
  ClientService,
  logger,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { ApiService, CardDetailDto, ForSaleGroupedDto } from '../../shared/api';
import { Card } from '../../shared/db';
import { CardRepository } from '../../shared/db/card/card.repository';
import { MapperService } from '../../shared/game';
import { MarketplaceListingDocument } from './ui/marketplace-listing.document';
import marketplace from './ui/marketplace.uielement';

const FILTER_PATH = `/plugin/${process.env.EKP_PLUGIN_ID}/marketplace`;
const COLLECTION_NAME = collection(MarketplaceListingDocument);

@Injectable()
export class MarketplaceController extends AbstractController {
  constructor(
    clientService: ClientService,
    private apiService: ApiService,
    private cardRepository: CardRepository,
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

    const sales = await this.apiService.fetchCardSales();

    const cardDetails = await this.apiService.fetchCardDetails();

    const cardDetailsMap = _.keyBy(cardDetails, 'id');

    const cards = await this.cardRepository.findAll();

    const cardsMap = _.keyBy(cards, 'id');

    await Promise.all(
      sales.map(async (sale) => {
        const document = await this.mapListingDocument(
          event,
          sale,
          cardDetailsMap,
          cardsMap,
        );

        if (!!document) {
          await this.clientService.emitPartialDocuments(
            event,
            COLLECTION_NAME,
            [document],
          );
        }
      }),
    );

    await this.clientService.removeOldLayers(event, COLLECTION_NAME);

    await this.clientService.emitDone(event, COLLECTION_NAME);
  }

  async onClientDisconnected(event: ClientDisconnectedEvent) {
    // Do nothing
  }

  async mapListingDocument(
    clientEvent: ClientStateChangedEvent,
    sale: ForSaleGroupedDto,
    cardDetailsMap: Record<number, CardDetailDto>,
    cardsMap: Record<number, Card>,
  ) {
    const nowMoment = moment.unix(clientEvent.received);

    const cardDetail = cardDetailsMap[sale.card_detail_id];

    if (!cardDetail) {
      logger.warn('Could not find card detail for id: ' + sale.card_detail_id);
      return undefined;
    }

    const distribution = cardDetail.distribution.find(
      (it) => it.gold === sale.gold && it.edition === sale.edition,
    );

    if (!distribution) {
      logger.warn('Could not find distribution for id: ' + sale.card_detail_id);
      return undefined;
    }

    const editionString = MapperService.mapEditionString(sale.edition);
    const elementString = MapperService.mapColorToSplinter(cardDetail.color);

    const card = cardsMap[sale.card_detail_id];

    let battles: number;
    let wins: number;

    if (card) {
      battles = _.chain(card.dailyStats).values().sumBy('battles').value();
      wins = _.chain(card.dailyStats).values().sumBy('wins').value();
    }

    const document = new MarketplaceListingDocument({
      battles,
      winPc: !!battles ? wins / battles : undefined,
      burned: Number(distribution.num_burned),
      // fiatSymbol: clientEvent.state.client.selectedCurrency.symbol,
      fiatSymbol: '$',
      id: `${sale.card_detail_id}-${sale.gold}-${sale.edition}`,
      editionString,
      elementString,
      gold: sale.gold,
      imageSmall: `https://d36mxiodymuqjm.cloudfront.net/card_art/${cardDetail.name}.png`,
      imageTile: `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/${editionString.toLowerCase()}/${
        cardDetail.name
      }_lv${sale.level}.png`,
      level: sale.level,
      name: cardDetail.name,
      price: sale.low_price,
      printed: Number(distribution.num_cards),
      qty: sale.qty,
      rarity: MapperService.mapRarityNumberToString(cardDetail.rarity),
      splinterLandsUrl: '#',
      updated: nowMoment.unix(),
    });

    return document;
  }
}
