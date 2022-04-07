import {
  Button,
  Col,
  collection,
  Container,
  Datatable,
  documents,
  Form,
  formatAge,
  formatToken,
  Fragment,
  GridTile,
  Input,
  isBusy,
  PageHeaderTile,
  Row,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { DEFAULT_HISTORY_FORM } from '../../../util';
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
        columnId: 'result',
        type: 'radio',
      },
      {
        columnId: 'ruleSet',
        type: 'checkbox',
      },
      {
        columnId: 'matchType',
        type: 'checkbox',
      },
    ],
    gridView: {
      tileWidth: [12, 6, 4, 3],
      tile: GridTile({
        image: Fragment(),
        details: [
          {
            label: 'Timestamp',
            value: formatAge('$.timestamp'),
          },
          {
            label: 'Opponent Rating',
            value: '$.opponentInitialRating',
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
            label: 'Rule Set',
            value: '$.ruleSet',
          },
          {
            label: 'Match Type',
            value: '$.matchType',
          },
          {
            label: 'Result',
            value: '$.result',
          },
          {
            label: 'Final Rating',
            value: '$.myFinalRating',
          },
          {
            label: 'Streak',
            value: '$.currentStreak',
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
      },
      {
        title: 'Mana Cap',
        id: 'manaCap',
        grow: 0,
      },
      {
        id: 'ruleSet',
      },
      {
        id: 'matchType',
      },
      {
        id: 'myFinalRating',
        title: 'Rating',
        grow: 0,
      },
      {
        id: 'currentStreak',
        title: 'Streak',
        grow: 0,
      },
    ],
  });
}
