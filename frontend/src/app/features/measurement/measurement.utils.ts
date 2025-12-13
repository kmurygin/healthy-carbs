import {UserMeasurement} from "@core/services/user-measurement/user-measurement.service";
import {ChartOptions} from "@core/models/chart-options.model";

export function getSeriesData(data: UserMeasurement[], key: keyof UserMeasurement): [number, number][] {
  return data
    .map(item => {
      const value = item[key];
      return (typeof value === 'number')
        ? [new Date(item.date).getTime(), value]
        : null;
    })
    .filter((point): point is [number, number] => point !== null)
    .sort(
      (firstPoint, secondPoint) => firstPoint[0] - secondPoint[0]
    );
}

export function createChartOptions(
  label: string,
  unit: string,
  color: string,
  data: [number, number][]
): Partial<ChartOptions> {
  return {
    series: [{name: label, data}],
    chart: {type: 'area', height: 300, toolbar: {show: true}, animations: {enabled: true}},
    stroke: {curve: 'smooth', width: 2, colors: [color]},
    markers: {size: 4, colors: [color], strokeColors: '#fff'},
    xaxis: {type: 'datetime', tooltip: {enabled: false}},
    yaxis: {labels: {formatter: (val) => val.toFixed(1)}, title: {text: unit}},
    tooltip: {x: {format: 'dd MMM yyyy'}},
    grid: {borderColor: '#f3f4f6'},
    title: {text: label, style: {fontSize: '16px', fontWeight: '600'}}
  };
}
