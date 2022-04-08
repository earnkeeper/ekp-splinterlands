import {
  Button,
  Col,
  collection,
  Container,
  documents,
  Form,
  formatAge,
  formatCurrency,
  formatPercent,
  formatTemplate,
  formatToken,
  Fragment,
  GridTile,
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
import {
  LEAGUE_GROUPS,
  MANA_CAPS,
  RULESET_IMAGE_MAP,
} from '../../../shared/game';
import {
  DEFAULT_BATTLE_FORM,
  promptDeckNameModal,
  SPLINTER_IMAGE_MAP,
  teamModal,
  TEAM_MODAL_ID,
} from '../../../util';
import { arrayJoin } from '../../../util/ekp/arrayJoin.rpc';
import { Datatable } from '../../../util/ekp/datatable';
import { switchCase } from '../../../util/ekp/switchCase.rpc';
import { imageLabelCell } from '../../../util/ui/imageLabelCell';
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
                title: 'Battle Planner',
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
          'Enter the details of your next match, to see which teams have been winning the most recently.',
      }),
      Span({
        className: 'd-block mt-1 mb-2 font-small-3',
        content:
          'Player Name is optional, enter this to set the price of already owned cards to zero. Decks with a cost of zero you already own',
      }),
      Form({
        name: 'planner',
        schema: {
          type: 'object',
          properties: {
            playerName: 'string',
            manaCap: 'number',
            ruleset: 'string',
            leagueGroup: 'string',
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
                    name: 'leagueGroup',
                    options: ['All', ...LEAGUE_GROUPS.map((it) => it.name)],
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
                    options: MANA_CAPS,
                    minWidth: 80,
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
        defaultSortFieldId: 'battles',
        defaultSortAsc: false,
        data: documents(PlannerDocument),
        busyWhen: isBusy(collection(PlannerDocument)),
        onRowClicked: showModal(TEAM_MODAL_ID, '$'),
        pointerOnHover: true,
        showExport: false,
        filters: [
          {
            columnId: 'splinter',
            type: 'checkbox',
            imageMap: SPLINTER_IMAGE_MAP,
          },
          {
            columnId: 'rulesets',
            type: 'checkbox',
            imageMap: RULESET_IMAGE_MAP,
          },
          {
            columnId: 'owned',
            type: 'radio',
          },
          {
            columnId: 'battles',
            type: 'radio',
            allowCustomOption: true,
            options: [
              {
                label: 'All',
              },
              {
                label: '> 50',
                query: '> 50',
              },
            ],
          },

          {
            columnId: 'winpc',
            type: 'radio',
            allowCustomOption: true,
            options: [
              {
                label: 'All',
              },
              {
                label: '> 50 %',
                query: '> 50',
              },
              {
                label: '> 75 %',
                query: '> 75',
              },
            ],
          },
        ],
        defaultView: {
          xs: 'grid',
          lg: 'column',
        },
        gridView: {
          tileWidth: [12, 6, 4, 3],
          tile: GridTile({
            image: Image({
              className: 'card-img-top',
              src: '$.summonerCardImg',
            }),
            details: [
              {
                label: 'Cost',
                value: formatCurrency('$.price', '$.fiatSymbol'),
              },
              {
                label: 'Battles',
                value: formatToken('$.battles'),
              },
              {
                label: 'Mana',
                value: '$.mana',
              },
              {
                label: 'Monsters',
                value: '$.monsterCount',
              },
              {
                label: 'Win Rate',
                value: formatPercent('$.winpc'),
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
            id: 'splinter',
            sortable: true,
            width: '120px',
            cell: imageLabelCell(
              switchCase('$.splinter', SPLINTER_IMAGE_MAP),
              '$.splinter',
            ),
          },
          {
            id: 'summonerName',
            sortable: true,
            title: 'Summoner',
            searchable: true,
          },
          {
            id: 'rulesets',
            format: arrayJoin('$.rulesets', ', '),
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
          {
            id: 'owned',
            title: 'Owned Already',
            omit: true,
          },
        ],
      }),
    ],
  });
}
