import {
    Button,
    Col,
    collection,
    Container,
    Datatable,
    documents,
    Form,
    formatCurrency,
    formatDatetime,
    formatToken,
    Fragment,
    GridTile,
    Input,
    isBusy,
    PageHeaderTile,
    Row,
    Select,
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
                  title: 'Player History',
                  icon: 'cil-history',
                }),
              ],
            }),
          ],
        }),
        Span({
          className: 'd-block mt-1 mb-2 font-small-3',
          content:
            'The official splinterlands player history, select player to view history',
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
          leagueName: 'string',
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
                  label: 'Player',
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
    defaultSortFieldId: 'created_date',
    defaultSortAsc: true,
    defaultView: {
      xs: 'grid',
      lg: 'column',
    },
    data: documents(HistoryDocument),
    busyWhen: isBusy(collection(HistoryDocument)),
    filters: [
      {
        columnId: 'manaCap',
        type: 'slider',
      },
      
      {
        columnId: 'rShares',
        type: 'slider',
      },
      
    ],

    gridView: {
      tileWidth: [12, 6, 4, 3],
      tile: GridTile({
        image: Fragment(),
        details: [
          {
            label: 'Date',
            value: '$.createdDate',
          },
          {
            label: 'Streak',
            value: '$.currentStreak',
          },
          {
            label: 'Mana Cap',
            value: '$.manaCap',
          },
          {
            label: 'Match Type',
            value: '$.matchType',
          },
          {
            label: 'Player 1',
            value: '$.player1',
          },
          {
            label: 'Final Rating',
            value: '$.player1RatingFinal',
          },
          {
            label: 'Initial Rating',
            value: '$.player1RatingInitial',
          },
          {
            label: 'Player 2',
            value: '$.player2',
          },
          {
            label: 'Final Rating',
            value: '$.player2RatingFinal',
          },
          {
            label: 'Initial Rating',
            value: '$.player2RatingInitial',
          },
          {
            label: 'R Share',
            value: '$.rShares',
          },
          {
            label: 'Ruleset',
            value: '$.ruleSet',
          },
          {
            label: 'Winner',
            value: '$.winner',
            
          },
          
        ],
        left: {
          
          content: formatDatetime('date_created'),
        },
        right: {
          content: formatToken('$.qty'),
        },
      }),
    },
    columns: [
      {
        id: 'created_date',
        title: 'Date',
        grow:0,
        sortable: true,
      },
      {
        id: 'currentStreak',
        title: 'Streak',
        grow: 0,
        sortable: true,
      },
      {
        title: 'Mana Cap',
        id: 'manaCap',
        grow: 0,
        sortable: true,
      },
    
      {
      title: 'Player 1',
      id: 'player1',
    },
    {
      title: 'Final Rating',
      id: 'player1RatingFinal',
      grow:0,
    },
    {
      title: 'Initial Rating',
      id: 'player1RatingInitial',
      grow:0,
    },
    {
      id: 'player2',
      searchable: true,
      title: 'Player 2'
    },
    {
      title: 'Final Rating',
      grow:0,
      id: 'player2RatingFinal',
    },
    {
      title: 'Initial Rating',
      grow:0,
      id: 'player2RatingInitial',
    },
    {
        id: 'matchType',
        searchable: true,
        sortable: true,
      },
      {
        id: 'ruleSet',
        sortable: true,
      },
      {
        id: 'winner',
        sortable: true,
      },

      {
        title: 'R Share',
        id: 'rShares',
        grow:0,
        sortable: true,
      },
      {
        title: 'Ruleset',
        id: 'ruleSet',
        sortable: true,
      },
     
    ],
  });
}


  
