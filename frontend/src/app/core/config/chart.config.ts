import type {ApexOptions} from 'ng-apexcharts';

export const WEIGHT_CHART_CONFIG: Partial<ApexOptions> = {
  chart: {
    type: 'area',
    height: 280,
    fontFamily: 'inherit',
    toolbar: {show: true},
    zoom: {enabled: true},
    background: 'transparent',
    animations: {enabled: true}
  },

  colors: ['#10b981'],

  dataLabels: {enabled: true},

  stroke: {curve: 'smooth', width: 3, colors: ['#059669']},

  xaxis: {
    type: 'datetime',
    tooltip: {enabled: false},
    axisBorder: {show: false},
    axisTicks: {show: false},
    labels: {style: {colors: '#9ca3af', fontSize: '12px'}}
  },
  yaxis: {
    show: true,
    labels: {
      style: {colors: '#9ca3af', fontSize: '12px'},
      formatter: (value) => value.toFixed(1)
    }
  },

  markers: {
    size: 0,
    colors: ['#10b981'],
    strokeColors: '#ffffff',
    strokeWidth: 2,
    hover: {
      size: 6
    }
  },

  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 100],
      colorStops: [
        {offset: 0, color: "#10b981", opacity: 0.2},
        {offset: 100, color: "#10b981", opacity: 0}
      ]
    }
  },
  grid: {
    borderColor: '#f3f4f6',
    strokeDashArray: 4,
    padding: {top: 0, right: 20, bottom: 0, left: 10}
  },
  tooltip: {
    theme: 'light',
    marker: {
      show: true,
      fillColors: ['#10b981'],
    },
    y: {formatter: (value) => `${value} kg`}
  },
};
