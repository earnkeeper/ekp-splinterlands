import { Col, Image, Row, Rpc, Span } from '@earnkeeper/ekp-sdk';

export function imageLabelCell(src: Rpc, content: Rpc) {
  return Row({
    children: [
      Col({
        className: 'col-auto pr-0 my-auto',
        children: [
          Image({
            src,
            size: '12px',
          }),
        ],
      }),
      Col({
        className: 'my-auto',
        children: [
          Span({
            content,
          }),
        ],
      }),
    ],
  });
}
