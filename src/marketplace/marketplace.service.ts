import {
  ClientStateChangedEvent,
  collection,
  DocumentDto,
} from '@earnkeeper/ekp-sdk';
import {
  AssetEventDto,
  ClientService,
  LayerDto,
  logger,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import moment from 'moment';
import { filter } from 'rxjs';
import { CardDetailDto, ForSaleGroupedDto } from 'src/api/dto';
import { NftMetadataDto } from 'src/metadata';
import { SplinterlandsApiService } from '../api/splinterlands-api.service';
import { MetadataService } from '../metadata/metadata.service';
import { MarketplaceListingDocument } from './marketplace-listing.document';

const FILTER_PATH = `/plugin/${process.env.EKP_PLUGIN_ID}/marketplace`;
const COLLECTION_NAME = collection(MarketplaceListingDocument);

function filterPath(event: ClientStateChangedEvent, path: string) {
  return event.state?.client?.path === path;
}

@Injectable()
export class MarketplaceService {
  constructor(
    private clientService: ClientService,
    private metadataService: MetadataService,
    private splinterlandsApiService: SplinterlandsApiService,
  ) {
    this.clientService.clientStateEvents$
      .pipe(filter((event) => filterPath(event, FILTER_PATH)))
      .subscribe((event) => {
        this.handleClientStateEvent(event);
      });
  }

  async handleClientStateEvent(
    clientStateChangedEvent: ClientStateChangedEvent,
  ) {
    await this.emitBusy(clientStateChangedEvent, COLLECTION_NAME);

    const sales = await this.splinterlandsApiService.fetchCardSales();

    const cardDetails = await this.splinterlandsApiService.fetchCardDetails();

    await Promise.all(
      sales.map(async (sale) => {
        const document = await this.mapListingDocument(
          clientStateChangedEvent,
          sale,
          cardDetails,
        );

        if (!!document) {
          await this.emitDocuments(clientStateChangedEvent, COLLECTION_NAME, [
            document,
          ]);
        }
      }),
    );

    await this.removeOldLayers(clientStateChangedEvent, COLLECTION_NAME);

    await this.emitDone(clientStateChangedEvent, COLLECTION_NAME);
  }

  async fetchMetadata(listing: AssetEventDto): Promise<NftMetadataDto> {
    const metadata = await this.metadataService.fetchMetadata(
      listing.asset.token_metadata,
    );

    return new NftMetadataDto(metadata);
  }

  mapRarity(rarity: number): string {
    switch (rarity) {
      case 1:
        return 'Common';
      case 2:
        return 'Rare';
      case 3:
        return 'Epic';
      case 4:
        return 'Legendary';
      default:
        return 'Unknown';
    }
  }

  async mapListingDocument(
    clientEvent: ClientStateChangedEvent,
    sale: ForSaleGroupedDto,
    cardDetails: CardDetailDto[],
  ) {
    const nowMoment = moment.unix(clientEvent.received);

    const cardDetail = cardDetails.find((it) => it.id === sale.card_detail_id);

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

    const document = new MarketplaceListingDocument({
      burned: Number(distribution.num_burned),
      // fiatSymbol: clientEvent.state.client.selectedCurrency.symbol,
      fiatSymbol: '$',
      id: `${sale.card_detail_id}-${sale.gold}-${sale.edition}`,
      gold: sale.gold,
      imageSmall: `https://d36mxiodymuqjm.cloudfront.net/card_art/${cardDetail.name}.png`,
      imageTile: `https://d36mxiodymuqjm.cloudfront.net/card_art/${cardDetail.name}.png`,
      level: sale.level,
      name: cardDetail.name,
      price: sale.low_price,
      printed: Number(distribution.num_cards),
      qty: sale.qty,
      rarity: this.mapRarity(cardDetail.rarity),
      splinterLandsUrl: '#',
      updated: nowMoment.unix(),
    });

    return document;
  }

  async emitBusy(event: ClientStateChangedEvent, collectionName: string) {
    const addLayers = [
      {
        id: `busy-${collectionName}`,
        collectionName: 'busy',
        set: [{ id: collectionName }],
      },
    ];
    await this.clientService.addLayers(event.clientId, addLayers);
  }

  async emitDone(event: ClientStateChangedEvent, collectionName: string) {
    const removeQuery = {
      id: `busy-${collectionName}`,
    };

    await this.clientService.removeLayers(event.clientId, removeQuery);
  }

  async emitDocuments(
    clientEvent: ClientStateChangedEvent,
    collectionName: string,
    documents: DocumentDto[],
  ) {
    const addLayers: LayerDto[] = [
      {
        id: randomUUID(),
        collectionName,
        set: documents,
        tags: [collectionName],
        timestamp: moment().unix(),
      },
    ];
    await this.clientService.addLayers(clientEvent.clientId, addLayers);
  }

  async removeOldLayers(
    clientStateChangedEvent: ClientStateChangedEvent,
    collectionName: string,
  ) {
    await this.clientService.removeLayers(clientStateChangedEvent.clientId, {
      tags: [collectionName],
      timestamp: {
        lt: clientStateChangedEvent.received,
      },
    });
  }
}
