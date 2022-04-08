import {
  Button,
  Col,
  collection,
  Container,
  documents,
  Form,
  formatCurrency,
  GridTile,
  Image,
  Input,
  isBusy,
  PageHeaderTile,
  path,
  Row,
  Span,
  sum,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import {
  DEFAULT_COLLECTION_FORM,
  EDITION_IMAGE_MAP,
  FOIL_IMAGE_MAP,
  RARITY_IMAGE_MAP,
  ROLE_IMAGE_MAP,
  SPLINTER_IMAGE_MAP,
  statsCard,
} from '../../../util';
import { Datatable } from '../../../util/ekp/datatable';
import { CollectionDocument } from './collection.document';

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
                title: 'Card Collection',
                icon: 'cil-color-palette',
              }),
            ],
          }),
        ],
      }),
      Span({
        className: 'd-block mt-1 mb-2 font-small-3',
        content: 'Enter a player name to view their card collection.',
      }),
      formRow(),
      statsRow(),
      historyRow(),
    ],
  });
}

function statsRow() {
  return Row({
    children: [
      Col({
        className: 'col-auto',
        children: [
          statsCard(
            'Market Value',
            formatCurrency(
              sum(`${path(CollectionDocument)}.*.marketPrice`),
              `${path(CollectionDocument)}.0.fiatSymbol`,
            ),
          ),
        ],
      }),
    ],
  });
}

function formRow(): UiElement {
  return Form({
    name: 'collection',
    schema: {
      type: 'object',
      properties: {
        playerName: 'string',
      },
      default: DEFAULT_COLLECTION_FORM,
    },
    children: [
      Row({
        className: 'mb-1',
        children: [
          Col({
            className: 'col-12 col-md-auto',
            children: [
              Input({
                label: 'Player Name',
                name: 'playerName',
              }),
            ],
          }),
          Col({
            className: 'col-12 col-md-auto my-auto',
            children: [
              Button({
                label: 'View',
                isSubmit: true,
                busyWhen: isBusy(collection(CollectionDocument)),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function historyRow(): UiElement {
  return Datatable({
    defaultSortFieldId: 'marketPrice',
    defaultSortAsc: false,
    defaultView: {
      xs: 'grid',
      lg: 'column',
    },
    data: documents(CollectionDocument),
    busyWhen: isBusy(collection(CollectionDocument)),
    gridView: {
      tileWidth: [12, 6, 4, 3],
      tile: GridTile({
        image: Image({
          className: 'card-img-top',
          src: '$.cardByLevelUrl',
        }),
        details: [
          {
            label: 'Value',
            value: formatCurrency('$.marketPrice', '$.fiatSymbol'),
          },
        ],
      }),
    },
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
        id: 'rarity',
        sortable: true,
      },
      {
        id: 'mana',
        sortable: true,
      },
      {
        id: 'splinter',
        sortable: true,
      },
      {
        id: 'level',
      },
      {
        id: 'edition',
      },
      {
        id: 'foil',
      },
      {
        id: 'role',
      },
      {
        id: 'marketPrice',
        title: 'Value',
        format: formatCurrency('$.marketPrice', '$.fiatSymbol'),
        sortable: true,
      },
    ],
  });
}
