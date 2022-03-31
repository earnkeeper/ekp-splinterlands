import {
  Button,
  Col,
  collection,
  Container,
  Datatable,
  documents,
  Form,
  formatPercent,
  Fragment,
  Image,
  Input,
  isBusy,
  PageHeaderTile,
  Row,
  Select,
  showModal,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { GameService } from '../../../shared/game';
import { statsCard } from '../../../util/statsCard';
import { DeckDocument } from './deck.document';

const DECK_MODAL_ID = 'splinterlands-deck-modal';

export default function element(): UiElement {
  return Container({
    children: [titleRow(), statsRow(), yourDetailsRow(), decksTable()],
  });
}

function titleRow() {
  return Fragment({
    children: [
      Row({
        className: 'mb-2',
        children: [
          Col({
            className: 'col-auto',
            children: [
              PageHeaderTile({
                title: 'Splinterlands Fantasy Decks',
                icon: 'cil-cart',
              }),
            ],
          }),
        ],
      }),
      Span({
        className: 'd-block mt-1 mb-2 font-small-4',
        content:
          'Add decks from the marketplace or battle planner and check your total cost before buying.',
      }),
    ],
  });
}

function statsRow() {
  return Row({
    children: [
      Col({
        className: 'col-3',
        children: [statsCard('Number of Decks', '$.numberOfDecks')],
      }),
      Col({
        className: 'col-3',
        children: [statsCard('Total Purchase Price', '$.totalPurchasePrice')],
      }),
    ],
  });
}

function yourDetailsRow() {
  return Fragment({
    children: [
      Span({
        className: 'font-weight-bold font-medium-3 d-block',
        content: 'Your Details',
      }),
      Span({
        className: 'd-block mt-1 font-small-3',
        content:
          'Enter some more details below to update the win rate and battle metrics below.',
      }),
      Span({
        className: 'd-block mb-2 font-small-3',
        content:
          'Enter your player name to exclude already owned cards from your purchase cost.',
      }),
      Form({
        name: 'decks',
        schema: {
          type: 'object',
          properties: {
            playerName: 'string',
            manaCap: 'string',
            ruleset: 'string',
            leagueName: 'string',
          },
          default: {
            manaCap: '13',
            ruleset: 'Standard',
            leagueName: 'All',
          },
        },
        child: Row({
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
                  options: ['All', ...GameService.LEAGUES.map((it) => it.name)],
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
                  busyWhen: isBusy(collection(DeckDocument)),
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}

export function decksTable() {
  return Fragment({
    children: [
      Datatable({
        defaultSortFieldId: 'name',
        defaultSortAsc: false,
        data: documents(DeckDocument),
        onRowClicked: showModal(DECK_MODAL_ID, '$'),
        showExport: false,
        showLastUpdated: false,
        columns: [
          {
            id: 'name',
            title: 'Deck Name',
            searchable: true,
          },
          {
            id: 'splinter',
            sortable: true,
            width: '120px',
            cell: Row({
              children: [
                Col({
                  className: 'col-auto pr-0',
                  children: [Image({ src: '$.elementIcon' })],
                }),
                Col({
                  className: 'col-auto',
                  children: [Span({ content: '$.splinter' })],
                }),
              ],
            }),
          },
          {
            id: 'summoner',
            sortable: true,
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
            sortable: true,
            grow: 0,
          },
        ],
      }),
    ],
  });
}
