import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from "ng-apexcharts";

export interface ChartOptions {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries,
  chart: ApexChart,
  xaxis: ApexXAxis,
  yaxis: ApexYAxis,
  fill: ApexFill,
  dataLabels: ApexDataLabels,
  grid: ApexGrid,
  stroke: ApexStroke,
  markers: ApexMarkers,
  title: ApexTitleSubtitle,
  tooltip: ApexTooltip,
  labels: string[],
  colors: string[],
  legend: ApexLegend,
  plotOptions: ApexPlotOptions
}
