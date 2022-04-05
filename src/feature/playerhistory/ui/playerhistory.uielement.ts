import {
    Button,
    Col,
    collection,
    Container,
    Datatable,
    documents,
    Form,
    formatCurrency,
    formatToken,
    Fragment,
    GridTile,
    isBusy,
    PageHeaderTile,
    Row,
    Select,
    Span,
    UiElement,
  } from '@earnkeeper/ekp-sdk';
  import { DEFAULT_LEADERBOARD_FORM, LEADERBOARD_LEAGUES } from '../../../util';
  import { PlayerhistoryDocument } from './playerhistory.document';
  
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
                  icon: 'time',
                }),
              ],
            }),
          ],
        }),
        Span({
          className: 'd-block mt-1 mb-2 font-small-3',
          content:
            'The official splinterlands player history, select player to update.',
        }),
        formRow(),
        historyRow(),
      ],
    });
  }
  
  function formRow(): UiElement {
    return Form({
      name: 'playerhistory',
      schema: {
        type: 'object',
        properties: {
          playername: 'string',
        },
        default: DEFAULT_LEADERBOARD_FORM,
      },
      children: [
        Row({
          className: 'mb-1',
          children: [
            Col({
              className: 'col-12 col-md-auto',
              children: [
                Select({
                  label: 'Player',
                  name: 'playername',
                  options: [...LEADERBOARD_LEAGUES.map((it) => it.name)],
                  minWidth: 160,
                }),
              ],
            }),
             Col({
              className: 'col-12 col-md-auto my-auto',
              children: [
                Button({
                  label: 'View',
                  isSubmit: true,
                  busyWhen: isBusy(collection(PlayerhistoryDocument)),
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
    data: documents(PlayerhistoryDocument),
    busyWhen: isBusy(collection(PlayerhistoryDocument)),

    gridView: {
      tileWidth: [12, 6, 4, 3],
      tile: GridTile({
        image: Fragment(),
        details: [
          {
            label: 'Date',
            value: '$.created_date',
          },
          {
            label: 'Streak',
            value: '$.current_streak',
          },
          {
            label: 'Mana Cap',
            value: '$.mana_cap',
          },
          {
            label: 'Match Type',
            value: '$.match_type',
          },
          {
            label: 'Player 1',
            value: '$.player_1',
          },
          {
            label: 'Final Rating',
            value: '$.player_1_rating_final',
          },
          {
            label: 'Initial Rating',
            value: '$.player_1_rating_initial',
          },
          {
            label: 'Player 2',
            value: '$.player_2',
          },
          {
            label: 'Final Rating',
            value: '$.player_2_rating_final',
          },
          {
            label: 'Initial Rating',
            value: '$.player_2_rating_initial',
          },
          {
            label: 'R Share',
            value: '$.rshares',
          },
          {
            label: 'Ruleset',
            value: '$.ruleset',
          },
          {
            label: 'Winner',
            value: '$.winner',
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
        id: 'Date',
        grow: 0,
        sortable: true,
      },
      {
        id: 'Streak',
        grow: 0,
        sortable: true,
      },
      {
        id: 'Player 1',
        searchable: true,
      },
      {
        id: 'Player 2',
        searchable: true,
      },
      {
        id: 'match_type',
        searchable: true,
        sortable: true,
      },
      {
        id: 'ruleset',
        grow: 0,
        sortable: true,
      },
      {
        id: 'winner',
        grow: 0,
        sortable: true,
      },
     
    ],
  });
}


  
