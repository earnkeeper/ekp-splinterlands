import {
  Button,
  Card,
  Col,
  collection,
  Container,
  count,
  Datatable,
  documents,
  Form,
  formatCurrency,
  formatPercent,
  formatTemplate,
  formValue,
  Fragment,
  GridTile,
  Icon,
  iif,
  Image,
  isBusy,
  Modal,
  ModalBody,
  navigate,
  not,
  PageHeaderTile,
  path,
  Row,
  Rpc,
  Select,
  setFormValue,
  showModal,
  Span,
  sum,
  Table,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import _ from 'lodash';
import { LEAGUES } from '../../../shared/game';
import {
  DEFAULT_MARKETPLACE_FORM,
  DEFENSE_IMAGE,
  EDITION_COLUMN,
  EDITION_IMAGE_MAP,
  FOIL_IMAGE_MAP,
  HEALTH_IMAGE,
  LEVEL_COLUMN,
  MANA_COLUMN,
  MANA_IMAGE,
  MELEE_IMAGE,
  POWER_COLUMN,
  RARITY_COLUMN,
  RARITY_IMAGE_MAP,
  ROLE_COLUMN,
  ROLE_IMAGE_MAP,
  SPEED_IMAGE,
  SPLINTER_COLUMN,
  SPLINTER_IMAGE_MAP,
  statsCard,
} from '../../../util';
import { commify } from '../../../util/rpc/commify.rpc';
import { imageLabelCell } from '../../../util/ui/imageLabelCell';
import { ListingDocument } from './listing.document';

export const DETAILS_MODAL_ID = 'DETAILS_MODAL_ID';

export default function element(
  fiatSymbol?: string,
  priceRanges?: number[],
): UiElement {
  return Container({
    children: [
      titleRow(),
      instructionsRow(),
      formRow(),
      statsRow(),
      marketRow(fiatSymbol, priceRanges),
      detailsModal(),
    ],
  });
}

function statsRow() {
  return Row({
    when: `${path(ListingDocument)}[?(@.starred == 'Yes')]`,
    children: [
      Col({
        className: 'col-auto',
        children: [
          statsCard(
            'Starred Cards',
            count(`${path(ListingDocument)}[?(@.starred == 'Yes')]`),
          ),
        ],
      }),
      Col({
        className: 'col-auto',
        children: [
          statsCard(
            'Total Starred Cost',
            formatCurrency(
              sum(`${path(ListingDocument)}[?(@.starred == 'Yes')].price`),
              `${path(ListingDocument)}.0.fiatSymbol`,
            ),
          ),
        ],
      }),
      Col({
        className: 'col-auto',
        children: [
          statsCard(
            'Total Starred Power',
            commify(
              sum(`${path(ListingDocument)}[?(@.starred == 'Yes')].power`),
            ),
          ),
        ],
      }),
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
            leagueGroup: 'string',
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
                    name: 'leagueGroup',
                    options: [
                      'All',
                      ..._.chain(LEAGUES)
                        .map((it) => it.group)
                        .uniq()
                        .value(),
                    ],
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
    defaultSortFieldId: 'battles',
    defaultSortAsc: false,
    defaultView: {
      xs: 'grid',
      lg: 'column',
    },
    data: documents(ListingDocument),
    busyWhen: isBusy(collection(ListingDocument)),
    onRowClicked: showModal(DETAILS_MODAL_ID, '$'),
    paginationPerPage: 50,
    filters: [
      {
        columnId: 'edition',
        type: 'checkbox',
        imageMap: EDITION_IMAGE_MAP,
      },
      {
        columnId: 'starred',
        type: 'checkbox',
        elementMap: {
          Yes: Icon({
            className: 'filled-star',
            name: 'star',
            size: 'sm',
          }),
          No: Icon({
            name: 'star',
            size: 'sm',
          }),
        },
      },
      {
        columnId: 'splinter',
        type: 'checkbox',
        imageMap: SPLINTER_IMAGE_MAP,
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
            value: commify('$.battles'),
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
          content: commify('$.qty'),
        },
      }),
    },
    columns: [
      {
        id: 'star',
        title: '',
        width: '50px',
        cell: Button({
          icon: 'star',
          size: 'sm',
          iconClassName: iif(
            formValue('marketplace-favourites', '$.id'),
            'filled-star',
            '',
          ),
          color: 'flat-primary',
          onClick: setFormValue(
            'marketplace-favourites',
            '$.id',
            not(formValue('marketplace-favourites', '$.id')),
          ),
        }),
      },
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
      LEVEL_COLUMN,
      {
        id: 'price',
        format: formatCurrency('$.price', '$.fiatSymbol'),
        sortable: true,
      },
      {
        id: 'battles',
        format: commify('$.battles'),
        sortable: true,
      },
      {
        id: 'winpc',
        title: 'Win',
        format: formatPercent('$.winpc'),
        sortable: true,
        width: '80px',
      },
      POWER_COLUMN,
      RARITY_COLUMN,
      SPLINTER_COLUMN,
      EDITION_COLUMN,
      ROLE_COLUMN,
      MANA_COLUMN,
      {
        id: 'melee',
        cell: imageLabelCell(MELEE_IMAGE, '$.melee'),
        width: '80px',
        sortable: true,
      },
      {
        id: 'speed',
        cell: imageLabelCell(SPEED_IMAGE, '$.speed'),
        width: '80px',
        sortable: true,
      },
      {
        id: 'defense',
        cell: imageLabelCell(DEFENSE_IMAGE, '$.defense'),
        width: '80px',
        sortable: true,
      },
      {
        id: 'health',
        cell: imageLabelCell(HEALTH_IMAGE, '$.health'),
        width: '80px',
        sortable: true,
      },
      {
        id: 'qty',
        format: commify('$.qty'),
        sortable: true,
        width: '80px',
      },
      {
        id: 'playerOwned',
        title: 'Owned',
        omit: true,
      },
      {
        id: 'starred',
        omit: true,
      },
    ],
  });
}

export function detailsModal(): UiElement {
  return Modal({
    id: DETAILS_MODAL_ID,
    centered: true,
    size: 'lg',
    header: '$.name',
    children: [
      ModalBody({
        children: [
          Row({
            children: [
              Col({
                className: 'col-12 col-lg-6',
                children: [
                  Image({
                    src: '$.cardByLevelUrl',
                  }),
                ],
              }),
              Col({
                children: [
                  Row({
                    children: [
                      Col({
                        className: 'col-12',
                        children: [
                          Card({
                            className: 'mt-2',
                            children: [
                              StatsTable({
                                rows: [
                                  {
                                    name: 'Price',
                                    value: formatCurrency(
                                      '$.price',
                                      '$.fiatSymbol',
                                    ),
                                  },
                                  {
                                    name: 'Level',
                                    value: '$.level',
                                  },
                                  {
                                    name: 'League',
                                    value: formValue(
                                      'marketplace',
                                      'leagueGroup',
                                    ),
                                  },
                                  {
                                    name: 'Win Rate',
                                    value: formatPercent('$.winpc'),
                                  },
                                  {
                                    name: 'Battles',
                                    value: '$.battles',
                                  },
                                  {
                                    imageUrl: MANA_IMAGE,
                                    name: 'Mana',
                                    value: '$.mana',
                                  },
                                  {
                                    imageUrl: MELEE_IMAGE,
                                    name: 'Melee',
                                    value: '$.melee',
                                  },
                                  {
                                    imageUrl: SPEED_IMAGE,
                                    name: 'Speed',
                                    value: '$.speed',
                                  },
                                  {
                                    imageUrl: DEFENSE_IMAGE,
                                    name: 'Defense',
                                    value: '$.defense',
                                  },
                                  {
                                    imageUrl: HEALTH_IMAGE,
                                    name: 'Health',
                                    value: '$.health',
                                  },
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      Col({
                        className: 'col-12 pt-0',
                        children: [
                          Button({
                            icon: 'cil-spreadsheet',
                            label: 'View Battles',
                            color: 'flat-primary',
                            onClick: navigate(
                              formatTemplate(
                                'battles?card={{ cardId }}&leagueGroup={{ leagueGroup }}',
                                {
                                  cardId: '$.cardHash',
                                  leagueGroup: formValue(
                                    'marketplace',
                                    'leagueGroup',
                                  ),
                                },
                              ),
                              true,
                            ),
                          }),
                        ],
                      }),
                      Col({
                        className: 'col-12',
                        children: [
                          Button({
                            icon: 'cil-globe-alt',
                            label: 'View on Splinterlands.com',
                            color: 'flat-primary',
                            onClick: navigate(
                              formatTemplate(
                                'https://splinterlands.com/?p=card_details&id={{ templateId }}&gold={{ gold }}&edition={{ editionNumber }}&tab=',
                                {
                                  templateId: '$.cardTemplateId',
                                  gold: '$.gold',
                                  editionNumber: '$.editionNumber',
                                },
                              ),
                              true,
                              true,
                            ),
                          }),
                        ],
                      }),
                    ],
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

function StatsTable(props: {
  rows: {
    imageUrl?: string;
    name: string;
    value: Rpc;
  }[];
}) {
  return Table({
    className: 'w-100',
    widths: ['32px', , '16px'],
    body: props.rows.map((row) => [
      Row({
        children: [
          Col({
            className: 'col-auto pr-0 w-3',
            children: [
              Image({
                src: row.imageUrl ?? '',
                size: 24,
              }),
            ],
          }),
          Col({
            children: [
              Span({
                content: row.name,
              }),
            ],
          }),
          Col({
            className: 'col-auto mr-1 text-right',
            children: [
              Span({
                content: row.value,
              }),
            ],
          }),
        ],
      }),
    ]),
  });
}
