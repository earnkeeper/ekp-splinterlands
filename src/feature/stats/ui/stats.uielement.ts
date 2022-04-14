import {
  Col,
  Container,
  PageHeaderTile,
  Row,
  UiElement,
} from '@earnkeeper/ekp-sdk';

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
                title: 'Database Statistics',
                icon: 'cil-chart',
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
