import {
  Col,
  collection,
  Container,
  DefaultProps,
  documents,
  formatTimeToNow,
  isBusy,
  jsonArray,
  PageHeaderTile,
  path,
  Row,
  Rpc,
  Span,
  UiElement,
} from '@earnkeeper/ekp-sdk';
import _ from 'lodash';
import { LEAGUES } from '../../../shared/game';
import { statsCard } from '../../../util';
import { commify } from '../../../util/rpc/commify.rpc';
import { BattlesByLeagueDocument } from './battles-by-league.document';
import { BattlesByManaCapDocument } from './battles-by-mana-cap.document';
import { BattlesByTimestampDocument } from './battles-by-timestamp.document';
import { StatsViewBagDocument } from './stats-view-bag.document';

export default function element(): UiElement {
  return Container({
    children: [TitleRow(), IntroRow(), statsRow(), Charts()],
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

function statsRow() {
  return Row({
    className: 'mt-2',
    context: `${path(StatsViewBagDocument)}[0]`,
    children: [
      Col({
        className: 'col-auto',
        children: [statsCard('Total Battles', commify('$.totalBattles'))],
      }),
      Col({
        className: 'col-auto',
        children: [
          statsCard('Oldest Battle', formatTimeToNow('$.oldestBattle')),
        ],
      }),
      Col({
        className: 'col-auto',
        children: [
          statsCard('Latest Battle', formatTimeToNow('$.latestBattle')),
        ],
      }),
    ],
  });
}

function Charts() {
  return Row({
    children: [
      Col({
        className: 'col-12 mt-1',
        children: [BattlesByLeagueChart()],
      }),
      Col({
        className: 'col-12 mt-1',
        children: [BattlesByTimestampChart()],
      }),
      Col({
        className: 'col-12 mt-1',
        children: [BattlesByManaCapChart()],
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
          formatter: commify('$'),
        },
      },
      xaxis: {
        categories: _.chain(LEAGUES)
          .map((it) => it.group)
          .uniq()
          .value(),
      },
    },
    series: [
      {
        name: 'From Transactions',
        data: {
          method: 'map',
          params: [
            jsonArray(documents(BattlesByLeagueDocument)),
            '$.fromTransactions',
          ],
        },
      },
      {
        name: 'From Player History',
        data: {
          method: 'map',
          params: [
            jsonArray(documents(BattlesByLeagueDocument)),
            '$.fromPlayerHistory',
          ],
        },
      },
    ],
  });
}

function BattlesByManaCapChart() {
  return Chart({
    title: 'Battles By Mana Cap',
    type: 'bar',
    height: 400,
    busyWhen: isBusy(collection(BattlesByManaCapDocument)),
    data: documents(BattlesByManaCapDocument),
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
          formatter: commify('$'),
        },
      },
      xaxis: {
        categories: {
          method: 'map',
          params: [jsonArray(documents(BattlesByManaCapDocument)), '$.manaCap'],
        },
      },
    },
    series: [
      {
        name: 'From Transactions',
        data: {
          method: 'map',
          params: [
            jsonArray(documents(BattlesByManaCapDocument)),
            '$.fromTransactions',
          ],
        },
      },
      {
        name: 'From Player History',
        data: {
          method: 'map',
          params: [
            jsonArray(documents(BattlesByManaCapDocument)),
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
            {
              method: 'sortBy',
              params: [
                jsonArray(documents(BattlesByTimestampDocument)),
                '$.timestamp',
              ],
            },
            {
              method: 'momentFormatFromUnix',
              params: ['$.timestamp', 'Do MMM'],
            },
          ],
        },
      },
      yaxis: {
        labels: {
          formatter: commify('$'),
        },
      },
    },
    series: [
      {
        name: 'From Transactions',
        data: {
          method: 'map',
          params: [
            {
              method: 'sortBy',
              params: [
                jsonArray(documents(BattlesByTimestampDocument)),
                '$.timestamp',
              ],
            },
            '$.fromTransactions',
          ],
        },
      },
      {
        name: 'From Player History',
        data: {
          method: 'map',
          params: [
            {
              method: 'sortBy',
              params: [
                jsonArray(documents(BattlesByTimestampDocument)),
                '$.timestamp',
              ],
            },
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
