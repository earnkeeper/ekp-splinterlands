import {
  Button,
  Col,
  collection,
  Container,
  documents,
  Form,
  formatCurrency,
  formatPercent,
  formatToken,
  Fragment,
  GridTile,
  Image,
  isBusy,
  PageHeaderTile,
  Row,
  Select,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { LEAGUES } from '../../../shared/game';
import {
  DEFAULT_MARKETPLACE_FORM,
  EDITION_IMAGE_MAP,
  FOIL_IMAGE_MAP,
  RARITY_IMAGE_MAP,
  ROLE_IMAGE_MAP,
  SPLINTER_IMAGE_MAP,
} from '../../../util';
import { Datatable } from '../../../util/ekp/datatable';
import { switchCase } from '../../../util/ekp/switchCase.rpc';
import { imageLabelCell } from '../../../util/ui/imageLabelCell';
import { ListingDocument } from './listing.document';

export default function element(
  fiatSymbol?: string,
  priceRanges?: number[],
): UiElement {
  return Container({
    children: [
      titleRow(),
      instructionsRow(),
      formRow(),
      marketRow(fiatSymbol, priceRanges),
    ],
  });
}

function instructionsRow() {
  return Span({
    className: 'd-block mt-1 mb-2 font-small-4',
    content:
      'Search and filter the table below for the cards available on the Splinterlands Marketplace, with added info on their popularity and win rate.',
  });
}

function formRow() {
  return Fragment({
    children: [
      Span({
        className: 'd-block mt-1 mb-2 font-small-4',
        content:
          'Choose a league to restrict card win rates below to a certain league',
      }),
      Form({
        name: 'marketplace',
        schema: {
          type: 'object',
          properties: {
            leagueName: 'string',
          },
          default: DEFAULT_MARKETPLACE_FORM,
        },
        children: [
          Row({
            className: 'mb-1',
            children: [
              Col({
                className: 'col-12 col-md-auto',
                children: [
                  Select({
                    label: 'League',
                    name: 'leagueName',
                    options: ['All', ...LEAGUES.map((it) => it.name)],
                    minWidth: 160,
                  }),
                ],
              }),
              Col({
                className: 'col-12 col-md-auto my-auto',
                children: [
                  Button({
                    label: 'Update',
                    isSubmit: true,
                    busyWhen: isBusy(collection(ListingDocument)),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function titleRow() {
  return Row({
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
        columnId: 'splinter',
        type: 'checkbox',
        imageMap: SPLINTER_IMAGE_MAP,
      },
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
        columnId: 'level',
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
      {
        columnId: 'battles',
        type: 'radio',
        allowCustomOption: true,
        options: [
          {
            label: 'All',
          },
          {
            label: '> 10',
            query: '> 10',
          },
        ],
      },
    ],
    gridView: {
      tileWidth: [12, 6, 4, 3],
      tile: GridTile({
        image: Image({
          className: 'card-img-top',
          src: '$.cardByLevelUrl',
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
            value: formatPercent('$.winpc'),
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
          src: '$.cardArtUrl',
          size: 32,
          rounded: true,
        }),
      },
      {
        id: 'name',
        searchable: true,
        sortable: true,
        minWidth: '200px',
      },
      {
        id: 'level',
        width: '70px',
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
        id: 'winpc',
        title: 'Win',
        format: formatPercent('$.winpc'),
        sortable: true,
        width: '80px',
      },

      {
        id: 'rarity',
        sortable: true,
        minWidth: '140px',
        cell: imageLabelCell(
          switchCase('$.rarity', RARITY_IMAGE_MAP),
          '$.rarity',
        ),
      },
      {
        id: 'splinter',
        cell: imageLabelCell(
          switchCase('$.splinter', SPLINTER_IMAGE_MAP),
          '$.splinter',
        ),
      },
      {
        id: 'edition',
        cell: imageLabelCell(
          switchCase('$.edition', EDITION_IMAGE_MAP),
          '$.edition',
        ),
        minWidth: '120px',
      },
      {
        id: 'role',
        cell: imageLabelCell(switchCase('$.role', ROLE_IMAGE_MAP), '$.role'),
        minWidth: '130px',
      },
      {
        id: 'foil',
        cell: imageLabelCell(switchCase('$.foil', FOIL_IMAGE_MAP), '$.foil'),
        minWidth: '110px',
      },
      {
        id: 'qty',
        format: formatToken('$.qty'),
        sortable: true,
        width: '80px',
      },
      {
        id: 'playerOwned',
        title: 'Owned',
        omit: true,
      },
    ],
  });
}
