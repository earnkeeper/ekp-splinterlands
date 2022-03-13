import {
  Button,
  Col,
  collection,
  Container,
  Datatable,
  documents,
  Form,
  formatPercent,
  formatTemplate,
  Image,
  Input,
  isBusy,
  Modal,
  ModalBody,
  ModalHeader,
  PageHeaderTile,
  Row,
  Select,
  showModal,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { GameService } from '../../../shared/game';
import { TeamGuideDocument } from './team-guide.document';

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
                title: 'Splinterlands Team Guide',
                icon: 'cil-people',
              }),
            ],
          }),
        ],
      }),
      battleDetailsForm(),
      teamRow(),
      teamModal(),
    ],
  });
}

function battleDetailsForm() {
  return Form({
    name: 'splinterlandsTeamGuide',
    schema: {
      type: 'object',
      properties: {
        playerName: 'string',
        manaCap: 'string',
        ruleset: 'string',
      },
      default: {
        manaCap: '13',
        ruleset: 'Standard',
      },
    },
    child: Row({
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
              busyWhen: isBusy(collection(TeamGuideDocument)),
            }),
          ],
        }),
      ],
    }),
  });
}
function teamRow(): UiElement {
  return Datatable({
    defaultSortFieldId: 'winpc',
    defaultSortAsc: false,
    data: documents(TeamGuideDocument),
    busyWhen: isBusy(collection(TeamGuideDocument)),
    onRowClicked: showModal(TEAM_MODAL_ID, '$'),
    filterable: true,
    showExport: false,
    columns: [
      {
        id: 'winpc',
        name: 'Win',
        label: formatPercent('$.winpc'),
        sortable: true,
        width: '60px',
      },
      {
        id: 'splinter',
        sortable: true,
        filterable: true,
        filterOptions: GameService.SPLINTERS,
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
        filterable: true,
      },
      {
        id: 'monsterCount',
        name: 'Monsters',
        sortable: true,
        filterable: true,
        grow: 0,
      },
      {
        id: 'mana',
        sortable: true,
        filterable: true,
        grow: 0,
      },
      {
        id: 'battles',
        sortable: true,
        grow: 0,
      },
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
                    content: formatTemplate('{{ splinter }} Team', {
                      splinter: '$.splinter',
                    }),
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
                  Datatable({
                    data: '$.monsters.*',
                    showExport: false,
                    showLastUpdated: false,
                    pagination: false,
                    columns: [
                      {
                        id: 'icon',
                        name: '',
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
                        id: 'mana',
                        grow: 0,
                      },
                      {
                        id: 'id',
                        grow: 0,
                      },
                      {
                        id: 'type',
                        grow: 0,
                      },
                      {
                        id: 'splinter',
                        grow: 0,
                      },
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
