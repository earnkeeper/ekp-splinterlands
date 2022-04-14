import {
  Col,
  collection,
  Container,
  DefaultProps,
  documents,
  formatToken,
  isBusy,
  PageHeaderTile,
  Row,
  Rpc,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import _ from 'lodash';
import { LEAGUES } from '../../../shared/game';
import { BattlesByLeagueDocument } from './battles-by-league.document';
import { BattlesByTimestampDocument } from './battles-by-timestamp.document';

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
        children: [BattlesByLeagueChart()],
      }),
      Col({
        className: 'col-12 mt-2',
        children: [BattlesByTimestampChart()],
      }),
    ],
  });
}

function BattlesByLeagueChart() {
  return Chart({
    title: 'Battles By League',
    type: 'bar',
    height: 400,
    busyWhen: isBusy(collection(BattlesByLeagueDocument)),
    data: documents(BattlesByLeagueDocument),
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
            `${documents(BattlesByLeagueDocument)}`,
            '$.fromTransactions',
          ],
        },
      },
      {
        name: 'From Player History',
        data: {
          method: 'map',
          params: [
            `${documents(BattlesByLeagueDocument)}`,
            '$.fromPlayerHistory',
          ],
        },
      },
    ],
  });
}

function BattlesByTimestampChart() {
  return Chart({
    title: 'Battles By Timestamp',
    type: 'area',
    height: 400,
    busyWhen: isBusy(collection(BattlesByTimestampDocument)),
    data: documents(BattlesByTimestampDocument),
    options: {
      chart: {
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: {
          method: 'map',
          params: [
            `${documents(BattlesByTimestampDocument)}`,
            {
              method: 'momentFormatFromUnix',
              params: ['$.timestamp', 'Do MMM'],
            },
          ],
        },
      },
      yaxis: {
        labels: {
          formatter: formatToken('$'),
        },
      },
    },
    series: [
      {
        name: 'From Transactions',
        data: {
          method: 'map',
          params: [
            `${documents(BattlesByTimestampDocument)}`,
            '$.fromTransactions',
          ],
        },
      },
      {
        name: 'From Player History',
        data: {
          method: 'map',
          params: [
            `${documents(BattlesByTimestampDocument)}`,
            '$.fromPlayerHistory',
          ],
        },
      },
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
  title: string;
  type: string;
  height?: number;
  busyWhen?: Rpc;
  data?: Rpc;
  series: SeriesProp[];
  options?: any;
}> &
  DefaultProps;

type SeriesProp = Readonly<{
  name: string | Rpc;
  data: Rpc;
}>;
