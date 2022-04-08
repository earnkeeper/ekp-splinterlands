import {
  Button,
  Col,
  collection,
  Container,
  documents,
  Form,
  formatAge,
  formatToken,
  GridTile,
  Image,
  Input,
  isBusy,
  PageHeaderTile,
  Row,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { RULESET_IMAGE_MAP } from '../../../shared/game';
import { DEFAULT_HISTORY_FORM, SPLINTER_IMAGE_MAP } from '../../../util';
import { arrayJoin } from '../../../util/ekp/arrayJoin.rpc';
import { Badge } from '../../../util/ekp/badge';
import { Datatable } from '../../../util/ekp/datatable';
import { switchCase } from '../../../util/ekp/switchCase.rpc';
import { HistoryDocument } from './history.document';

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
                title: 'Battle History',
                icon: 'cil-history',
              }),
            ],
          }),
        ],
      }),
      Span({
        className: 'd-block mt-1 mb-2 font-small-3',
        content:
          'Enter a player name to view, search and filter their battle history',
      }),
      formRow(),
      historyRow(),
    ],
  });
}

function formRow(): UiElement {
  return Form({
    name: 'history',
    schema: {
      type: 'object',
      properties: {
        playerName: 'string',
      },
      default: DEFAULT_HISTORY_FORM,
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
                label: 'View',
                isSubmit: true,
                busyWhen: isBusy(collection(HistoryDocument)),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function historyRow(): UiElement {
  return Datatable({
    defaultSortFieldId: 'timestamp',
    defaultSortAsc: false,
    defaultView: {
      xs: 'grid',
      lg: 'column',
    },
    data: documents(HistoryDocument),
    busyWhen: isBusy(collection(HistoryDocument)),
    filters: [
      {
        columnId: 'rulesets',
        type: 'checkbox',
        imageMap: RULESET_IMAGE_MAP,
      },
      {
        columnId: 'result',
        type: 'checkbox',
      },
    ],
    gridView: {
      tileWidth: [12, 6, 4, 4],
      tile: GridTile({
        image: Row({
          className: 'my-4',
          children: [
            Col({
              children: [
                Image({
                  src: switchCase('$.mySplinter', SPLINTER_IMAGE_MAP),
                  size: 48,
                }),
              ],
            }),
            Col({
              className: 'my-auto col-auto p-0',
              children: [
                Span({
                  content: 'vs',
                }),
              ],
            }),
            Col({
              children: [
                Image({
                  src: switchCase('$.opponentSplinter', SPLINTER_IMAGE_MAP),
                  size: 48,
                }),
              ],
            }),
          ],
        }),
        details: [
          {
            label: 'Result',
            value: '$.result',
          },
          {
            label: 'Timestamp',
            value: formatAge('$.timestamp'),
          },
          {
            label: 'Opponent',
            value: '$.opponentName',
          },
          {
            label: 'Mana Cap',
            value: '$.manaCap',
          },
          {
            label: 'Rule Sets',
            value: '$.rulesets',
          },
          {
            label: 'Opponent Rating',
            value: '$.opponentInitialRating',
          },

          {
            label: 'Final Rating',
            value: '$.myFinalRating',
          },
        ],
        left: {
          content: formatAge('$.timestamp'),
        },
        right: {
          content: formatToken('$.qty'),
        },
      }),
    },
    columns: [
      {
        id: 'timestamp',
        title: 'Timestamp',
        sortable: true,
        format: formatAge('$.timestamp'),
      },
      {
        id: 'result',
        cell: Badge({
          color: switchCase('$.result', { Loss: 'danger', Win: 'success' }),
          children: [Span({ content: '$.result' })],
        }),
        width: '80px',
      },
      {
        id: 'leagueName',
        title: 'League',
      },
      {
        id: 'opponentInitialRating',
        title: 'Opponent Rating',
        grow: 0,
      },
      {
        id: 'opponentName',
        title: 'Opponent',
        searchable: true,
        minWidth: '160px',
      },
      {
        title: 'Mana Cap',
        id: 'manaCap',
        grow: 0,
      },
      {
        id: 'rulesets',
        format: arrayJoin('$.rulesets', ', '),
      },
      {
        id: 'myFinalRating',
        title: 'Rating',
        grow: 0,
      },
    ],
  });
}
