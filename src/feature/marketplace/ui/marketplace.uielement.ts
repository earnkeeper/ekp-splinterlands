import {
  Col,
  collection,
  Container,
  Datatable,
  documents,
  formatCurrency,
  formatPercent,
  formatToken,
  GridTile,
  Image,
  isBusy,
  PageHeaderTile,
  Row,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { ListingDocument } from './listing.document';

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
                title: 'Splinterlands Marketplace',
                icon: 'cil-cart',
              }),
            ],
          }),
        ],
      }),
      Span({
        className: 'd-block mt-1 mb-2 font-small-4',
        content:
          'Search and filter the table below for the cards available on the Splinterlands Marketplace, with added info on their popularity and win rate.',
      }),
      marketRow(),
    ],
  });
}

function marketRow(): UiElement {
  return Datatable({
    defaultSortFieldId: 'price',
    defaultSortAsc: true,
    defaultView: {
      xs: 'grid',
      lg: 'column',
    },
    data: documents(ListingDocument),
    busyWhen: isBusy(collection(ListingDocument)),
    filters: [
      {
        columnId: 'battles',
        type: 'slider',
      },
      {
        columnId: 'elementString',
        type: 'checkbox',
      },
      {
        columnId: 'level',
        type: 'slider',
      },
      {
        columnId: 'price',
        type: 'slider',
      },
      {
        columnId: 'rarity',
        type: 'checkbox',
      },
    ],
    gridView: {
      tileWidth: [12, 6, 4, 3],
      tile: GridTile({
        image: Image({
          className: 'card-img-top',
          src: '$.imageTile',
        }),
        details: [
          {
            label: 'Price',
            value: formatCurrency('$.price', '$.fiatSymbol'),
          },
          {
            label: 'Battles',
            value: formatToken('$.battles'),
          },
          {
            label: 'Win Rate',
            value: formatPercent('$.winPc'),
          },
        ],
        left: {
          content: formatCurrency('$.price', '$.fiatSymbol'),
        },
        right: {
          content: formatToken('$.qty'),
        },
      }),
    },
    columns: [
      {
        id: 'imageUrl',
        title: '',
        width: '48px',
        cell: Image({
          src: '$.imageSmall',
          size: 32,
          rounded: true,
        }),
      },
      {
        id: 'name',
        searchable: true,
        minWidth: '160px',
      },
      {
        id: 'rarity',
      },
      {
        id: 'elementString',
        title: 'Element',
      },
      {
        id: 'level',
      },
      {
        id: 'qty',
        format: formatToken('$.qty'),
        sortable: true,
      },
      {
        id: 'price',
        format: formatCurrency('$.price', '$.fiatSymbol'),
        sortable: true,
      },
      {
        id: 'battles',
        format: formatToken('$.battles'),
        sortable: true,
      },
      {
        id: 'winPc',
        title: 'Win Rate',
        format: formatPercent('$.winPc'),
        sortable: true,
      },
      {
        id: 'playerOwned',
        title: 'Owned',
        omit: true,
      },
    ],
  });
}
