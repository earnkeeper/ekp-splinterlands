import { Rpc } from '@earnkeeper/ekp-sdk';

export function commify(value: number | Rpc): Rpc {
  return {
    method: 'commify',
    params: [value],
  };
}
