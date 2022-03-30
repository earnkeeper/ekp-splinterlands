import {
  Avatar,
  Card,
  Col,
  Container,
  Fragment,
  Icon,
  PageHeaderTile,
  Row,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';

export default function element(): UiElement {
  return Container({
    children: [titleRow(), statsRow()],
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
        children: [statsCard('Number of Decks', '$.numberOfDecks')],
      }),
      Col({
        children: [statsCard('Total Purchase Price', '$.totalPurchasePrice')],
      }),
    ],
  });
}

function statsCard(title: string, body: string) {
  return Card({
    children: [
      Row({
        children: [
          Col({
            children: [
              Avatar({
                color: 'primary',
                content: Icon({
                  name: 'award',
                }),
              }),
            ],
          }),
          Col({
            children: [
              Row({
                children: [
                  Col({
                    className: 'col-12',
                    children: [Span({ content: title })],
                  }),
                  Col({
                    className: 'col-12',
                    children: [Span({ content: body })],
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
