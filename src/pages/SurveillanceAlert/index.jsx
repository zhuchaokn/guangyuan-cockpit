import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import PanelCard from '../../components/common/PanelCard';
import DataCard from '../../components/common/DataCard';
import MapView from '../../components/common/MapView';
import { surveillanceAlertData } from '../../data/mockData';

function maskPlate(plate) {
  if (!plate || plate.length < 4) return plate;
  return plate.slice(0, 2) + '***' + plate.slice(-2);
}

export default function useSurveillanceAlert() {
  const [alerts, setAlerts] = useState([...surveillanceAlertData.alerts]);
  const { todayTotal, typeStats, hourlyTrend } = surveillanceAlertData;

  useEffect(() => {
    const timer = setInterval(() => {
      setAlerts((prev) => {
        if (prev.length <= 1) return prev;
        return [...prev.slice(1), prev[0]];
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const alertMarkers = alerts.slice(0, 15).map((a) => ({
    id: a.id,
    lng: a.lng,
    lat: a.lat,
    type: 'alert',
  }));

  const typePieOption = {
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
        radius: '65%',
        center: ['50%', '50%'],
        data: typeStats.map((t) => ({
          value: t.value,
          name: t.name,
          itemStyle: { color: t.color },
        })),
        label: {
          color: '#94a3b8',
          fontSize: 11,
          formatter: '{b} {d}%',
        },
        labelLine: { lineStyle: { color: 'rgba(148,163,184,.3)' } },
      },
    ],
  };

  const trendBarOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8', fontFamily: 'Noto Sans SC, sans-serif' },
    grid: { left: 48, right: 24, top: 24, bottom: 36 },
    xAxis: {
      type: 'category',
      data: hourlyTrend.map((h) => h.hour),
      axisLine: { lineStyle: { color: 'rgba(148,163,184,.2)' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
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
    },
    series: [
      {
        type: 'bar',
        data: hourlyTrend.map((h) => h.count),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#ef4444' },
              { offset: 1, color: 'rgba(239,68,68,.4)' },
            ],
          },
        },
        barWidth: '60%',
      },
    ],
  };

  const leftPanel = (
    <>
      <PanelCard title="实时布控报警">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxHeight: 420,
            overflowY: 'auto',
          }}
        >
          {alerts.map((alert, idx) => (
            <div
              key={alert.id}
              style={{
                display: 'flex',
                gap: 12,
                padding: 10,
                background: idx === 0 ? 'rgba(239,68,68,.08)' : 'rgba(0,212,255,.03)',
                borderRadius: 'var(--radius)',
                border: `1px solid ${idx === 0 ? 'rgba(239,68,68,.25)' : 'var(--border-dim)'}`,
                animation: idx === 0 ? 'alert-glow 2s ease-in-out infinite' : 'none',
                transition: 'all .3s',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 48,
                  flexShrink: 0,
                  background: 'rgba(148,163,184,.2)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(148,163,184,.5)',
                  fontSize: 18,
                }}
              >
                📷
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                  {maskPlate(alert.plate)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                  <span
                    style={{
                      fontSize: '.7rem',
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: `${alert.reasonColor}30`,
                      color: alert.reasonColor,
                      fontWeight: 600,
                    }}
                  >
                    {alert.reason}
                  </span>
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-dim)' }}>{alert.time}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{alert.location}</div>
              </div>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes alert-glow {
            0%, 100% { box-shadow: 0 0 8px rgba(239,68,68,.15); }
            50% { box-shadow: 0 0 16px rgba(239,68,68,.3); }
          }
        `}</style>
      </PanelCard>
    </>
  );

  const rightPanel = (
    <>
      <div style={{ marginBottom: 12 }}>
        <DataCard title="今日报警统计" value={todayTotal} color="var(--red)" />
      </div>
      <PanelCard title="报警类型分布">
        <ReactECharts option={typePieOption} style={{ height: 180 }} opts={{ renderer: 'canvas' }} />
      </PanelCard>
      <PanelCard title="最近报警趋势">
        <ReactECharts option={trendBarOption} style={{ height: 180 }} opts={{ renderer: 'canvas' }} />
      </PanelCard>
    </>
  );

  const mapContent = (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapView markers={alertMarkers} />
    </div>
  );

  return { leftPanel, rightPanel, mapContent };
}
