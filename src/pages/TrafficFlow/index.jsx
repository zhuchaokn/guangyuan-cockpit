import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import PanelCard from '../../components/common/PanelCard';
import DataCard from '../../components/common/DataCard';
import MapView from '../../components/common/MapView';
import { trafficFlowData } from '../../data/mockData';

const CHART_COLORS = { current: '#00d4ff', lastYear: '#64748b' };

export default function useTrafficFlow() {
  const { monthlyFlow, yearTotal, monthAvg, topIntersections } = trafficFlowData;

  const flowChartOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8', fontFamily: 'Noto Sans SC, sans-serif' },
    grid: { left: 48, right: 24, top: 24, bottom: 36 },
    xAxis: {
      type: 'category',
      data: monthlyFlow.map((m) => m.month),
      axisLine: { lineStyle: { color: 'rgba(148,163,184,.2)' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(148,163,184,.08)' } },
      axisLine: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    tooltip: {
      backgroundColor: 'rgba(5,11,26,.95)',
      borderColor: 'rgba(0,212,255,.3)',
      textStyle: { color: '#94a3b8' },
      formatter: (params) => {
        const p = params[0];
        const idx = p.dataIndex;
        const curr = monthlyFlow[idx].flow;
        const last = monthlyFlow[idx].lastYear;
        return `${p.name}<br/>本年: ${curr.toLocaleString()}<br/>去年: ${last.toLocaleString()}`;
      },
    },
    series: [
      {
        name: '本年',
        type: 'line',
        data: monthlyFlow.map((m) => m.flow),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: CHART_COLORS.current, width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,212,255,.35)' },
              { offset: 1, color: 'rgba(0,212,255,.02)' },
            ],
          },
        },
      },
      {
        name: '去年',
        type: 'line',
        data: monthlyFlow.map((m) => m.lastYear),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: CHART_COLORS.lastYear, width: 1.5, type: 'dashed' },
      },
    ],
  };

  const leftPanel = (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <DataCard title="年度总流量" value={yearTotal} color="var(--accent)" />
        <DataCard title="月均流量" value={monthAvg} color="var(--accent)" />
      </div>
      <PanelCard title="车流量变化趋势">
        <ReactECharts option={flowChartOption} style={{ height: 220 }} opts={{ renderer: 'canvas' }} />
      </PanelCard>
    </>
  );

  const rightPanel = (
    <>
      <PanelCard title="路口流量排行">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topIntersections.map((item) => {
            const badgeColor =
              item.rank === 1 ? '#f59e0b' : item.rank === 2 ? '#94a3b8' : item.rank === 3 ? '#b45309' : 'rgba(148,163,184,.4)';
            return (
              <div
                key={item.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'rgba(0,212,255,.03)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid transparent',
                  transition: 'all .2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,212,255,.08)';
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,212,255,.03)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: badgeColor,
                    color: item.rank <= 3 ? '#0a1628' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {item.rank}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-primary)', marginBottom: 4 }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 6,
                        background: 'rgba(148,163,184,.15)',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${item.ratio}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))',
                          borderRadius: 3,
                          transition: 'width .4s',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '.75rem', color: 'var(--text-dim)', flexShrink: 0, minWidth: 72 }}>
                      {item.flow.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PanelCard>
    </>
  );

  const mapContent = (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapView />
    </div>
  );

  return { leftPanel, rightPanel, mapContent };
}
