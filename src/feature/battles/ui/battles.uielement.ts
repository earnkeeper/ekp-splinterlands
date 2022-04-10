import {
  Button,
  Col,
  collection,
  Container,
  documents,
  formatAge,
  isBusy,
  Row,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { Datatable } from '../../../util/ekp/datatable';
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
        className: 'col-auto my-auto pr-0',
        children: [
          Button({
            className: 'pr-0',
            icon: 'cil-chevron-left',
            color: 'flat-primary',
          }),
        ],
      }),
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
    columns: [
      {
        id: 'timestamp',
        sortable: true,
        format: formatAge('$.timestamp'),
      },
      {
        id: 'winnerName',
        title: 'winner',
      },
      {
        id: 'loserName',
        title: 'loser',
      },
    ],
  });
}