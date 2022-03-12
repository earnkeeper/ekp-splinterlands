import { ClientStateChangedEvent } from '@earnkeeper/ekp-sdk';
import { ClientService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import marketplace from '../marketplace/marketplace.uielement';
import teamguide from '../../feature/team-guide/ui/team-guide.uielement';

const MENUS = [
  {
    id: `${process.env.EKP_PLUGIN_ID}`,
    title: 'Marketplace',
    navLink: `${process.env.EKP_PLUGIN_ID}/marketplace`,
    icon: 'cil-cart',
  },
  {
    id: `${process.env.EKP_PLUGIN_ID}`,
    title: 'Team Guide',
    navLink: `${process.env.EKP_PLUGIN_ID}/team-guide`,
    icon: 'cil-people',
  },
];

const PAGES = [
  {
    id: `${process.env.EKP_PLUGIN_ID}/marketplace`,
    element: marketplace(),
  },
  {
    id: `${process.env.EKP_PLUGIN_ID}/team-guide`,
    element: teamguide(),
  },
];

@Injectable()
export class UiHandler {
  constructor(private clientService: ClientService) {
    this.clientService.clientStateEvents$.subscribe(
      (event: ClientStateChangedEvent) =>
        this.handleClientStateChangedEvent(event),
    );
  }

  async handleClientStateChangedEvent(event: ClientStateChangedEvent) {
    const { clientId } = event;

    this.clientService.addLayers(clientId, [
      {
        id: `${process.env.EKP_PLUGIN_ID}-menu-layer`,
        collectionName: 'menus',
        set: MENUS,
      },
      {
        id: `${process.env.EKP_PLUGIN_ID}-pages-layer`,
        collectionName: 'pages',
        set: PAGES,
      },
    ]);
  }
}
