import {
  Col,
  collection,
  Container,
  Datatable,
  documents,
  formatPercent,
  isBusy,
  PageHeaderTile,
  Row,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { GameService } from '../../../shared/game';
import { TeamSummaryDocument } from './team-summary.document';

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
                title: 'Splinterlands Team Guide',
                icon: 'cil-people',
              }),
            ],
          }),
        ],
      }),
      teamRow(),
    ],
  });
}

function teamRow(): UiElement {
  return Datatable({
    defaultSortFieldId: 'winpc',
    defaultSortAsc: false,
    data: documents(TeamSummaryDocument),
    isBusy: isBusy(collection(TeamSummaryDocument)),
    filterable: true,
    columns: [
      {
        id: 'splinter',
        sortable: true,
        filterable: true,
        filterOptions: GameService.SPLINTERS,
      },
      {
        id: 'summoner',
        sortable: true,
        filterable: true,
      },
      {
        id: 'monsters',
        sortable: true,
        filterable: true,
      },
      {
        id: 'mana',
        sortable: true,
        filterable: true,
      },
      {
        id: 'battles',
        sortable: true,
      },
      {
        id: 'winpc',
        label: formatPercent('$.winpc'),
        sortable: true,
      },
    ],
  });
}
