import {
  Button,
  Col,
  collection,
  Container,
  Datatable,
  documents,
  Form,
  formatAge,
  formatCurrency,
  formatPercent,
  formatTemplate,
  formatToken,
  Fragment,
  Image,
  Input,
  isBusy,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  PageHeaderTile,
  path,
  Row,
  Select,
  showModal,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { GameService } from '../../../shared/game';
import {
  promptDeckNameModal,
  PROMPT_DECK_NAME_MODAL_ID,
  statsCard,
} from '../../../util';
import { PlannerViewBag } from './planner-view-bag.document';
import { PlannerDocument } from './planner.document';

const TEAM_MODAL_ID = 'splinterlands-team-modal';

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
                title: 'Splinterlands Battle Planner',
                icon: 'cil-paw',
              }),
            ],
          }),
        ],
      }),
      battleDetailsForm(),
      teamRow(),
      teamModal(),
      promptDeckNameModal(),
    ],
  });
}

function battleDetailsForm() {
  return Fragment({
    children: [
      Span({
        className: 'font-weight-bold font-medium-3 d-block',
        content: 'Your Details',
      }),
      Span({
        className: 'd-block mt-1 mb-2 font-small-3',
        content:
          'Enter the details of your next match, to see which teams have been winning the most recently. Player Name is optional, enter this to limit to just your current cards.',
      }),
      Form({
        name: 'planner',
        schema: {
          type: 'object',
          properties: {
            playerName: 'string',
            manaCap: 'string',
            ruleset: 'string',
            leagueName: 'string',
          },
          default: {
            manaCap: '13',
            ruleset: 'Standard',
            leagueName: 'All',
          },
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
                    options: [
                      'All',
                      ...GameService.LEAGUES.map((it) => it.name),
                    ],
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
                    options: GameService.MANA_CAPS,
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
                    options: ['Standard'],
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
                    busyWhen: isBusy(collection(PlannerDocument)),
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
function teamRow(): UiElement {
  return Fragment({
    children: [
      Span({
        className: 'font-weight-bold font-medium-3 d-block',
        content: 'Viable Teams',
      }),
      Span({
        className: 'd-block mt-1 mb-2 font-small-3',
        content: formatTemplate(
          'Data based on {{ battleCount }} battles starting {{ ago }}.',
          {
            battleCount: formatToken(`${path(PlannerViewBag)}.0.battleCount`),
            ago: formatAge(`${path(PlannerViewBag)}.0.firstBattleTimestamp`),
          },
        ),
      }),

      Datatable({
        defaultSortFieldId: 'winpc',
        defaultSortAsc: false,
        data: documents(PlannerDocument),
        busyWhen: isBusy(collection(PlannerDocument)),
        onRowClicked: showModal(TEAM_MODAL_ID, '$'),
        showExport: false,
        columns: [
          {
            id: 'splinter',
            sortable: true,
            width: '120px',
            cell: Row({
              children: [
                Col({
                  className: 'col-auto pr-0',
                  children: [Image({ src: '$.elementIcon' })],
                }),
                Col({
                  className: 'col-auto',
                  children: [Span({ content: '$.splinter' })],
                }),
              ],
            }),
          },
          {
            id: 'summoner',
            sortable: true,
          },
          {
            id: 'winpc',
            title: 'Win',
            format: formatPercent('$.winpc'),
            sortable: true,
            width: '60px',
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
            id: 'battles',
            sortable: true,
            grow: 0,
          },
          {
            id: 'price',
            title: 'Cost',
            sortable: true,
            format: formatCurrency('$.price', '$.fiatSymbol'),
            grow: 0,
          },
        ],
      }),
    ],
  });
}
function teamModal(): any {
  return Modal({
    id: TEAM_MODAL_ID,
    centered: true,
    size: 'lg',
    children: [
      ModalHeader({
        children: [
          Row({
            children: [
              Col({
                className: 'col-auto',
                children: [
                  Image({
                    src: '$.elementIcon',
                  }),
                ],
              }),
              Col({
                className: 'col-auto',
                children: [
                  Span({
                    content: 'Team Viewer',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      ModalBody({
        children: [
          Row({
            children: [
              Col({
                className: 'col-12',
                children: [
                  Row({
                    children: [
                      Col({
                        className: 'col-auto',
                        children: [
                          statsCard(
                            'Deck Cost',
                            formatCurrency('$.price', '$.fiatSymbol'),
                          ),
                        ],
                      }),
                      Col({
                        className: 'col-auto',
                        children: [
                          statsCard('Win Rate', formatPercent('$.winpc')),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              Col({
                className: 'col-12',
                children: [
                  Datatable({
                    data: '$.monsters.*',
                    showExport: false,
                    showLastUpdated: false,
                    pagination: false,
                    columns: [
                      {
                        id: 'icon',
                        title: '',
                        width: '48px',
                        cell: Image({
                          src: '$.icon',
                          size: 24,
                          rounded: true,
                        }),
                      },
                      {
                        id: 'name',
                      },
                      {
                        id: 'level',
                        grow: 0,
                      },
                      {
                        id: 'mana',
                        grow: 0,
                      },
                      {
                        id: 'splinter',
                        grow: 0,
                      },
                      {
                        id: 'price',
                        grow: 0,
                        format: formatCurrency('$.price', '$.fiatSymbol'),
                      },
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      ModalFooter({
        children: [
          Row({
            className: 'pb-1 px-2',
            children: [
              Col({
                children: [
                  Button({
                    className: 'float-right',
                    icon: 'user-plus',
                    label: 'Add to Fantasy',
                    onClick: showModal(PROMPT_DECK_NAME_MODAL_ID, '$'),
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
