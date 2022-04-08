import { Rpc } from '@earnkeeper/ekp-sdk';

export function arrayJoin(array: string[] | Rpc, character: string): Rpc {
  return {
    method: 'arrayJoin',
    params: [array, character],
  };
}
