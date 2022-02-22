export default function menus() {
  return [
    {
      id: `${process.env.EKP_PLUGIN_ID}`,
      title: 'Marketplace',
      navLink: `${process.env.EKP_PLUGIN_ID}/marketplace`,
      icon: 'cil-cart',
    },
  ];
}
