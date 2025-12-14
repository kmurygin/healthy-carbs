import type {ApexOptions, ApexYAxis} from "ng-apexcharts";

const CHART_THEME = {
  primary: '#10b981', // emerald-500
  stroke: '#059669',  // emerald-600
  text: '#9ca3af',    // gray-400
  grid: '#f3f4f6',    // gray-100
  white: '#ffffff'
};

const BASE_CHART_CONFIG: Partial<ApexOptions> = {
  chart: {
    type: 'area',
    fontFamily: 'inherit',
    toolbar: {show: true},
    zoom: {enabled: true},
    background: 'transparent',
    animations: {enabled: true}
  },
  colors: [CHART_THEME.primary],
  stroke: {curve: 'smooth', width: 3, colors: [CHART_THEME.stroke]},
  markers: {
    size: 0,
    colors: [CHART_THEME.primary],
    strokeColors: CHART_THEME.white,
    strokeWidth: 2,
    hover: {size: 6}
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 100],
      colorStops: [
        {offset: 0, color: CHART_THEME.primary, opacity: 0.2},
        {offset: 100, color: CHART_THEME.primary, opacity: 0}
      ]
    }
  },
  grid: {
    borderColor: CHART_THEME.grid,
    strokeDashArray: 4,
    padding: {top: 10, right: 10, bottom: 0, left: 10}
  },
  xaxis: {
    type: 'datetime',
    tooltip: {enabled: false},
    axisBorder: {show: false},
    axisTicks: {show: false},
    labels: {style: {colors: CHART_THEME.text, fontSize: '11px'}}
  },
  yaxis: {
    show: true,
    labels: {
      style: {colors: CHART_THEME.text, fontSize: '11px'},
      formatter: (value) => value.toFixed(1)
    }
  },
  tooltip: {
    theme: 'light',
    marker: {show: true, fillColors: [CHART_THEME.primary]},
  }
};

export const WEIGHT_CHART_CONFIG: Partial<ApexOptions> = {
  ...BASE_CHART_CONFIG,
  chart: {
    ...(BASE_CHART_CONFIG.chart ?? {}),
    height: 280,
    type: 'area'
  },
  dataLabels: {enabled: true},
  xaxis: {
    ...BASE_CHART_CONFIG.xaxis,
    labels: {style: {colors: CHART_THEME.text, fontSize: '12px'}}
  },
  yaxis: {
    ...(BASE_CHART_CONFIG.yaxis as ApexYAxis),
    labels: {
      style: {colors: CHART_THEME.text, fontSize: '12px'},
      formatter: (value) => value.toFixed(1)
    }
  },
  tooltip: {
    ...BASE_CHART_CONFIG.tooltip,
    y: {formatter: (value) => `${value} kg`}
  }
};

export function getMeasurementChartOptions(
  label: string,
  unit: string,
  seriesData: [number, number][]
): ApexOptions {
  return {
    ...BASE_CHART_CONFIG,
    chart: {
      ...(BASE_CHART_CONFIG.chart ?? {}),
      height: 300,
      type: 'area'
    },
    series: [{name: label, data: seriesData}],
    dataLabels: {enabled: false},
    yaxis: {
      ...(BASE_CHART_CONFIG.yaxis as ApexYAxis),
      title: {
        text: unit,
        style: {color: CHART_THEME.text, fontSize: '10px'}
      }
    },
    tooltip: {
      ...BASE_CHART_CONFIG.tooltip,
      y: {formatter: (val) => `${val} ${unit}`}
    }
  };
}
