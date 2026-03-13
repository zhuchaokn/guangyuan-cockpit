import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import PanelCard from '../../components/common/PanelCard';
import DataCard from '../../components/common/DataCard';
import MapView from '../../components/common/MapView';
import { trafficStatusData } from '../../data/mockData';

const TABS = ['城市概况', '运行概况', '内部交通压力', '进出交通压力'];
const PALETTE = ['#00d4ff', '#818cf8', '#22c55e', '#f59e0b', '#ef4444', '#f472b6'];
const CHART_BASE = {
  backgroundColor: 'transparent',
  textStyle: { color: '#94a3b8', fontSize: 11 },
  grid: { left: 40, right: 20, top: 24, bottom: 24 },
  xAxis: { type: 'category', axisLine: { lineStyle: { color: 'rgba(255,255,255,.06)' } }, axisLabel: { color: '#94a3b8' } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,.06)' } }, axisLine: { lineStyle: { color: 'rgba(255,255,255,.06)' } }, axisLabel: { color: '#94a3b8' } },
};

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="traffic-tab-bar">
      {tabs.map((t) => (
        <button key={t} className={active === t ? 'active' : ''} onClick={() => onChange(t)}>{t}</button>
      ))}
      <style>{`
        .traffic-tab-bar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .traffic-tab-bar button {
          padding: 6px 12px; font-size: .75rem; border-radius: 4px;
          background: rgba(255,255,255,.05); border: 1px solid var(--border-dim);
          color: var(--text-secondary); cursor: pointer; transition: all .2s;
        }
        .traffic-tab-bar button:hover { border-color: var(--accent); color: var(--accent); }
        .traffic-tab-bar button.active { background: rgba(0,212,255,.15); border-color: var(--accent); color: var(--accent); }
      `}</style>
    </div>
  );
}

export default function useTrafficStatus() {
  const [activeTab, setActiveTab] = useState('城市概况');

  // 机动车保有量 inner tabs
  const [vehicleInnerTab, setVehicleInnerTab] = useState('趋势');
  const vehicleInnerTabs = ['趋势', '辖区排名', '状态分析', '类型分布', '使用性质', '两率'];

  // 驾驶人保有量 inner tabs
  const [driverInnerTab, setDriverInnerTab] = useState('趋势');
  const driverInnerTabs = ['趋势', '辖区排名', '驾证状态', '年龄构成', '驾龄分布', '驾证类型', '两率'];

  const { vehicleOwnership, driverOwnership, trafficIndex, activeVehicles, inboundVehicles } = trafficStatusData;

  const leftPanel = (
    <div className="traffic-status-panel">
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === '城市概况' && (
        <PanelCard title="机动车保有量">
          <div className="big-number">{vehicleOwnership.total.toLocaleString()}</div>
          <TabBar tabs={vehicleInnerTabs} active={vehicleInnerTab} onChange={setVehicleInnerTab} />
          {vehicleInnerTab === '趋势' && (
            <ReactECharts
              style={{ height: 220 }}
              option={{
                ...CHART_BASE,
                tooltip: { trigger: 'axis' },
                legend: { data: ['保有量', '新增', '注销'], textStyle: { color: '#94a3b8' }, top: 0 },
                xAxis: { ...CHART_BASE.xAxis, data: vehicleOwnership.monthlyTrend.map((m) => m.month) },
                series: [
                  { name: '保有量', type: 'line', data: vehicleOwnership.monthlyTrend.map((m) => m.total), smooth: true, color: PALETTE[0] },
                  { name: '新增', type: 'line', data: vehicleOwnership.monthlyTrend.map((m) => m.added), smooth: true, color: PALETTE[2] },
                  { name: '注销', type: 'line', data: vehicleOwnership.monthlyTrend.map((m) => m.cancelled), smooth: true, color: PALETTE[4] },
                ],
              }}
            />
          )}
          {vehicleInnerTab === '辖区排名' && (
            <ul className="rank-list">
              {vehicleOwnership.districtRank.map((d, i) => (
                <li key={d.name}>
                  <span className="rank">{i + 1}</span>
                  <span className="name">{d.name}</span>
                  <span className="count">{d.count.toLocaleString()}</span>
                  <span className={`change ${d.change >= 0 ? 'up' : 'down'}`}>{d.change >= 0 ? '+' : ''}{d.change}%</span>
                </li>
              ))}
            </ul>
          )}
          {vehicleInnerTab === '状态分析' && (
            <ReactECharts
              style={{ height: 200 }}
              option={{
                ...CHART_BASE,
                tooltip: { trigger: 'axis' },
                xAxis: { ...CHART_BASE.xAxis, type: 'value', inverse: true },
                yAxis: { ...CHART_BASE.yAxis, type: 'category', data: vehicleOwnership.statusTop5.map((s) => s.name).reverse() },
                series: [{ type: 'bar', data: vehicleOwnership.statusTop5.map((s) => s.count).reverse(), itemStyle: { color: PALETTE[0] } }],
              }}
            />
          )}
          {vehicleInnerTab === '类型分布' && (
            <ReactECharts
              style={{ height: 220 }}
              option={{
                backgroundColor: 'transparent',
                textStyle: { color: '#94a3b8' },
                tooltip: { trigger: 'item' },
                series: [{ type: 'pie', radius: ['35%', '65%'], data: vehicleOwnership.typeDistribution.map((d, i) => ({ ...d, itemStyle: { color: PALETTE[i % PALETTE.length] } })), label: { color: '#94a3b8' } }],
              }}
            />
          )}
          {vehicleInnerTab === '使用性质' && (
            <ReactECharts
              style={{ height: 220 }}
              option={{
                backgroundColor: 'transparent',
                textStyle: { color: '#94a3b8' },
                tooltip: { trigger: 'item' },
                series: [{ type: 'pie', radius: ['45%', '70%'], data: vehicleOwnership.usageNature.map((d, i) => ({ ...d, itemStyle: { color: PALETTE[i % PALETTE.length] } })), label: { color: '#94a3b8' } }],
              }}
            />
          )}
          {vehicleInnerTab === '两率' && (
            <div className="gauge-row">
              <ReactECharts
                style={{ height: 140, flex: 1 }}
                option={{
                  backgroundColor: 'transparent',
                  textStyle: { color: '#94a3b8' },
                  series: [{ type: 'gauge', startAngle: 200, endAngle: -20, min: 0, max: 100, progress: { show: true }, detail: { valueAnimation: true, formatter: '{value}%', color: PALETTE[0], offsetCenter: [0, '70%'] }, data: [{ value: vehicleOwnership.inspectionRate, name: '检验率' }], axisLine: { lineStyle: { color: [[1, 'rgba(255,255,255,.1)']] } }, pointer: { show: false } }],
                }}
              />
              <ReactECharts
                style={{ height: 140, flex: 1 }}
                option={{
                  backgroundColor: 'transparent',
                  textStyle: { color: '#94a3b8' },
                  series: [{ type: 'gauge', startAngle: 200, endAngle: -20, min: 0, max: 100, progress: { show: true }, detail: { valueAnimation: true, formatter: '{value}%', color: PALETTE[2], offsetCenter: [0, '70%'] }, data: [{ value: vehicleOwnership.scrapRate, name: '报废率' }], axisLine: { lineStyle: { color: [[1, 'rgba(255,255,255,.1)']] } }, pointer: { show: false } }],
                }}
              />
            </div>
          )}
        </PanelCard>
      )}

      {activeTab === '运行概况' && (
        <>
          <div className="data-cards-row">
            <DataCard title="交通指数" value={trafficIndex.current} color="#00d4ff" />
            <DataCard title="平均速度" value={trafficIndex.avgSpeed} unit="km/h" color="#22c55e" />
            <DataCard title="拥堵里程" value={trafficIndex.congestionKm} unit="km" trend={trafficIndex.congestionChange} color="#f59e0b" />
          </div>
          <PanelCard title="24小时交通指数">
            <ReactECharts
              style={{ height: 200 }}
              option={{
                ...CHART_BASE,
                tooltip: { trigger: 'axis' },
                legend: { data: ['今日', '上周'], textStyle: { color: '#94a3b8' }, top: 0 },
                xAxis: { ...CHART_BASE.xAxis, data: trafficIndex.hourlyToday.map((h) => h.hour) },
                series: [
                  { name: '今日', type: 'line', data: trafficIndex.hourlyToday.map((h) => h.value), smooth: true, color: PALETTE[0] },
                  { name: '上周', type: 'line', data: trafficIndex.hourlyLastWeek.map((h) => h.value), smooth: true, color: PALETTE[1] },
                ],
              }}
            />
          </PanelCard>
          <PanelCard title="拥堵路段排名">
            <ul className="congestion-list">
              {trafficIndex.congestionRoads.map((r) => (
                <li key={r.rank}>
                  <span className="rank">{r.rank}</span>
                  <span className="name">{r.name}</span>
                  <span className="index">{r.index}</span>
                  <span className="speed">{r.speed} km/h</span>
                  {r.frequent && <span className="tag">常发</span>}
                </li>
              ))}
            </ul>
          </PanelCard>
        </>
      )}

      {activeTab === '进出交通压力' && (
        <PanelCard title="进城车辆">
          <div className="big-number">{inboundVehicles.today.toLocaleString()}</div>
          <ReactECharts
            style={{ height: 180 }}
            option={{
              ...CHART_BASE,
              tooltip: { trigger: 'axis' },
              xAxis: { ...CHART_BASE.xAxis, data: inboundVehicles.hourly.map((h) => h.hour) },
              series: [{ type: 'line', data: inboundVehicles.hourly.map((h) => h.today), smooth: true, color: PALETTE[0] }],
            }}
          />
          <div className="checkpoint-table">
            <div className="table-header">
              <span>排名</span><span>卡口</span><span>5分钟流量</span><span>日累计</span><span>周同比</span>
            </div>
            {inboundVehicles.topCheckpoints.map((c) => (
              <div key={c.rank} className="table-row">
                <span>{c.rank}</span><span>{c.name}</span><span>{c.flow5min}</span><span>{c.dayTotal.toLocaleString()}</span>
                <span className={c.change >= 0 ? 'up' : 'down'}>{c.change >= 0 ? '+' : ''}{c.change}%</span>
              </div>
            ))}
          </div>
        </PanelCard>
      )}

      <style>{`
        .traffic-status-panel .big-number { font-family: 'Orbitron', monospace; font-size: 1.8rem; font-weight: 700; color: var(--accent); margin-bottom: 12px; letter-spacing: 1px; }
        .rank-list { list-style: none; padding: 0; margin: 0; }
        .rank-list li { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border-dim); font-size: .82rem; }
        .rank-list .rank { width: 24px; color: var(--accent); font-weight: 600; }
        .rank-list .name { flex: 1; }
        .rank-list .count { font-family: monospace; color: var(--text-primary); }
        .rank-list .change { font-size: .75rem; }
        .rank-list .change.up { color: var(--green); }
        .rank-list .change.down { color: var(--red); }
        .gauge-row { display: flex; gap: 16px; }
        .data-cards-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
        .congestion-list { list-style: none; padding: 0; margin: 0; max-height: 200px; overflow-y: auto; }
        .congestion-list li { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border-dim); font-size: .8rem; }
        .congestion-list .rank { width: 20px; color: var(--accent); }
        .congestion-list .name { flex: 1; }
        .congestion-list .index { color: var(--accent); }
        .congestion-list .tag { font-size: .65rem; padding: 2px 6px; background: rgba(245,158,11,.2); color: #f59e0b; border-radius: 2px; }
        .checkpoint-table { margin-top: 12px; font-size: .78rem; }
        .checkpoint-table .table-header, .checkpoint-table .table-row { display: grid; grid-template-columns: 40px 1fr 70px 80px 60px; gap: 8px; padding: 8px 0; }
        .checkpoint-table .table-header { color: var(--text-dim); border-bottom: 1px solid var(--border-dim); }
        .checkpoint-table .up { color: var(--green); }
        .checkpoint-table .down { color: var(--red); }
      `}</style>
    </div>
  );

  const rightPanel = (
    <div className="traffic-status-panel">
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === '城市概况' && (
        <PanelCard title="驾驶人保有量">
          <div className="big-number">{driverOwnership.total.toLocaleString()}</div>
          <TabBar tabs={driverInnerTabs} active={driverInnerTab} onChange={setDriverInnerTab} />
          {driverInnerTab === '趋势' && (
            <ReactECharts
              style={{ height: 220 }}
              option={{
                ...CHART_BASE,
                tooltip: { trigger: 'axis' },
                legend: { data: ['保有量', '注册', '注销'], textStyle: { color: '#94a3b8' }, top: 0 },
                xAxis: { ...CHART_BASE.xAxis, data: driverOwnership.monthlyTrend.map((m) => m.month) },
                series: [
                  { name: '保有量', type: 'line', data: driverOwnership.monthlyTrend.map((m) => m.total), smooth: true, color: PALETTE[0] },
                  { name: '注册', type: 'line', data: driverOwnership.monthlyTrend.map((m) => m.registered), smooth: true, color: PALETTE[2] },
                  { name: '注销', type: 'line', data: driverOwnership.monthlyTrend.map((m) => m.cancelled), smooth: true, color: PALETTE[4] },
                ],
              }}
            />
          )}
          {driverInnerTab === '辖区排名' && (
            <ul className="rank-list">
              {driverOwnership.districtRank.map((d, i) => (
                <li key={d.name}>
                  <span className="rank">{i + 1}</span>
                  <span className="name">{d.name}</span>
                  <span className="count">{d.count.toLocaleString()}</span>
                  <span className={`change ${d.change >= 0 ? 'up' : 'down'}`}>{d.change >= 0 ? '+' : ''}{d.change}%</span>
                </li>
              ))}
            </ul>
          )}
          {driverInnerTab === '驾证状态' && (
            <ReactECharts
              style={{ height: 200 }}
              option={{
                ...CHART_BASE,
                tooltip: { trigger: 'axis' },
                xAxis: { ...CHART_BASE.xAxis, type: 'value', inverse: true },
                yAxis: { ...CHART_BASE.yAxis, type: 'category', data: driverOwnership.statusFunnel.map((s) => s.name).reverse() },
                series: [{ type: 'bar', data: driverOwnership.statusFunnel.map((s) => s.value).reverse(), itemStyle: { color: PALETTE[0] } }],
              }}
            />
          )}
          {driverInnerTab === '年龄构成' && (
            <ReactECharts
              style={{ height: 220 }}
              option={{
                backgroundColor: 'transparent',
                textStyle: { color: '#94a3b8' },
                tooltip: { trigger: 'item' },
                series: [{ type: 'pie', radius: ['35%', '65%'], data: driverOwnership.ageFunnel.map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: PALETTE[i % PALETTE.length] } })), label: { color: '#94a3b8' } }],
              }}
            />
          )}
          {driverInnerTab === '驾龄分布' && (
            <ReactECharts
              style={{ height: 220 }}
              option={{
                backgroundColor: 'transparent',
                textStyle: { color: '#94a3b8' },
                tooltip: { trigger: 'item' },
                series: [{ type: 'pie', radius: ['35%', '65%'], data: driverOwnership.drivingAge.map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: PALETTE[i % PALETTE.length] } })), label: { color: '#94a3b8' } }],
              }}
            />
          )}
          {driverInnerTab === '驾证类型' && (
            <ReactECharts
              style={{ height: 220 }}
              option={{
                backgroundColor: 'transparent',
                textStyle: { color: '#94a3b8' },
                tooltip: { trigger: 'item' },
                series: [{ type: 'pie', radius: ['35%', '65%'], data: driverOwnership.licenseType.map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: PALETTE[i % PALETTE.length] } })), label: { color: '#94a3b8' } }],
              }}
            />
          )}
          {driverInnerTab === '两率' && (
            <div className="gauge-row">
              <ReactECharts
                style={{ height: 140, flex: 1 }}
                option={{
                  backgroundColor: 'transparent',
                  textStyle: { color: '#94a3b8' },
                  series: [{ type: 'gauge', startAngle: 200, endAngle: -20, min: 0, max: 100, progress: { show: true }, detail: { valueAnimation: true, formatter: '{value}%', color: PALETTE[0], offsetCenter: [0, '70%'] }, data: [{ value: driverOwnership.renewRate, name: '换证率' }], axisLine: { lineStyle: { color: [[1, 'rgba(255,255,255,.1)']] } }, pointer: { show: false } }],
                }}
              />
              <ReactECharts
                style={{ height: 140, flex: 1 }}
                option={{
                  backgroundColor: 'transparent',
                  textStyle: { color: '#94a3b8' },
                  series: [{ type: 'gauge', startAngle: 200, endAngle: -20, min: 0, max: 100, progress: { show: true }, detail: { valueAnimation: true, formatter: '{value}%', color: PALETTE[2], offsetCenter: [0, '70%'] }, data: [{ value: driverOwnership.auditRate, name: '审验率' }], axisLine: { lineStyle: { color: [[1, 'rgba(255,255,255,.1)']] } }, pointer: { show: false } }],
                }}
              />
            </div>
          )}
        </PanelCard>
      )}

      {activeTab === '内部交通压力' && (
        <>
          <DataCard title="日活跃车辆" value={activeVehicles.today} trend={activeVehicles.change} color="#00d4ff" />
          <PanelCard title="24小时趋势">
            <ReactECharts
              style={{ height: 180 }}
              option={{
                ...CHART_BASE,
                tooltip: { trigger: 'axis' },
                legend: { data: ['今日', '上周'], textStyle: { color: '#94a3b8' }, top: 0 },
                xAxis: { ...CHART_BASE.xAxis, data: activeVehicles.hourly.map((h) => h.hour) },
                series: [
                  { name: '今日', type: 'line', data: activeVehicles.hourly.map((h) => h.today), smooth: true, color: PALETTE[0] },
                  { name: '上周', type: 'line', data: activeVehicles.hourly.map((h) => h.lastWeek), smooth: true, color: PALETTE[1] },
                ],
              }}
            />
          </PanelCard>
          <div className="pie-row">
            <PanelCard title="归属地分布">
              <ReactECharts
                style={{ height: 160 }}
                option={{
                  backgroundColor: 'transparent',
                  textStyle: { color: '#94a3b8' },
                  tooltip: { trigger: 'item' },
                  series: [{ type: 'pie', radius: ['35%', '65%'], data: activeVehicles.origin.map((d, i) => ({ ...d, itemStyle: { color: PALETTE[i % PALETTE.length] } })), label: { color: '#94a3b8' } }],
                }}
              />
            </PanelCard>
            <PanelCard title="号牌类型">
              <ReactECharts
                style={{ height: 160 }}
                option={{
                  backgroundColor: 'transparent',
                  textStyle: { color: '#94a3b8' },
                  tooltip: { trigger: 'item' },
                  series: [{ type: 'pie', radius: ['35%', '65%'], data: activeVehicles.plateType.map((d, i) => ({ ...d, itemStyle: { color: PALETTE[i % PALETTE.length] } })), label: { color: '#94a3b8' } }],
                }}
              />
            </PanelCard>
          </div>
        </>
      )}

      <style>{`
        .traffic-status-panel .big-number { font-family: 'Orbitron', monospace; font-size: 1.8rem; font-weight: 700; color: var(--accent); margin-bottom: 12px; letter-spacing: 1px; }
        .rank-list { list-style: none; padding: 0; margin: 0; }
        .rank-list li { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border-dim); font-size: .82rem; }
        .rank-list .rank { width: 24px; color: var(--accent); font-weight: 600; }
        .rank-list .name { flex: 1; }
        .rank-list .count { font-family: monospace; color: var(--text-primary); }
        .rank-list .change { font-size: .75rem; }
        .rank-list .change.up { color: var(--green); }
        .rank-list .change.down { color: var(--red); }
        .gauge-row { display: flex; gap: 16px; }
        .pie-row { display: flex; flex-direction: column; gap: 12px; }
      `}</style>
    </div>
  );

  const mapContent = <MapView />;

  return { leftPanel, rightPanel, mapContent };
}
