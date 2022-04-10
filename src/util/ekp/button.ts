import { DefaultProps } from '../default-props';
import { Rpc } from '../rpc';
import { UiElement } from '../ui-element';

/**
 * Creates an Earn Keeper Protocol object with the given properties
 *
 * @param props component properties
 * @returns a ekp component object
 */
export function Button(props?: ButtonProps): UiElement {
  return {
    _type: 'Button',
    props,
  };
}

/**
 * Properties for the {@link Button} component
 */
export type ButtonProps = DefaultProps &
  Readonly<{
    /**
     * @description show a busy spinner inside the button when this expression is true
     * @default undefined
     * @example '$.isLoading'
     */
    busyWhen?: Rpc;
    /**
     * @description the color of the button
     * - uses the vuexy button colors
     * @see https://tinyurl.com/vuexy-buttons
     * @default 'primary'
     * @example 'primary', 'flat-primary', 'gradient-secondary'
     */
    color?: string;
    /**
     * @description show an icon left justified inside the button
     *  - feather icons, core ui linear and core ui brands are supported
     * @see https://feathericons.com/
     * @see https://icons.coreui.io/icons/
     * @default undefined
     * @example 'award' // feather icons
     * @example 'cil-alarm' // coreui icons linear
     * @example 'cib-twitter' // coreui icons brands
     */
    icon?: string | Rpc;
    /**
     * @description override the size of the icon inside the button
     * @default size
     * @example 'sm'
     */
    iconSize?: 'sm' | 'lg' | 'xl';
    /**
     * @description when this button is a child of a {@link Form}, clicking it submits the form
     * @default false
     */
    isSubmit?: boolean;
    /**
     * @description show text content inside the button
     * - can be combined with {@link icon}
     * - caution, if {@link icon} and {@link label} are undefined, an empty button will be shown
     * @default undefined
     * @example 'Save'
     */
    label?: string | Rpc;
    /**
     * @description an {@link Rpc} object to be run when the button is clicked
     * - ignored if {@link isSubmit} is true
     * @default undefined
     * @example { method: 'navigate', params: ['/home'] }
     */
    onClick?: Rpc;
    /**
     * @description show an outlined button instead of a filled button
     * @see https://tinyurl.com/vuexy-buttons
     * @default false
     */
    outline?: boolean;
    /**
     * @description the size of the button, uses vuexy button sizes
     * @see https://tinyurl.com/vuexy-buttons
     * @default undefined // Default
     */
    size?: 'sm' | 'lg';
  }>;
