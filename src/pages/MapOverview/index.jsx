import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import PanelCard from '../../components/common/PanelCard';
import DataCard from '../../components/common/DataCard';
import RingProgress from '../../components/common/RingProgress';
import { MiniLine, MiniBar } from '../../components/common/MiniChart';
import MapView from '../../components/common/MapView';
import { mapOverviewData } from '../../data/mockData';

const ICON_MAP = {
  camera: '📷',
  checkpoint: '🚧',
  mobile: '📱',
  police: '🚔',
  signal: '🚦',
  led: '🖥️',
};

export default function useMapOverview() {
  const [showCameras, setShowCameras] = useState(true);
  const [showCheckpoints, setShowCheckpoints] = useState(true);
  const [showSignals, setShowSignals] = useState(true);

  const { dataOverview, resources, markers } = mapOverviewData;

  const visibleMarkers = [
    ...(showCameras ? markers.cameras : []),
    ...(showCheckpoints ? markers.checkpoints : []),
    ...(showSignals ? markers.signals : []),
  ];

  const leftPanel = (
    <>
      <PanelCard title="数据总览">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DataCard
            title="今日过车"
            value={dataOverview.todayVehicles}
            trend={12.3}
            color="var(--accent)"
            mini
          >
            <div style={{ fontSize: '.7rem', color: 'var(--text-dim)', marginBottom: 6 }}>
              本月: {dataOverview.monthVehicles.toLocaleString()}
            </div>
            <MiniLine data={dataOverview.vehicleTrend} color="#00d4ff" height={36} />
          </DataCard>
          <DataCard
            title="今日违法"
            value={dataOverview.todayViolations}
            trend={5.2}
            color="var(--orange)"
            mini
          >
            <div style={{ fontSize: '.7rem', color: 'var(--text-dim)', marginBottom: 6 }}>
              本月: {dataOverview.monthViolations.toLocaleString()}
            </div>
            <MiniBar data={dataOverview.violationTrend} color="var(--orange)" height={36} />
          </DataCard>
          <DataCard
            title="今日报警"
            value={dataOverview.todayAlarms}
            trend={-3.1}
            color="var(--red)"
            mini
          >
            <div style={{ fontSize: '.7rem', color: 'var(--text-dim)', marginBottom: 6 }}>
              本月: {dataOverview.monthAlarms.toLocaleString()}
            </div>
            <MiniLine data={dataOverview.alarmTrend} color="var(--red)" height={36} />
          </DataCard>
        </div>
      </PanelCard>
    </>
  );

  const rightPanel = (
    <>
      <PanelCard title="资源总览">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {resources.map((r, i) => (
            <div
              key={r.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(0,212,255,.04)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-dim)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <span style={{ fontSize: '1.1rem' }}>{ICON_MAP[r.icon] || '●'}</span>
                <div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    总量 {r.total.toLocaleString()} · 在线 {r.online.toLocaleString()}
                  </div>
                </div>
              </div>
              <RingProgress value={r.rate} size={48} stroke={4} color={r.color} />
            </div>
          ))}
        </div>
      </PanelCard>
    </>
  );

  const mapContent = (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapView markers={visibleMarkers} />
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(5,11,26,.92)',
          border: '1px solid var(--border-dim)',
          borderRadius: 'var(--radius)',
          padding: '12px 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ fontSize: '.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>
          图层控制
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.8rem' }}>
          <input
            type="checkbox"
            checked={showCameras}
            onChange={(e) => setShowCameras(e.target.checked)}
            style={{ accentColor: '#00d4ff' }}
          />
          <span style={{ color: '#00d4ff' }}>●</span>
          监控点位 ({markers.cameras.filter((m) => m.status === 'online').length})
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.8rem' }}>
          <input
            type="checkbox"
            checked={showCheckpoints}
            onChange={(e) => setShowCheckpoints(e.target.checked)}
            style={{ accentColor: '#22c55e' }}
          />
          <span style={{ color: '#22c55e' }}>●</span>
          卡口 ({markers.checkpoints.filter((m) => m.status === 'online').length})
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.8rem' }}>
          <input
            type="checkbox"
            checked={showSignals}
            onChange={(e) => setShowSignals(e.target.checked)}
            style={{ accentColor: '#f59e0b' }}
          />
          <span style={{ color: '#f59e0b' }}>●</span>
          信号机 ({markers.signals.filter((m) => m.status === 'online').length})
        </label>
      </div>
    </div>
  );

  return { leftPanel, rightPanel, mapContent };
}
