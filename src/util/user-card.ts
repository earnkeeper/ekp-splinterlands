import { Avatar, Card, Col, Row, Rpc, Span } from '@earnkeeper/ekp-sdk';

export function userCard(title: string) {
  return Card({
    children: [
      Row({
        className: 'px-2 py-1',
        children: [
          Col({
            className: 'col-auto my-auto',
            children: [
              Avatar({
                icon: 'theme',
                size: 'sm',
              }),
            ],
          }),
          Col({
            className: 'col-auto pr-2',
            children: [
              Span({ className: 'd-block', content: title }),
              
            ],
          }),
        
        ],
      }),
    ],
  });
}
