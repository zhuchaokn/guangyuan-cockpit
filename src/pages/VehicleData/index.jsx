import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import PanelCard from '../../components/common/PanelCard';
import DataCard from '../../components/common/DataCard';
import MapView from '../../components/common/MapView';
import { vehicleDataMgmt } from '../../data/mockData';

export default function useVehicleData() {
  const { localVehicles, foreignVehicles, provinceRank, typeDistribution } = vehicleDataMgmt;

  const donutOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8', fontFamily: 'Noto Sans SC, sans-serif' },
    tooltip: {
      backgroundColor: 'rgba(5,11,26,.95)',
      borderColor: 'rgba(0,212,255,.3)',
      textStyle: { color: '#94a3b8' },
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: 'transparent',
          borderWidth: 0,
        },
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: localVehicles.count, name: '本地车', itemStyle: { color: '#22c55e' } },
          { value: foreignVehicles.count, name: '外地车', itemStyle: { color: '#f59e0b' } },
        ],
      },
    ],
  };

  const pieOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8', fontFamily: 'Noto Sans SC, sans-serif' },
    tooltip: {
      backgroundColor: 'rgba(5,11,26,.95)',
      borderColor: 'rgba(0,212,255,.3)',
      textStyle: { color: '#94a3b8' },
    },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        data: typeDistribution.map((t, i) => {
          const colors = ['#00d4ff', '#22c55e', '#f59e0b', '#8b5cf6', '#38e8ff', '#f472b6', '#64748b'];
          return {
            value: t.count,
            name: t.name,
            itemStyle: { color: colors[i % colors.length] },
          };
        }),
        label: {
          color: '#94a3b8',
          fontSize: 11,
          formatter: '{b} {d}%',
        },
        labelLine: { lineStyle: { color: 'rgba(148,163,184,.3)' } },
      },
    ],
  };

  const leftPanel = (
    <>
      <PanelCard title="车辆归属地">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <DataCard
            title="本地车"
            value={localVehicles.count}
            color="#22c55e"
            mini
          >
            <div style={{ fontSize: '.72rem', color: 'var(--text-dim)' }}>{localVehicles.ratio}%</div>
          </DataCard>
          <DataCard
            title="外地车"
            value={foreignVehicles.count}
            color="#f59e0b"
            mini
          >
            <div style={{ fontSize: '.72rem', color: 'var(--text-dim)' }}>{foreignVehicles.ratio}%</div>
          </DataCard>
        </div>
        <div style={{ height: 140, marginBottom: 16 }}>
          <ReactECharts option={donutOption} style={{ height: '100%' }} opts={{ renderer: 'canvas' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {provinceRank.map((p) => (
            <div
              key={p.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: 'rgba(0,212,255,.03)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span style={{ fontSize: '.8rem', color: 'var(--text-primary)', minWidth: 100 }}>{p.name}</span>
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
                    width: `${p.ratio}%`,
                    height: '100%',
                    background: 'var(--accent)',
                    borderRadius: 3,
                  }}
                />
              </div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-dim)', minWidth: 70 }}>
                {p.count.toLocaleString()} ({p.ratio}%)
              </span>
            </div>
          ))}
        </div>
      </PanelCard>
    </>
  );

  const rightPanel = (
    <>
      <PanelCard title="车辆类型统计">
        <div style={{ height: 200, marginBottom: 16 }}>
          <ReactECharts option={pieOption} style={{ height: '100%' }} opts={{ renderer: 'canvas' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {typeDistribution.map((t) => (
            <div
              key={t.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: 'rgba(0,212,255,.03)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span style={{ fontSize: '.8rem', color: 'var(--text-primary)', minWidth: 80 }}>{t.name}</span>
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
                    width: `${t.ratio}%`,
                    height: '100%',
                    background: 'var(--accent)',
                    borderRadius: 3,
                  }}
                />
              </div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-dim)', minWidth: 90 }}>
                {t.count.toLocaleString()} ({t.ratio}%)
              </span>
            </div>
          ))}
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
