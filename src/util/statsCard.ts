import { Avatar, Card, Col, Row, Rpc, Span } from '@earnkeeper/ekp-sdk';

export function statsCard(title: string, body: string | Rpc) {
  return Card({
    children: [
      Row({
        children: [
          Col({
            className: 'col-auto',
            children: [
              Avatar({
                icon: 'award',
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
                    className: 'col-12 font-medium-5 font-weight-bold',
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
