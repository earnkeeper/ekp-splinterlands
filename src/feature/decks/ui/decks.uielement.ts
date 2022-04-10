import {
  Button,
  Col,
  collection,
  Container,
  Datatable,
  documents,
  Form,
  formatCurrency,
  formatPercent,
  formatToken,
  Fragment,
  GridTile,
  Image,
  Input,
  isBusy,
  PageHeaderTile,
  path,
  Row,
  showModal,
  Span,
  sum,
  switchCase,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import {
  DEFAULT_PLANNER_FORM,
  SPLINTER_IMAGE_MAP,
  statsCard,
  teamModal,
  TEAM_MODAL_ID,
} from '../../../util';
import { imageLabelCell } from '../../../util/ui/imageLabelCell';
import { DeckDocument } from './deck.document';

export default function element(): UiElement {
  return Container({
    children: [
      titleRow(),
      statsRow(),
      yourDetailsRow(),
      decksTable(),
      teamModal(),
    ],
  });
}

function titleRow() {
  return Fragment({
    children: [
      Row({
        className: 'mb-2',
        children: [
          Col({
            className: 'col-auto',
            children: [
              PageHeaderTile({
                title: 'Saved Teams',
                icon: 'cil-cart',
              }),
            ],
          }),
        ],
      }),
      Span({
        className: 'd-block mt-1 mb-2 font-small-4',
        content:
          'Save teams from the battle planner to review later, and check current prices before buying',
      }),
    ],
  });
}

function statsRow() {
  return Row({
    children: [
      Col({
        className: 'col-auto',
        children: [
          statsCard('Number of Teams', {
            method: 'count',
            params: [path(DeckDocument)],
          }),
        ],
      }),
      Col({
        className: 'col-auto',
        children: [
          statsCard(
            'Total Purchase Cost',
            formatCurrency(
              sum(`${path(DeckDocument)}.price`),
              `${path(DeckDocument)}.0.fiatSymbol`,
            ),
          ),
        ],
      }),
    ],
  });
}

function yourDetailsRow() {
  return Fragment({
    children: [
      Span({
        className: 'font-weight-bold font-medium-3 d-block',
        content: 'Your Details',
      }),
      Span({
        className: 'd-block mt-1 mb-2 font-small-3',
        content:
          'Enter your player name below to update the cost of decks based on the cards you already own',
      }),
      Form({
        name: 'planner',
        schema: {
          type: 'object',
          properties: {
            playerName: 'string',
          },
          default: DEFAULT_PLANNER_FORM,
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
                    label: 'Update',
                    isSubmit: true,
                    busyWhen: isBusy(collection(DeckDocument)),
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

export function decksTable() {
  return Fragment({
    children: [
      Datatable({
        defaultSortFieldId: 'teamName',
        defaultSortAsc: true,
        data: documents(DeckDocument),
        onRowClicked: showModal(TEAM_MODAL_ID, '$'),
        pointerOnHover: true,
        showExport: true,
        showLastUpdated: true,
        busyWhen: isBusy(collection(DeckDocument)),
        defaultView: {
          xs: 'grid',
          lg: 'column',
        },
        filters: [
          {
            columnId: 'splinter',
            type: 'checkbox',
            imageMap: SPLINTER_IMAGE_MAP,
          },
          {
            columnId: 'mana',
            type: 'checkbox',
          },
        ],
        gridView: {
          tileWidth: [12, 6, 4, 3],
          tile: GridTile({
            image: Image({
              className: 'card-img-top',
              src: '$.summonerCardImg',
            }),
            details: [
              {
                label: 'Team Name',
                value: '$.teamName',
              },
              {
                label: 'Cost',
                value: formatCurrency('$.price', '$.fiatSymbol'),
              },
              {
                label: 'Battles',
                value: formatToken('$.battles'),
              },
              {
                label: 'Mana',
                value: '$.mana',
              },
              {
                label: 'Monsters',
                value: '$.monsterCount',
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
            id: 'teamName',
            searchable: true,
            sortable: true,
          },
          {
            id: 'splinter',
            sortable: true,
            width: '120px',
            cell: imageLabelCell(
              switchCase('$.splinter', SPLINTER_IMAGE_MAP),
              '$.splinter',
            ),
          },
          {
            id: 'summonerName',
            title: 'Summoner',
            sortable: true,
          },
          {
            id: 'monsterCount',
            title: 'Monsters',
            sortable: true,
            grow: 0,
          },
          {
            id: 'mana',
            sortable: true,
            grow: 0,
          },
          {
            id: 'price',
            title: 'Cost',
            sortable: true,
            grow: 0,
            format: formatCurrency('$.price', '$.fiatSymbol'),
          },
        ],
      }),
    ],
  });
}
