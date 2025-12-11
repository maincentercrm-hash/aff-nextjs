import React from 'react';

import dynamic from 'next/dynamic';

import type { ApexOptions } from 'apexcharts';

// Import ApexCharts แบบ dynamic เพื่อหลีกเลี่ยงปัญหา SSR
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface GraphDataProps {
  data: {
    categories: string[];
    series: {
      name: string;
      data: number[];
      color: string;
    }[];
  };
}

const GraphData: React.FC<GraphDataProps> = ({ data }) => {
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'bar',
      toolbar: {
        show: false
      }
    },
    colors: data.series.map(s => s.color),
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      }
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: '#f1f1f1',
      padding: {
        bottom: 10
      }
    },
    xaxis: {
      categories: data.categories,
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {

          colors: '#666'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val.toFixed(0),
        style: {

          colors: '#666'
        }
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (value) {
          return value.toFixed(0);
        }
      },

    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 0,
      labels: {
        colors: '#666'
      }
    }
  };

  return (
    <div className="h-[400px] w-full p-4">
      <ReactApexChart
        options={options}
        series={data.series}
        type="bar"
        height={350}
      />
    </div>
  );
};



export default GraphData;
