import ReactECharts from 'echarts-for-react';

export function MiniLine({ data, color = '#00d4ff', height = 40 }) {
  const option = {
    grid: { top: 4, right: 4, bottom: 4, left: 4 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'line', data, smooth: true, symbol: 'none', lineStyle: { width: 1.5, color },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: color + '40' }, { offset: 1, color: 'transparent' }] } }
    }],
    tooltip: { show: false }
  };
  return <ReactECharts option={option} style={{ height, width: '100%' }} opts={{ renderer: 'svg' }} />;
}

export function MiniBar({ data, color = '#00d4ff', height = 40 }) {
  const option = {
    grid: { top: 4, right: 4, bottom: 4, left: 4 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [{ type: 'bar', data, barWidth: '60%', itemStyle: { color, borderRadius: [2, 2, 0, 0] } }],
    tooltip: { show: false }
  };
  return <ReactECharts option={option} style={{ height, width: '100%' }} opts={{ renderer: 'svg' }} />;
}
