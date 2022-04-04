import {
  Button,
  Col,
  Datatable,
  formatCurrency,
  formatPercent,
  hideModal,
  Image,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  runAll,
  showModal,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { PROMPT_DECK_NAME_MODAL_ID } from './prompt-deck-name.modal';
import { statsCard } from './stats-card';

export const TEAM_MODAL_ID = 'splinterlands-team-modal';

export function teamModal(): UiElement {
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
                    src: '$.splinterIcon',
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
            className: 'pb-1 px-2 pt-0',
            children: [
              Col({
                when: '$.teamName',
                children: [
                  Button({
                    icon: 'trash',
                    color: 'flat-danger',
                    label: 'Remove',
                    onClick: runAll(
                      {
                        method: 'removeFormRecord',
                        params: ['savedTeams', 'teamName', '$.teamName'],
                      },
                      hideModal(TEAM_MODAL_ID),
                    ),
                  }),
                ],
              }),
              Col({
                when: { not: '$.teamName' },
                children: [
                  Button({
                    className: 'float-right',
                    icon: 'user-plus',
                    label: 'Save Team',
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
