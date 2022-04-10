import { Rpc } from '@earnkeeper/ekp-sdk';

export function navigate(
  location: string | Rpc,
  newTab: boolean | Rpc = false,
  external: boolean | Rpc = false,
): Rpc {
  return {
    method: 'navigate',
    params: [location, newTab, external, process.env.EKP_PLUGIN_ID],
  };
}
