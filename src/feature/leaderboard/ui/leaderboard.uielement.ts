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
import { LEAGUE_GROUPS } from '../../../shared/game';
import { DEFAULT_LEADERBOARD_FORM } from '../../../util';
import { LeaderboardDocument } from './leaderboard.document';

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
                title: 'Leaderboard',
                icon: 'award',
              }),
            ],
          }),
        ],
      }),
      Span({
        className: 'd-block mt-1 mb-2 font-small-3',
        content:
          'The official splinterlands leaderboard for the current season, select league and season below and press save to update.',
      }),
      formRow(),
      tableRow(),
    ],
  });
}

function formRow(): UiElement {
  return Form({
    name: 'leaderboard',
    schema: {
      type: 'object',
      properties: {
        leagueGroup: 'string',
        season: 'number',
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
                label: 'League',
                name: 'leagueGroup',
                options: [...LEAGUE_GROUPS.map((it) => it.name)],
                minWidth: 160,
              }),
            ],
          }),
          Col({
            className: 'col-12 col-md-auto',
            children: [
              Select({
                label: 'Season',
                name: 'season',
                options: ['84'],
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
                busyWhen: isBusy(collection(LeaderboardDocument)),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function tableRow(): UiElement {
  return Datatable({
    defaultSortFieldId: 'rank',
    defaultSortAsc: true,
    defaultView: {
      xs: 'grid',
      lg: 'column',
    },
    pagination: false,
    data: documents(LeaderboardDocument),
    busyWhen: isBusy(collection(LeaderboardDocument)),
    gridView: {
      tileWidth: [12, 6, 4, 3],
      tile: GridTile({
        image: Fragment(),
        details: [
          {
            label: 'Rank',
            value: '$.rank',
          },
          {
            label: 'Rating',
            value: '$.rating',
          },
          {
            label: 'Player',
            value: '$.player',
          },
          {
            label: 'Gulid',
            value: '$.guildName',
          },
          {
            label: 'Battles',
            value: '$.battles',
          },
          {
            label: 'Wins',
            value: '$.wins',
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
        id: 'rank',
        grow: 0,
        sortable: true,
      },
      {
        id: 'rating',
        grow: 0,
        sortable: true,
      },
      {
        id: 'player',
        searchable: true,
      },
      {
        id: 'guildName',
        searchable: true,
        sortable: true,
      },
      {
        id: 'battles',
        grow: 0,
        sortable: true,
      },
      {
        id: 'wins',
        grow: 0,
        sortable: true,
      },
      {
        id: 'reward',
        grow: 0,
        sortable: true,
        format: formatToken('$.reward'),
      },
      {
        id: 'rewardFiat',
        grow: 0,
        format: formatCurrency('$.rewardFiat', '$.fiatSymbol'),
      },
    ],
  });
}
