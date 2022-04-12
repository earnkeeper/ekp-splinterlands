import {
  Button,
  Col,
  Datatable,
  formatCurrency,
  formatPercent,
  formatTemplate,
  hideModal,
  Image,
  Modal,
  ModalBody,
  ModalFooter,
  navigate,
  removeFormRecord,
  Row,
  runAll,
  showModal,
  Span,
  switchCase,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { SPLINTER_IMAGE_MAP } from './constants';
import { PROMPT_DECK_NAME_MODAL_ID } from './prompt-deck-name.modal';
import { statsCard } from './stats-card';

export const TEAM_MODAL_ID = 'splinterlands-team-modal';

export function teamModal(): UiElement {
  return Modal({
    id: TEAM_MODAL_ID,
    centered: true,
    size: 'lg',
    header: Row({
      children: [
        Col({
          className: 'col-auto',
          children: [
            Image({
              src: switchCase('$.splinter', SPLINTER_IMAGE_MAP),
            }),
          ],
        }),
        Col({
          className: 'col-auto',
          children: [
            Span({
              content: formatTemplate('{{ summonerName }} Team', {
                summonerName: '$.summonerName',
              }),
            }),
          ],
        }),
      ],
    }),

    children: [
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
                        when: '$.winpc',
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
                    color: 'danger',
                    outline: true,
                    label: 'Remove',
                    onClick: runAll(
                      removeFormRecord('savedTeams', 'teamName', '$.teamName'),
                      hideModal(TEAM_MODAL_ID),
                    ),
                  }),
                ],
              }),
              Col({ children: [] }),
              Col({
                className: 'col-auto',
                children: [
                  Button({
                    className: 'float-right',
                    label: 'View Battles',
                    outline: true,
                    onClick: navigate(
                      formatTemplate(
                        'battles?team={{ teamHash }}&mana={{ mana }}',
                        {
                          teamHash: '$.id',
                          mana: '$.mana',
                        },
                      ),
                      true,
                    ),
                  }),
                ],
              }),
              Col({
                className: 'col-auto',
                when: { not: '$.teamName' },
                children: [
                  Button({
                    label: 'Save Team',
                    onClick: showModal(PROMPT_DECK_NAME_MODAL_ID, '$'),
                    outline: true,
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
