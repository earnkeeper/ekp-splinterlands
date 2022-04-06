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
  path,
  Row,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { ListingDocument } from './listing.document';

export default function element(
  fiatSymbol?: string,
  priceRanges?: number[],
): UiElement {
  return Container({
    children: [
      Row({
        className: 'mb-2',
        children: [
          Col({
            className: 'col-auto',
            children: [
              PageHeaderTile({
                title: 'Marketplace',
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
      marketRow(fiatSymbol, priceRanges),
    ],
  });
}

function marketRow(fiatSymbol: string, priceRanges: number[]): UiElement {
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
        columnId: 'rarity',
        type: 'checkbox',
      },
      {
        columnId: 'price',
        type: 'radio',
        allowCustomOption: true,
        options: !fiatSymbol
          ? [{ label: 'All' }]
          : [
              {
                label: 'All',
              },
              {
                label: `< ${fiatSymbol} ${priceRanges[0]}`,
                query: `< ${priceRanges[0]}`,
              },
              {
                label: `< ${fiatSymbol} ${priceRanges[1]}`,
                query: `< ${priceRanges[1]}`,
              },
              {
                label: `< ${fiatSymbol} ${priceRanges[2]}`,
                query: `< ${priceRanges[2]}`,
              },
            ],
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
