import {
  Col,
  collection,
  Container,
  Datatable,
  documents,
  formatTemplate,
  Image,
  isBusy,
  navigate,
  PageHeaderTile,
  Row,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import {
  EDITION_COLUMN,
  EDITION_IMAGE_MAP,
  FOIL_COLUMN,
  FOIL_IMAGE_MAP,
  LEVEL_COLUMN,
  MANA_COLUMN,
  POWER_COLUMN,
  RARITY_COLUMN,
  RARITY_IMAGE_MAP,
  ROLE_COLUMN,
  ROLE_IMAGE_MAP,
  SPLINTER_COLUMN,
  SPLINTER_IMAGE_MAP,
} from '../../../util';
import { CardDocument } from './cards.document';

export default function element(): UiElement {
  return Container({
    children: [
      Row({
        className: 'mb-2',
        children: [
          Col({
            className: 'col-auto',
            children: [
              PageHeaderTile({
                title: 'Card Browser',
                icon: 'search',
              }),
            ],
          }),
        ],
      }),
      Span({
        content:
          'Use the table below to take a detailed look at all cards, editions, levels and foils. Click a row to open the splinterlands stats page in a new tab.',
      }),
      historyRow(),
    ],
  });
}

function historyRow(): UiElement {
  return Datatable({
    defaultSortFieldId: 'marketPrice',
    defaultSortAsc: false,
    data: documents(CardDocument),
    busyWhen: isBusy(collection(CardDocument)),
    onRowClicked: navigate(
      formatTemplate(
        'https://splinterlands.com/?p=card_details&id={{ templateId }}&gold={{ gold }}&edition={{ editionNumber }}&tab=stats',
        {
          templateId: '$.cardDetailId',
          gold: '$.gold',
          editionNumber: '$.editionNumber',
        },
      ),
      true,
      true,
    ),
    filters: [
      {
        columnId: 'edition',
        type: 'checkbox',
        imageMap: EDITION_IMAGE_MAP,
      },
      {
        columnId: 'foil',
        type: 'checkbox',
        imageMap: FOIL_IMAGE_MAP,
      },
      {
        columnId: 'role',
        type: 'checkbox',
        imageMap: ROLE_IMAGE_MAP,
      },
      {
        columnId: 'rarity',
        type: 'checkbox',
        imageMap: RARITY_IMAGE_MAP,
      },
      {
        columnId: 'splinter',
        type: 'checkbox',
        imageMap: SPLINTER_IMAGE_MAP,
      },
      {
        columnId: 'level',
        type: 'checkbox',
      },
      {
        columnId: 'cardDetailId',
        type: 'radio',
        allowCustomOption: true,
        options: [
          {
            label: 'All',
          },
        ],
      },
    ],
    columns: [
      {
        id: 'cardDetailId',
        title: 'Id',
        width: '60px',
      },
      {
        id: 'cardArtUrl',
        title: '',
        width: '48px',
        cell: Image({
          src: '$.cardArtUrl',
          size: 32,
          rounded: true,
        }),
      },
      {
        id: 'name',
        searchable: true,
        sortable: true,
        minWidth: '160px',
      },
      LEVEL_COLUMN,
      EDITION_COLUMN,
      FOIL_COLUMN,
      RARITY_COLUMN,
      MANA_COLUMN,
      SPLINTER_COLUMN,
      ROLE_COLUMN,
      {
        id: 'xp',
        title: 'BCX',
        sortable: true,
      },
      POWER_COLUMN,
    ],
  });
}
