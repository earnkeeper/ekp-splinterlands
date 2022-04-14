import {
  Card,
  Col,
  Container,
  DefaultProps,
  PageHeaderTile,
  path,
  Row,
  Rpc,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import { BattlesByLeagueDocument } from './battles-by-league.document';

export default function element(): UiElement {
  return Container({
    children: [TitleRow(), IntroRow(), Charts()],
  });
}

function TitleRow() {
  return Row({
    className: 'mb-2',
    children: [
      Col({
        className: 'col-auto',
        children: [
          PageHeaderTile({
            title: 'Database Statistics',
            icon: 'cil-chart',
          }),
        ],
      }),
    ],
  });
}

function IntroRow() {
  return Span({
    content:
      'The charts and numbers below show the current state of our battle synchronization, we use it to make sure we are getting good battle coverage, so you can use it too!',
  });
}

function Charts() {
  return Row({
    children: [
      Col({
        className: 'col-12 mt-2',
        children: [
          Card({
            // @ts-ignore
            title: 'Battles By League',
            children: [
              Chart({
                className: 'mr-1',
                type: 'scatter',
                height: 400,
                options: {
                  chart: {
                    toolbar: {
                      show: false,
                    },
                  },
                },
                series: [
                  {
                    name: 'From Transactions',
                    data: {
                      method: 'map',
                      params: [
                        `${path(
                          BattlesByLeagueDocument,
                        )}[?(@.source == 'transaction')]`,
                        ['$.leagueNumber', '$.battles'],
                      ],
                    },
                  },
                  {
                    name: 'From Player History',
                    data: {
                      method: 'map',
                      params: [
                        `${path(
                          BattlesByLeagueDocument,
                        )}[?(@.source == 'playerHistory')]`,
                        ['$.leagueNumber', '$.battles'],
                      ],
                    },
                  },
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function Chart(props?: ChartProps): UiElement {
  return {
    _type: 'Chart',
    props,
  };
}

type ChartProps = Readonly<{
  type: string;
  series: SeriesProp[];
  options?: any;
  height?: number;
}> &
  DefaultProps;

type SeriesProp = Readonly<{
  name: string | Rpc;
  data: Rpc;
}>;
