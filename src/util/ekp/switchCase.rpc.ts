import { Rpc } from '@earnkeeper/ekp-sdk';

export function switchCase(on: Rpc, cases: Record<string, string | Rpc>): Rpc {
  return {
    method: 'switchCase',
    params: [on, cases],
  };
}
