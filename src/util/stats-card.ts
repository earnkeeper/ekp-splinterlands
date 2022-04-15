import { Avatar, Card, Col, Row, Rpc, Span } from '@earnkeeper/ekp-sdk';

export function statsCard(title: string, body: string | Rpc) {
  return Card({
    children: [
      Row({
        className: 'px-2 py-1',
        children: [
          Col({
            className: 'col-auto my-auto',
            children: [
              Avatar({
                icon: 'award',
                size: 'sm',
              }),
            ],
          }),
          Col({
            className: 'col-auto pr-2',
            children: [
              Span({ className: 'd-block font-small-3', content: title }),
              Span({
                className: 'd-block font-small-4 font-weight-bold',
                content: body,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
