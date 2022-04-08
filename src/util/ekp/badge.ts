import { DefaultProps, Rpc, UiElement } from '@earnkeeper/ekp-sdk';

export function Badge(props?: BadgeProps): UiElement {
  return {
    _type: 'Badge',
    props,
  };
}

export interface BadgeProps extends DefaultProps {
  color: string | Rpc;
  children: UiElement[];
}
