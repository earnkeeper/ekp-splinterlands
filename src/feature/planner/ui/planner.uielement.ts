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
  PageHeaderTile,
  path,
  Row,
  Select,
  showModal,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { GameService } from '../../../shared/game';
import { promptDeckNameModal, teamModal, TEAM_MODAL_ID } from '../../../util';
import { DEFAULT_BATTLE_FORM } from '../../../util/constants';
import { PlannerViewBag } from './planner-view-bag.document';
import { PlannerDocument } from './planner.document';

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
            manaCap: 'number',
            ruleset: 'string',
            leagueName: 'string',
          },
          default: DEFAULT_BATTLE_FORM,
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
        pointerOnHover: true,
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
                  children: [Image({ src: '$.splinterIcon' })],
                }),
                Col({
                  className: 'col-auto',
                  children: [Span({ content: '$.splinter' })],
                }),
              ],
            }),
          },
          {
            id: 'summonerName',
            sortable: true,
            title: 'Summoner',
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
