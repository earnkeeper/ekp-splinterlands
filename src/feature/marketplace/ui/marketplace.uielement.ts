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
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { MarketplaceListingDocument } from './marketplace-listing.document';

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
                title: 'Marketplace',
                icon: 'cil-cart',
              }),
            ],
          }),
        ],
      }),
      marketRow(),
    ],
  });
}

function marketRow(): UiElement {
  return Datatable({
    defaultSortFieldId: 'price',
    defaultSortAsc: true,
    data: documents(MarketplaceListingDocument),
    busyWhen: isBusy(collection(MarketplaceListingDocument)),
    filterable: true,
    gridView: {
      tileWidth: [12, 6, 4, 4],
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
            label: 'Name',
            value: '$.name',
          },
          {
            label: 'Rarity',
            value: '$.rarity',
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
        name: '',
        width: '48px',
        cell: Image({
          src: '$.imageSmall',
          size: 32,
          rounded: true,
        }),
      },
      {
        id: 'name',
        filterable: true,
      },
      {
        id: 'rarity',
        filterable: true,
        filterOptions: ['Common', 'Rare', 'Epic', 'Legendary'],
      },
      {
        id: 'element',
        value: '$.elementString',
        label: '$.elementString',
        filterable: true,
        filterOptions: [
          'Fire',
          'Water',
          'Earth',
          'Life',
          'Death',
          'Dragon',
          'Neutral',
        ],
      },
      {
        id: 'level',
        filterable: true,
      },
      {
        id: 'qty',
        label: formatToken('$.qty'),
      },
      {
        id: 'price',
        label: formatCurrency('$.price', '$.fiatSymbol'),
        sortable: true,
        filterable: true,
      },
      {
        id: 'battles',
        label: formatToken('$.battles'),
        filterable: true,
        sortable: true,
      },
      {
        id: 'winPc',
        name: 'Win Rate',
        label: formatPercent('$.winPc'),
        filterable: true,
        sortable: true,
      },
    ],
  });
}
