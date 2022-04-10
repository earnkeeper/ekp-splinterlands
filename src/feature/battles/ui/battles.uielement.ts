import {
  arrayJoin,
  Badge,
  Col,
  collection,
  Container,
  Datatable,
  documents,
  formatAge,
  Image,
  isBusy,
  Row,
  Span,
  switchCase,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { RULESET_IMAGE_MAP } from '../../../shared/game';
import { SPLINTER_IMAGE_MAP } from '../../../util/constants';
import { BattleDocument } from './battle.document';

export default function element(): UiElement {
  return Container({
    children: [headerRow(), tableRow()],
  });
}

function headerRow(): UiElement {
  return Row({
    className: 'mb-2',
    children: [
      Col({
        className: 'col-auto my-auto',
        children: [
          Span({
            className: 'font-large-1',
            content: 'Battles',
          }),
        ],
      }),
    ],
  });
}

function tableRow(): UiElement {
  return Datatable({
    defaultSortFieldId: 'timestamp',
    defaultSortAsc: false,
    data: documents(BattleDocument),
    busyWhen: isBusy(collection(BattleDocument)),
    filters: [
      {
        columnId: 'splinters',
        type: 'checkbox',
        imageMap: SPLINTER_IMAGE_MAP,
      },
      {
        columnId: 'rulesets',
        type: 'checkbox',
        imageMap: RULESET_IMAGE_MAP,
      },
      {
        columnId: 'leagueName',
        type: 'checkbox',
      },
    ],
    columns: [
      {
        id: 'timestamp',
        sortable: true,
        format: formatAge('$.timestamp'),
        width: '120px',
      },
      {
        id: 'winnerName',
        title: 'Winner',
        cell: PlayerCell({
          color: 'success',
          playerName: '$.winnerName',
          summonerName: '$.winnerSummonerName',
          splinter: '$.winnerSplinter',
        }),
      },
      {
        id: 'loserName',
        title: 'loser',
        cell: PlayerCell({
          color: 'danger',
          playerName: '$.loserName',
          summonerName: '$.loserSummonerName',
          splinter: '$.loserSplinter',
        }),
      },
      {
        id: 'manaCap',
        title: 'Mana',
        width: '60px',
      },
      {
        id: 'leagueName',
        width: '180px',
      },
      {
        id: 'rulesets',
        format: arrayJoin('$.rulesets', ', '),
      },
      {
        id: 'splinters',
        omit: true,
      },
    ],
  });
}

function PlayerCell({ color, playerName, summonerName, splinter }) {
  return Row({
    children: [
      Col({
        className: 'col-auto pr-0',
        children: [
          Image({
            src: switchCase(splinter, SPLINTER_IMAGE_MAP),
          }),
        ],
      }),
      Col({
        children: [
          Row({
            children: [
              Col({
                className: 'col-12',
                children: [
                  Badge({
                    color,
                    children: [
                      Span({
                        className: 'font-small-3',
                        content: summonerName,
                      }),
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
