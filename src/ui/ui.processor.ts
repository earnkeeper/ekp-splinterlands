import { ClientStateChangedEvent } from '@earnkeeper/ekp-sdk';
import { ClientService, logger, LayerDto } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import menus from './menus';
import pages from './pages';
@Injectable()
export class UiProcessor {
  constructor(private clientService: ClientService) {
    this.clientService.clientStateEvents$.subscribe(
      (event: ClientStateChangedEvent) =>
        this.handleClientStateChangedEvent(event),
    );
  }

  async handleClientStateChangedEvent(event: ClientStateChangedEvent) {
    const { clientId } = event;

    logger.log(`Processing UI_QUEUE for ${clientId}`);

    const layers = <LayerDto[]>[
      {
        id: `${process.env.EKP_PLUGIN_ID}-menu-layer`,
        collectionName: 'menus',
        set: menus(),
      },
      {
        id: `${process.env.EKP_PLUGIN_ID}-pages-layer`,
        collectionName: 'pages',
        set: pages(),
      },
    ];

    this.clientService.addLayers(clientId, layers);
  }
}
