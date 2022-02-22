import marketplace from '../marketplace/marketplace.uielement';

export default function pages() {
  return [
    {
      id: `${process.env.EKP_PLUGIN_ID}/marketplace`,
      element: marketplace(),
    },
  ];
}
