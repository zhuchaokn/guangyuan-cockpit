import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import PanelCard from '../../components/common/PanelCard';
import DataCard from '../../components/common/DataCard';
import RingProgress from '../../components/common/RingProgress';
import MapView from '../../components/common/MapView';
import { trafficSafetyData } from '../../data/mockData';

const SUB_TABS = ['人车路', '隐患排查', '企业管理', '安全站点'];

const chartBase = {
  backgroundColor: 'transparent',
  textStyle: { color: '#94a3b8', fontSize: 11 },
  grid: { left: 50, right: 20, top: 20, bottom: 30 },
};

export default function useTrafficSafety() {
  const [activeTab, setActiveTab] = useState(0);
  const { drivers, vehicles, roads, driverHazards, vehicleHazards, roadHazards, enterprises, safetyStations } = trafficSafetyData;

  const subTabBar = (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
      {SUB_TABS.map((t, i) => (
        <button
          key={t}
          onClick={() => setActiveTab(i)}
          style={{
            padding: '6px 14px',
            fontSize: '.8rem',
            border: `1px solid ${activeTab === i ? 'var(--accent)' : 'var(--border-dim)'}`,
            background: activeTab === i ? 'rgba(0,212,255,.12)' : 'transparent',
            color: activeTab === i ? 'var(--accent)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );

  let leftPanel, rightPanel, mapContent;

  if (activeTab === 0) {
    // 人车路
    const driverOpt = {
      ...chartBase,
      xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.1)' } } },
      yAxis: { type: 'category', data: drivers.byType.map((d) => d.type), axisLine: { show: false }, axisLabel: { color: '#94a3b8' } },
      series: [{ type: 'bar', data: drivers.byType.map((d) => d.count), itemStyle: { color: '#00d4ff' }, barWidth: '60%' }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(5,11,26,.95)',
        borderColor: 'rgba(0,212,255,.3)',
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter: (params) => {
          const type = params[0].name;
          const total = params[0].value;
          let html = `<b>${type}</b> 总计: ${total.toLocaleString()}<br/><br/>`;
          const districts = ['利州区','昭化区','朝天区','旺苍县','青川县','剑阁县','苍溪县'];
          districts.forEach(d => {
            const val = drivers.districtDetail[d]?.[type] || 0;
            if (val > 0) {
              const barW = Math.round((val / total) * 100);
              html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">` +
                `<span style="width:48px;font-size:11px">${d}</span>` +
                `<div style="flex:1;height:6px;background:rgba(255,255,255,.1);border-radius:3px">` +
                `<div style="width:${barW}%;height:100%;background:#00d4ff;border-radius:3px"></div></div>` +
                `<span style="font-size:11px;min-width:45px;text-align:right">${val.toLocaleString()}</span></div>`;
            }
          });
          return html;
        }
      }
    };
    const vehicleOpt = {
      ...chartBase,
      xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.1)' } } },
      yAxis: { type: 'category', data: vehicles.byUsage.map((d) => d.type), axisLine: { show: false }, axisLabel: { color: '#94a3b8' } },
      series: [{ type: 'bar', data: vehicles.byUsage.map((d) => d.count), itemStyle: { color: '#22c55e' }, barWidth: '60%' }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(5,11,26,.95)',
        borderColor: 'rgba(0,212,255,.3)',
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter: (params) => {
          const type = params[0].name;
          const total = params[0].value;
          let html = `<b>${type}</b> 总计: ${total.toLocaleString()}<br/><br/>`;
          const districts = ['利州区','昭化区','朝天区','旺苍县','青川县','剑阁县','苍溪县'];
          districts.forEach(d => {
            const val = vehicles.districtDetail[d]?.[type] || 0;
            if (val > 0) {
              const barW = Math.round((val / total) * 100);
              html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">` +
                `<span style="width:48px;font-size:11px">${d}</span>` +
                `<div style="flex:1;height:6px;background:rgba(255,255,255,.1);border-radius:3px">` +
                `<div style="width:${barW}%;height:100%;background:#22c55e;border-radius:3px"></div></div>` +
                `<span style="font-size:11px;min-width:45px;text-align:right">${val.toLocaleString()}</span></div>`;
            }
          });
          return html;
        }
      }
    };
    leftPanel = (
      <>
        {subTabBar}
        <PanelCard title="驾驶人">
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '1.5rem', fontWeight: 700, color: '#00d4ff', marginBottom: 8 }}>{drivers.total.toLocaleString()}</div>
          <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: 12 }}>全市驾驶人总量</div>
          <ReactECharts option={driverOpt} style={{ height: 280 }} opts={{ renderer: 'canvas' }} />
        </PanelCard>
      </>
    );
    rightPanel = (
      <>
        {subTabBar}
        <PanelCard title="车辆">
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '1.5rem', fontWeight: 700, color: '#22c55e', marginBottom: 8 }}>{vehicles.total.toLocaleString()}</div>
          <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: 12 }}>全市车辆保有量</div>
          <ReactECharts option={vehicleOpt} style={{ height: 280 }} opts={{ renderer: 'canvas' }} />
        </PanelCard>
      </>
    );
    const roadOpt = {
      ...chartBase,
      grid: { left: 50, right: 50, top: 20, bottom: 40 },
      xAxis: { type: 'category', data: roads.types.map((d) => d.type), axisLabel: { color: '#94a3b8', rotate: 30 } },
      yAxis: [
        { type: 'value', name: '里程(km)', nameTextStyle: { color: '#94a3b8' }, axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.1)' } } },
        { type: 'value', name: '条数', nameTextStyle: { color: '#94a3b8' }, axisLine: { show: false }, splitLine: { show: false } },
      ],
      series: [
        { type: 'bar', data: roads.types.map((d) => d.km), itemStyle: { color: '#00d4ff' }, barWidth: '35%', barGap: '-30%' },
        { type: 'bar', yAxisIndex: 1, data: roads.types.map((d) => d.count), itemStyle: { color: '#22c55e' }, barWidth: '35%' },
      ],
    };
    mapContent = (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <MapView />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(5,11,26,.92)', borderTop: '1px solid var(--border-dim)',
          padding: '12px 16px', height: 200,
        }}>
          <div style={{ fontSize: '.82rem', color: 'var(--text-primary)', marginBottom: 8 }}>道路</div>
          <ReactECharts option={roadOpt} style={{ height: 150 }} opts={{ renderer: 'canvas' }} />
        </div>
      </div>
    );
  } else if (activeTab === 1) {
    // 隐患排查
    leftPanel = (
      <>
        {subTabBar}
        <PanelCard title="驾驶人隐患">
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-dim)' }}>总数 {driverHazards.total} / 已整治 {driverHazards.resolved}</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${driverHazards.rate}%`, height: '100%', background: 'var(--green)', transition: 'width .5s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {driverHazards.categories.map((c) => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                  <span style={{ color: 'var(--text-dim)' }}>{c.count}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(c.resolved / c.count) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width .5s' }} />
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </>
    );
    rightPanel = (
      <>
        {subTabBar}
        <PanelCard title="车辆隐患">
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-dim)' }}>总数 {vehicleHazards.total} / 已整治 {vehicleHazards.resolved}</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${vehicleHazards.rate}%`, height: '100%', background: 'var(--green)', transition: 'width .5s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vehicleHazards.categories.map((c) => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                  <span style={{ color: 'var(--text-dim)' }}>{c.count}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(c.resolved / c.count) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width .5s' }} />
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </>
    );
    mapContent = (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <MapView />
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 24, background: 'rgba(5,11,26,.92)', padding: '16px 24px',
          borderRadius: 'var(--radius)', border: '1px solid var(--border-dim)',
        }}>
          {roadHazards.byLevel.map((l) => (
            <div key={l.level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: '.68rem', color: l.color }}>{l.level}</div>
              <RingProgress
                value={l.count > 0 ? Math.round((l.resolved / l.count) * 1000) / 10 : 0}
                size={56}
                stroke={5}
                color={l.color}
                label={`${l.resolved}/${l.count}`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (activeTab === 2) {
    // 企业管理
    const levelColors = { 高: '#ef4444', 中: '#f59e0b', 低: '#eab308' };
    const statusColors = { 已整改: 'var(--green)', 整改中: 'var(--orange)', 未整改: 'var(--red)' };
    leftPanel = (
      <>
        {subTabBar}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <DataCard title="企业总数" value={enterprises.total} color="var(--accent)" mini />
          <DataCard title="高风险" value={enterprises.highRisk} color="var(--red)" mini />
        </div>
      </>
    );
    rightPanel = (
      <>
        {subTabBar}
        <PanelCard title="企业列表">
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            <table style={{ width: '100%', fontSize: '.75rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border-dim)' }}>
                  <th style={{ padding: '8px 6px', textAlign: 'left' }}>企业名称</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left' }}>风险等级</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left' }}>原因</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left' }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {enterprises.list.map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(0,212,255,.06)' }}>
                    <td style={{ padding: '8px 6px', color: 'var(--text-primary)' }}>{e.name}</td>
                    <td style={{ padding: '8px 6px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: '.68rem',
                        background: (levelColors[e.level] || '#64748b') + '30',
                        color: levelColors[e.level] || '#94a3b8',
                      }}>{e.level}风险</span>
                    </td>
                    <td style={{ padding: '8px 6px', color: 'var(--text-secondary)' }}>{e.reason}</td>
                    <td style={{ padding: '8px 6px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: '.68rem',
                        background: (statusColors[e.status] || '#64748b') + '30',
                        color: statusColors[e.status] || '#94a3b8',
                      }}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </>
    );
    mapContent = <MapView />;
  } else {
    // 安全站点
    const pieData = [
      { value: safetyStations.enforcement, name: '执法站', itemStyle: { color: '#3b82f6' } },
      { value: safetyStations.persuasion, name: '劝导站', itemStyle: { color: '#22c55e' } },
      { value: safetyStations.inspection, name: '检查站', itemStyle: { color: '#8b5cf6' } },
    ];
    const pieOpt = {
      ...chartBase,
      series: [{ type: 'pie', radius: ['45%', '70%'], center: ['50%', '50%'], data: pieData, label: { color: '#94a3b8', fontSize: 10 } }],
    };
    const markers = safetyStations.positions.map((p, i) => ({ ...p, id: `st_${i}` }));
    leftPanel = subTabBar;
    rightPanel = (
      <>
        {subTabBar}
        <PanelCard title="安全站点统计">
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <DataCard title="执法站" value={safetyStations.enforcement} color="#3b82f6" mini />
            <DataCard title="劝导站" value={safetyStations.persuasion} color="#22c55e" mini />
            <DataCard title="检查站" value={safetyStations.inspection} color="#8b5cf6" mini />
          </div>
          <ReactECharts option={pieOpt} style={{ height: 180 }} opts={{ renderer: 'canvas' }} />
        </PanelCard>
      </>
    );
    mapContent = <MapView markers={markers} />;
  }

  return { leftPanel, rightPanel, mapContent };
}
