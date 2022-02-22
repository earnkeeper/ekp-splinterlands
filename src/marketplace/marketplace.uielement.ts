import {
  Col,
  collection,
  Container,
  Datatable,
  documents,
  formatCurrency,
  formatToken,
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
    isBusy: isBusy(collection(MarketplaceListingDocument)),
    filterable: true,
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
      },
      {
        id: 'qty',
        label: formatToken('$.qty'),
      },
      {
        id: 'level',
      },
      {
        id: 'price',
        label: formatCurrency('$.price', '$.fiatSymbol'),
        sortable: true,
      },
    ],
  });
}
