import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import PanelCard from '../../components/common/PanelCard';
import DataCard from '../../components/common/DataCard';
import MapView from '../../components/common/MapView';
import { fourColorWarningData } from '../../data/mockData';

const chartBase = {
  backgroundColor: 'transparent',
  textStyle: { color: '#94a3b8', fontSize: 11 },
  grid: { left: 50, right: 20, top: 20, bottom: 30 },
};

export default function useFourColorWarning() {
  const {
    districtScores,
    roadRisk,
    vehicleHazardItems,
    accidents,
    driverHazardItems,
    accidentCauses,
    accidentHeatmap,
  } = fourColorWarningData;

  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // 1. 四色预警评分 - Table
  const scoreTable = (
    <div style={{ position: 'relative' }}>
      <table style={{ width: '100%', fontSize: '.78rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border-dim)' }}>
            <th style={{ padding: '8px 6px', textAlign: 'left' }}>区县</th>
            <th style={{ padding: '8px 6px', textAlign: 'right' }}>得分</th>
            <th style={{ padding: '8px 6px', textAlign: 'center', width: 60 }}>预警</th>
          </tr>
        </thead>
        <tbody>
          {districtScores.map((d) => (
            <tr
              key={d.name}
              style={{ borderBottom: '1px solid rgba(0,212,255,.06)' }}
              onMouseEnter={() => setHoveredDistrict(d.name)}
              onMouseLeave={() => setHoveredDistrict(null)}
            >
              <td style={{ padding: '8px 6px', color: 'var(--text-primary)' }}>{d.name}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>{d.score}</td>
              <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                <span style={{
                  display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                  background: d.color, boxShadow: `0 0 6px ${d.color}`,
                }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hoveredDistrict && (() => {
        const d = districtScores.find(x => x.name === hoveredDistrict);
        if (!d) return null;
        return (
          <div style={{
            position: 'absolute', top: 0, right: -10, transform: 'translateX(100%)',
            background: 'rgba(5,11,26,.95)', border: '1px solid rgba(0,212,255,.3)',
            borderRadius: 6, padding: '10px 14px', fontSize: '.75rem', color: '#e2e8f0',
            zIndex: 20, minWidth: 160, boxShadow: '0 4px 20px rgba(0,0,0,.5)',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: d.color }}>{d.name} 扣分详情</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: '.72rem' }}>
              <span>人: <b style={{color:'var(--red)'}}>-{d.deductions.person}</b></span>
              <span>车: <b style={{color:'var(--red)'}}>-{d.deductions.vehicle}</b></span>
              <span>路: <b style={{color:'var(--red)'}}>-{d.deductions.road}</b></span>
              <span>企业: <b style={{color:'var(--red)'}}>-{d.deductions.enterprise}</b></span>
              <span>事故: <b style={{color:'var(--red)'}}>-{d.deductions.accident}</b></span>
              <span>站点: <b style={{color:'var(--red)'}}>-{d.deductions.station}</b></span>
            </div>
          </div>
        );
      })()}
    </div>
  );

  // 2. 车辆隐患 - Grouped bar chart
  const vehicleHazardOpt = {
    ...chartBase,
    legend: { data: ['总数', '新增', '已整改'], textStyle: { color: '#94a3b8' }, top: 0 },
    xAxis: { type: 'category', data: vehicleHazardItems.map((d) => d.name), axisLabel: { color: '#94a3b8', rotate: 25 } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.1)' } } },
    series: [
      { name: '总数', type: 'bar', data: vehicleHazardItems.map((d) => d.total), itemStyle: { color: '#00d4ff' }, barGap: 0 },
      { name: '新增', type: 'bar', data: vehicleHazardItems.map((d) => d.added), itemStyle: { color: '#f59e0b' }, barGap: 0 },
      { name: '已整改', type: 'bar', data: vehicleHazardItems.map((d) => d.resolved), itemStyle: { color: '#22c55e' }, barGap: 0 },
    ],
  };

  // 3. 驾驶人隐患 - 3 DataCards + stacked bar
  const driverStackData = driverHazardItems.flatMap((d) => [d.a, d.b]);
  const driverHazardOpt = {
    ...chartBase,
    legend: { data: ['A证', 'B证'], textStyle: { color: '#94a3b8' }, top: 0 },
    xAxis: { type: 'category', data: driverHazardItems.map((d) => d.name), axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.1)' } } },
    series: [
      { name: 'A证', type: 'bar', stack: 'total', data: driverHazardItems.map((d) => d.a), itemStyle: { color: '#00d4ff' } },
      { name: 'B证', type: 'bar', stack: 'total', data: driverHazardItems.map((d) => d.b), itemStyle: { color: '#22c55e' } },
    ],
  };

  // 4. 道路隐患风险 - Donut chart
  const roadRiskOpt = {
    ...chartBase,
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['50%', '55%'],
      data: roadRisk.map((r) => ({ ...r, label: { color: '#94a3b8' } })),
      label: { formatter: '{b}\n{c}%', color: '#94a3b8', fontSize: 10 },
    }],
  };

  // 5. 交通事故趋势 - Dual line chart
  const accidentTrendOpt = {
    ...chartBase,
    legend: { data: ['伤亡事故', '财损事故'], textStyle: { color: '#94a3b8' }, top: 0 },
    xAxis: { type: 'category', data: accidents.monthly.map((m) => m.month), axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.1)' } } },
    series: [
      { name: '伤亡事故', type: 'line', data: accidents.monthly.map((m) => m.injury), smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#ef4444' }, lineStyle: { color: '#ef4444' } },
      { name: '财损事故', type: 'line', data: accidents.monthly.map((m) => m.property), smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#3b82f6' }, lineStyle: { color: '#3b82f6' } },
    ],
  };

  // 6. 事故原因分析 - Nightingale/Rose chart
  const causeOpt = {
    ...chartBase,
    series: [{
      type: 'pie', radius: [20, 100], center: ['50%', '50%'], roseType: 'area',
      data: accidentCauses.map((c, i) => ({
        value: c.value,
        name: c.name,
        itemStyle: { color: ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#64748b'][i % 7] },
      })),
      label: { color: '#94a3b8', fontSize: 10 },
    }],
  };

  const districtColors = districtScores.map((d) => ({ name: d.name, score: d.score, color: d.color }));

  const leftPanel = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: '.8rem', color: '#94a3b8' }}>数据月份：</span>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#00d4ff', borderRadius: 4, padding: '4px 8px', fontSize: '.8rem' }}
        >
          {Array.from({length: 12}, (_, i) => (
            <option key={i} value={i}>{i + 1}月</option>
          ))}
        </select>
      </div>
      <PanelCard title="四色预警评分">
        {scoreTable}
      </PanelCard>
      <PanelCard title="车辆隐患">
        <ReactECharts option={vehicleHazardOpt} style={{ height: 220 }} opts={{ renderer: 'canvas' }} />
      </PanelCard>
      <PanelCard title="驾驶人隐患">
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <DataCard title="逾期未换证" value={driverHazardItems[0].total} color="var(--accent)" mini />
          <DataCard title="逾期未审验" value={driverHazardItems[1].total} color="var(--orange)" mini />
          <DataCard title="满分未学习" value={driverHazardItems[2].total} color="var(--red)" mini />
        </div>
        <ReactECharts option={driverHazardOpt} style={{ height: 160 }} opts={{ renderer: 'canvas' }} />
      </PanelCard>
    </>
  );

  const rightPanel = (
    <>
      <PanelCard title="道路隐患风险">
        <ReactECharts option={roadRiskOpt} style={{ height: 200 }} opts={{ renderer: 'canvas' }} />
      </PanelCard>
      <PanelCard title="交通事故趋势">
        <ReactECharts option={accidentTrendOpt} style={{ height: 200 }} opts={{ renderer: 'canvas' }} />
      </PanelCard>
      <PanelCard title="事故原因分析">
        <ReactECharts option={causeOpt} style={{ height: 220 }} opts={{ renderer: 'canvas' }} />
      </PanelCard>
    </>
  );

  const mapContent = (
    <MapView
      districtColors={districtColors}
      heatmapData={accidentHeatmap}
    />
  );

  return { leftPanel, rightPanel, mapContent };
}
