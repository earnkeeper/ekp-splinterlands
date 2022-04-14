import {
  Card,
  Col,
  Container,
  DefaultProps,
  formatToken,
  PageHeaderTile,
  path,
  Row,
  Rpc,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import _ from 'lodash';
import { LEAGUES } from '../../../shared/game';
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
                type: 'bar',
                height: 400,
                options: {
                  chart: {
                    stacked: true,
                    toolbar: {
                      show: false,
                    },
                  },
                  dataLabels: {
                    enabled: false,
                  },
                  yaxis: {
                    labels: {
                      formatter: formatToken('$'),
                    },
                  },
                  xaxis: {
                    categories: _.chain(LEAGUES)
                      .map((it) => it.name)
                      .value(),
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
                        '$.battles',
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
                        '$.battles',
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
  height?: number;
  series: SeriesProp[];
  options?: any;
}> &
  DefaultProps;

type SeriesProp = Readonly<{
  name: string | Rpc;
  data: Rpc;
}>;
