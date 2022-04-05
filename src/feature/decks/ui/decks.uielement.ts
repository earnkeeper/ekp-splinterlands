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
  Select,
  showModal,
  Span,
  sum,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import _ from 'lodash';
import { LEAGUES, MANA_CAPS, RULESETS } from '../../../shared/game';
import {
  DEFAULT_BATTLE_FORM,
  statsCard,
  teamModal,
  TEAM_MODAL_ID,
} from '../../../util';
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
        className: 'd-block mt-1 font-small-3',
        content:
          'Enter your details beow to update win rate and battle metrics.',
      }),
      Span({
        className: 'd-block mt-1 mb-2 font-small-3',
        content:
          'Optionally, enter your player name to exclude already owned cards from your purchase cost.',
      }),
      Form({
        name: 'planner',
        schema: {
          type: 'object',
          properties: {
            playerName: 'string',
            manaCap: 'number',
            ruleset: 'string',
            leagueName: 'string',
          },
          default: DEFAULT_BATTLE_FORM,
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
                className: 'col-12 col-md-auto',
                children: [
                  Select({
                    label: 'Mana Cap',
                    name: 'manaCap',
                    options: MANA_CAPS,
                    minWidth: 80,
                  }),
                ],
              }),
              Col({
                className: 'col-12 col-md-auto',
                children: [
                  Select({
                    label: 'Ruleset',
                    name: 'ruleset',
                    options: [
                      'Standard',
                      ..._.chain(RULESETS)
                        .map((it) => it.name)
                        .filter((it) => it !== 'Standard')
                        .sort()
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
                    label: 'Save',
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
            cell: Row({
              children: [
                Col({
                  className: 'col-auto pr-0',
                  children: [Image({ src: '$.splinterIcon' })],
                }),
                Col({
                  className: 'col-auto',
                  children: [Span({ content: '$.splinter' })],
                }),
              ],
            }),
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
            id: 'winpc',
            title: 'Win',
            format: formatPercent('$.winpc'),
            sortable: true,
            width: '60px',
          },
          {
            id: 'battles',
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
