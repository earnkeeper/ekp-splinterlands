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
  switchCase,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import {
  EDITION_IMAGE_MAP,
  FOIL_IMAGE_MAP,
  imageLabelCell,
  MANA_IMAGE,
  RARITY_IMAGE_MAP,
  ROLE_IMAGE_MAP,
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
      {
        id: 'level',
        width: '60px',
      },
      {
        id: 'edition',
        cell: imageLabelCell(
          switchCase('$.edition', EDITION_IMAGE_MAP),
          '$.edition',
        ),
      },
      {
        id: 'foil',
        cell: imageLabelCell(switchCase('$.foil', FOIL_IMAGE_MAP), '$.foil'),
      },
      {
        id: 'rarity',
        sortable: true,
        cell: imageLabelCell(
          switchCase('$.rarity', RARITY_IMAGE_MAP),
          '$.rarity',
        ),
      },
      {
        id: 'mana',
        sortable: true,
        cell: imageLabelCell(MANA_IMAGE, '$.mana'),
        width: '80px',
      },
      {
        id: 'splinter',
        sortable: true,
        cell: imageLabelCell(
          switchCase('$.splinter', SPLINTER_IMAGE_MAP),
          '$.splinter',
        ),
      },
      {
        id: 'role',
        cell: imageLabelCell(switchCase('$.role', ROLE_IMAGE_MAP), '$.role'),
      },
    ],
  });
}
