import { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import PanelCard from '../../components/common/PanelCard';
import DataCard from '../../components/common/DataCard';
import AMapView from '../../components/common/AMapView';
import { trafficStatusData } from '../../data/mockData';

const TABS = ['城市概况', '运行概况', '内部交通压力', '进出交通压力'];
const PALETTE = ['#00d4ff', '#818cf8', '#22c55e', '#f59e0b', '#ef4444', '#f472b6'];
const CHART_BASE = {
  backgroundColor: 'transparent',
  textStyle: { color: '#94a3b8', fontSize: 11 },
  grid: { left: 40, right: 20, top: 24, bottom: 24 },
};
const X_AXIS = { type: 'category', axisLine: { lineStyle: { color: 'rgba(255,255,255,.06)' } }, axisLabel: { color: '#94a3b8' } };
const Y_AXIS = { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,.06)' } }, axisLine: { lineStyle: { color: 'rgba(255,255,255,.06)' } }, axisLabel: { color: '#94a3b8' } };
const DISTRICTS_7 = ['利州区', '昭化区', '朝天区', '旺苍县', '青川县', '剑阁县', '苍溪县'];
const SQUAD_TO_DISTRICT = {
  '利州大队': '利州区', '昭化大队': '昭化区', '朝天大队': '朝天区',
  '旺苍大队': '旺苍县', '青川大队': '青川县', '剑阁大队': '剑阁县', '苍溪大队': '苍溪县',
};
const randFloat = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);

const TRAFFIC_LAST_MONTH = trafficStatusData.trafficIndex.hourlyLastWeek.map(
  (h, i) => +((h.value * 0.92) + ((i % 5) * 0.08)).toFixed(1),
);

/* ── Helpers ────────────────────────────────────────────────── */

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="traffic-tab-bar">
      {tabs.map((t) => (
        <button key={t} className={active === t ? 'active' : ''} onClick={() => onChange(t)}>{t}</button>
      ))}
    </div>
  );
}

function CompareSelector({ value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="compare-select">
        <option value="today-lastweek">今日vs上周</option>
        <option value="today-lastmonth">今日vs上月</option>
        <option value="custom">自定义</option>
      </select>
      {value === 'custom' && (
        <input type="date" defaultValue="2026-03-13" className="compare-select"
          style={{ width: 110, fontSize: '.7rem' }} />
      )}
    </div>
  );
}

function AnomalyWrap({ change, children }) {
  const isAnomaly = change !== undefined && Math.abs(change) > 10;
  if (!isAnomaly) return children;
  return (
    <div className="anomaly-pulse" style={{ position: 'relative' }}>
      <span className="anomaly-badge-abs">异常</span>
      {children}
    </div>
  );
}

/* ── Chart Builders ─────────────────────────────────────────── */

function pieOption(data) {
  return {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie', radius: ['35%', '65%'],
      data: data.map((d, i) => ({ ...d, itemStyle: { color: PALETTE[i % PALETTE.length] } })),
      label: { color: '#94a3b8', fontSize: 11, formatter: '{b}\n{d}%' },
    }],
  };
}

function lineChartOption(xData, seriesList) {
  return {
    ...CHART_BASE,
    tooltip: { trigger: 'axis' },
    legend: { data: seriesList.map((s) => s.name), textStyle: { color: '#94a3b8' }, top: 0 },
    xAxis: { ...X_AXIS, data: xData },
    yAxis: Y_AXIS,
    series: seriesList.map((s, i) => ({
      name: s.name, type: 'line', data: s.data, smooth: true, color: PALETTE[i * 2] || PALETTE[i],
    })),
  };
}

function threeLineOption(hours, todayData, lastWeekData, lastMonthData, withArea) {
  return {
    ...CHART_BASE,
    tooltip: { trigger: 'axis' },
    legend: { data: ['今日', '上周同期', '上月平均'], textStyle: { color: '#94a3b8' }, top: 0 },
    xAxis: { ...X_AXIS, data: hours },
    yAxis: Y_AXIS,
    series: [
      {
        name: '今日', type: 'line', data: todayData, smooth: true, color: '#00d4ff',
        ...(withArea ? { areaStyle: { color: 'rgba(0,212,255,.08)' } } : {}),
      },
      { name: '上周同期', type: 'line', data: lastWeekData, smooth: true, color: '#818cf8', lineStyle: { type: 'dashed' } },
      { name: '上月平均', type: 'line', data: lastMonthData, smooth: true, color: '#94a3b8', lineStyle: { type: 'dashed' } },
    ],
  };
}

function gaugeOption(value, label, color) {
  return {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8' },
    series: [{
      type: 'gauge', startAngle: 200, endAngle: -20, min: 0, max: 100,
      progress: { show: true, width: 10, itemStyle: { color } },
      detail: { valueAnimation: true, formatter: '{value}%', color, offsetCenter: [0, '70%'], fontSize: 16 },
      data: [{ value, name: label }],
      axisLine: { lineStyle: { width: 10, color: [[1, 'rgba(255,255,255,.1)']] } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      pointer: { show: false },
      title: { offsetCenter: [0, '92%'], color: '#94a3b8', fontSize: 11 },
    }],
  };
}

function funnelOption(data, palette = PALETTE) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  return {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8' },
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}: ${p.value?.toLocaleString()} (${((p.value / total) * 100).toFixed(1)}%)`
    },
    series: [{
      type: 'funnel', sort: 'descending', left: '10%', right: '10%', top: 16, bottom: 8,
      gap: 4,
      label: {
        show: true,
        position: 'inside',
        color: '#e2e8f0',
        fontSize: 11,
        formatter: (p) => `${p.name}\n${p.value?.toLocaleString()} (${((p.value / total) * 100).toFixed(1)}%)`
      },
      itemStyle: { borderWidth: 0 },
      data: data.map((d, i) => ({ ...d, itemStyle: { color: palette[i % palette.length] } })),
    }],
  };
}

function DistrictRatesList({ districts, label1, label2, onDistrictClick, selectedDistrict }) {
  return (
    <ul className="rank-list" style={{ marginTop: 8 }}>
      {districts.map((d, i) => (
        <li key={d}>
          <span className="rank">{i + 1}</span>
          <span className="name">{d}</span>
          <span className="count">{randFloat(85, 96)}%</span>
          <span className="count" style={{ marginLeft: 8 }}>{randFloat(88, 99)}%</span>
          <span className="district-pin" onClick={() => onDistrictClick && onDistrictClick(selectedDistrict === d ? null : d)}>📍</span>
        </li>
      ))}
      <li style={{ color: '#64748b', fontSize: '.7rem', borderBottom: 'none', paddingTop: 4 }}>
        <span className="rank" /><span className="name" /><span className="count">{label1}</span><span className="count" style={{ marginLeft: 8 }}>{label2}</span>
      </li>
    </ul>
  );
}

function CheckpointBlock({ title, data, expanded, setExpanded, compareValue, onCompareChange, yoyType, onYoyChange }) {
  return (
    <PanelCard title={title}>
      <AnomalyWrap change={data.change}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
          <span className="big-number" style={{ marginBottom: 0 }}>{data.today.toLocaleString()}</span>
          <span className={`trend-badge ${data.change >= 0 ? 'up' : 'down'}`}>
            {data.change >= 0 ? '↑' : '↓'} {Math.abs(data.change)}%
          </span>
        </div>
      </AnomalyWrap>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <CompareSelector value={compareValue} onChange={onCompareChange} />
      </div>
      <ReactECharts style={{ height: 160 }} option={threeLineOption(
        data.hourly.map((h) => h.hour),
        data.hourly.map((h) => h.today),
        data.hourly.map((h) => h.lastWeek),
        data.hourly.map((h) => h.lastMonth),
        true,
      )} />

      <div className="pie-row" style={{ flexDirection: 'row' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: 4, textAlign: 'center' }}>归属地</div>
          <ReactECharts style={{ height: 140 }} option={pieOption(data.origin)} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: 4, textAlign: 'center' }}>号牌种类</div>
          <ReactECharts style={{ height: 140 }} option={pieOption([
            { name: '小型车', value: 72 }, { name: '大型车', value: 18 }, { name: '其它', value: 10 },
          ])} />
        </div>
      </div>

      <div className="checkpoint-table" style={{ marginTop: 8 }}>
        <div className="table-header">
          <span>排名</span>
          <span>卡口</span>
          <span>5分钟</span>
          <span>日累计</span>
          <span>
            <select
              value={yoyType || 'week'}
              onChange={(e) => onYoyChange && onYoyChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '.72rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="day">日同比</option>
              <option value="week">周同比</option>
            </select>
          </span>
          <span>分担率</span>
        </div>
        {data.topCheckpoints.flatMap((c) => {
          const changeValue = yoyType === 'day' ? c.changeDay : c.change;
          const items = [
            <div key={c.rank} className="table-row cp-clickable" onClick={() => setExpanded(expanded === c.rank ? null : c.rank)}>
              <span>{c.rank}</span>
              <span>{c.name}</span>
              <span>{c.flow5min}</span>
              <span>{c.dayTotal.toLocaleString()}</span>
              <span className={changeValue >= 0 ? 'up' : 'down'}>{changeValue >= 0 ? '+' : ''}{changeValue}%</span>
              <span>{c.ratio}%</span>
            </div>,
          ];
          if (expanded === c.rank) {
            items.push(
              <div key={`cpd-${c.rank}`} className="cp-expand-detail">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{c.name}</strong>
                  <button
                    className="video-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`打开 ${c.name} 视频监控`);
                    }}
                  >
                    📹 查看视频监控
                  </button>
                </div>
                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ fontSize: '.78rem', color: '#94a3b8' }}>进城数: <span style={{ color: '#22c55e' }}>{c.inbound?.toLocaleString() || rand(2000, 5000)}</span></div>
                  <div style={{ fontSize: '.78rem', color: '#94a3b8' }}>出城数: <span style={{ color: '#f59e0b' }}>{c.outbound?.toLocaleString() || rand(1500, 4000)}</span></div>
                </div>
                <div style={{ marginTop: 6, fontSize: '.78rem', color: '#94a3b8' }}>
                  设备状态: <span style={{ color: '#22c55e' }}>在线</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: 4 }}>今日流量趋势</div>
                  <div className="sparkline-placeholder">▁▂▃▅▆▇▅▃▂▁</div>
                </div>
              </div>,
            );
          }
          return items;
        })}
      </div>
    </PanelCard>
  );
}

/* ── Main Hook ──────────────────────────────────────────────── */

export default function useTrafficStatus() {
  const [activeTab, setActiveTab] = useState('城市概况');
  const [vehicleInnerTab, setVehicleInnerTab] = useState('趋势');
  const [driverInnerTab, setDriverInnerTab] = useState('趋势');
  const [roadInnerTab, setRoadInnerTab] = useState('路网概况');
  const [trafficCompare, setTrafficCompare] = useState('today-lastweek');
  const [activeCompare, setActiveCompare] = useState('today-lastweek');
  const [transitCompare, setTransitCompare] = useState('today-lastweek');
  const [inboundCompare, setInboundCompare] = useState('today-lastweek');
  const [outboundCompare, setOutboundCompare] = useState('today-lastweek');
  const [watchedItems, setWatchedItems] = useState(new Set());
  const [expandedRoad, setExpandedRoad] = useState(null);
  const [expandedArea, setExpandedArea] = useState(null);
  const [expandedCpIn, setExpandedCpIn] = useState(null);
  const [expandedCpOut, setExpandedCpOut] = useState(null);
  const [inboundYoyType, setInboundYoyType] = useState('week');
  const [outboundYoyType, setOutboundYoyType] = useState('week');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showAllStatus, setShowAllStatus] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const autoRotateRef = useRef(null);

  const isDistrictRankActive = (activeTab === '城市概况' && (vehicleInnerTab === '辖区排名' || driverInnerTab === '辖区排名' || roadInnerTab === '辖区排名' || vehicleInnerTab === '两率' || driverInnerTab === '重点驾驶人两率'));

  useEffect(() => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    if (!isDistrictRankActive) { setSelectedDistrict(null); return; }
    let idx = 0;
    setSelectedDistrict(DISTRICTS_7[0]);
    autoRotateRef.current = setInterval(() => {
      idx = (idx + 1) % DISTRICTS_7.length;
      setSelectedDistrict(DISTRICTS_7[idx]);
    }, 5000);
    return () => { if (autoRotateRef.current) clearInterval(autoRotateRef.current); };
  }, [isDistrictRankActive]);

  const {
    vehicleOwnership, driverOwnership, roadNetwork, trafficIndex,
    activeVehicles, transitVehicles, inboundVehicles, outboundVehicles,
  } = trafficStatusData;

  const vehicleInnerTabs = ['趋势', '辖区排名', '状态分析', '类型分布', '使用性质', '两率'];
  const driverInnerTabs = ['趋势', '辖区排名', '驾证状态', '年龄构成', '驾龄分布', '驾证类型', '重点驾驶人两率'];
  const roadInnerTabs = ['路网概况', '合理性对比', '辖区排名'];

  const toggleWatch = (key) => {
    setWatchedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const densityAnomaly = roadNetwork.density < 3.0 || roadNetwork.density > 8.0;

  /* ── 城市概况 LEFT ───────────────────────────────────────── */
  const cityLeftPanel = (
    <>
      <PanelCard title="机动车保有量">
        <div className="big-number">{vehicleOwnership.total.toLocaleString()}</div>
        <TabBar tabs={vehicleInnerTabs} active={vehicleInnerTab} onChange={setVehicleInnerTab} />

        {vehicleInnerTab === '趋势' && (
          <ReactECharts style={{ height: 220 }} option={lineChartOption(
            vehicleOwnership.monthlyTrend.map((m) => m.month),
            [
              { name: '保有量', data: vehicleOwnership.monthlyTrend.map((m) => m.total) },
              { name: '新增', data: vehicleOwnership.monthlyTrend.map((m) => m.added) },
              { name: '注销', data: vehicleOwnership.monthlyTrend.map((m) => m.cancelled) },
            ],
          )} />
        )}

        {vehicleInnerTab === '辖区排名' && (
          <ul className="rank-list">
            {vehicleOwnership.districtRank.map((d, i) => (
              <li key={d.name}>
                <span className="rank">{i + 1}</span>
                <span className="name">{d.name}</span>
                <span className="count">{d.count.toLocaleString()}</span>
                <span className={`change ${d.change >= 0 ? 'up' : 'down'}`}>
                  {d.change >= 0 ? '+' : ''}{d.change}%
                </span>
                <span className="district-pin" onClick={() => setSelectedDistrict(selectedDistrict === d.name ? null : d.name)}>📍</span>
              </li>
            ))}
          </ul>
        )}

        {vehicleInnerTab === '状态分析' && (() => {
          const allStatus = vehicleOwnership.statusAll || [];
          const top5 = allStatus.slice(0, 5);
          const others = allStatus.slice(5);
          const othersTotal = others.reduce((sum, s) => sum + s.count, 0);
          const displayData = showAllStatus ? allStatus : [...top5, ...(othersTotal > 0 ? [{ name: '其他', count: othersTotal }] : [])];
          return (
            <>
              <ReactECharts style={{ height: showAllStatus ? 280 : 200 }} option={{
                ...CHART_BASE,
                tooltip: { trigger: 'axis' },
                xAxis: { ...X_AXIS, type: 'value' },
                yAxis: { ...Y_AXIS, type: 'category', data: displayData.map((s) => s.name).reverse() },
                series: [{ type: 'bar', data: displayData.map((s) => s.count).reverse(), itemStyle: { color: PALETTE[0] }, barWidth: 16 }],
              }} />
              <button className="expand-btn" onClick={() => setShowAllStatus(!showAllStatus)}>
                {showAllStatus ? '收起' : '查看全部'}
              </button>
            </>
          );
        })()}

        {vehicleInnerTab === '类型分布' && (() => {
          const allTypes = vehicleOwnership.typeAll || [];
          const top5 = allTypes.slice(0, 5);
          const others = allTypes.slice(5);
          const othersTotal = others.reduce((sum, t) => sum + t.value, 0);
          const displayData = showAllTypes ? allTypes : [...top5, ...(othersTotal > 0 ? [{ name: '其他', value: othersTotal }] : [])];
          return (
            <>
              <ReactECharts style={{ height: 220 }} option={pieOption(displayData)} />
              <button className="expand-btn" onClick={() => setShowAllTypes(!showAllTypes)}>
                {showAllTypes ? '收起' : '查看全部'}
              </button>
            </>
          );
        })()}

        {vehicleInnerTab === '使用性质' && (
          <ReactECharts style={{ height: 220 }} option={{
            backgroundColor: 'transparent',
            textStyle: { color: '#94a3b8' },
            tooltip: { trigger: 'item' },
            series: [{
              type: 'pie', radius: ['45%', '70%'],
              data: vehicleOwnership.usageNature.map((d, i) => ({ ...d, itemStyle: { color: PALETTE[i * 2] } })),
              label: { color: '#94a3b8', fontSize: 11 },
            }],
          }} />
        )}

        {vehicleInnerTab === '两率' && (
          <>
            <div className="gauge-row">
              <ReactECharts style={{ height: 150, flex: 1 }} option={gaugeOption(vehicleOwnership.inspectionRate, '检验率', PALETTE[0])} />
              <ReactECharts style={{ height: 150, flex: 1 }} option={gaugeOption(vehicleOwnership.scrapRate, '报废率', PALETTE[2])} />
            </div>
            <div className="rate-abs-line">
              未检验 {Math.round(vehicleOwnership.total * (1 - vehicleOwnership.inspectionRate / 100))} 辆 · 未报废 {Math.round(vehicleOwnership.total * (1 - vehicleOwnership.scrapRate / 100))} 辆
            </div>
            <DistrictRatesList districts={DISTRICTS_7} label1="检验率" label2="报废率" onDistrictClick={setSelectedDistrict} selectedDistrict={selectedDistrict} />
          </>
        )}
      </PanelCard>

      <PanelCard title="路网分析">
        <div style={{ display: 'flex', gap: 24, marginBottom: 10 }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '.75rem' }}>路网密度</span>
            <div className="big-number" style={{ fontSize: '1.3rem', marginBottom: 0 }}>
              <span style={densityAnomaly ? { color: '#ef4444' } : {}}>{roadNetwork.density}</span>
              {densityAnomaly && <span className="anomaly-badge-inline">异常</span>}
              <small style={{ fontSize: '.65rem', color: '#94a3b8' }}> km/km²</small>
            </div>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '.75rem' }}>总里程</span>
            <div className="big-number" style={{ fontSize: '1.3rem', marginBottom: 0 }}>
              {roadNetwork.totalLength.toLocaleString()} <small style={{ fontSize: '.65rem', color: '#94a3b8' }}>km</small>
            </div>
          </div>
        </div>
        <TabBar tabs={roadInnerTabs} active={roadInnerTab} onChange={setRoadInnerTab} />

        {roadInnerTab === '路网概况' && (
          <div className="checkpoint-table">
            <div className="table-header" style={{ gridTemplateColumns: '1fr 70px 60px' }}>
              <span>路网类型</span><span>里程(km)</span><span>条数</span>
            </div>
            {roadNetwork.roads.map((r) => (
              <div key={r.type} className="table-row" style={{ gridTemplateColumns: '1fr 70px 60px' }}>
                <span>{r.type}</span><span>{r.km}</span><span>{r.count}</span>
              </div>
            ))}
          </div>
        )}

        {roadInnerTab === '合理性对比' && (() => {
          const totalActualKm = roadNetwork.roads.reduce((s, r) => s + r.km, 0);
          const ratios = [1, 2, 3, 6];
          const ratioSum = ratios.reduce((a, b) => a + b, 0);
          const standardKms = ratios.map((r) => +((r / ratioSum) * totalActualKm).toFixed(1));
          return (
            <ReactECharts style={{ height: 220 }} option={{
              ...CHART_BASE,
              tooltip: { trigger: 'axis' },
              legend: { data: ['标准', '实际'], textStyle: { color: '#94a3b8' }, top: 0 },
              xAxis: { ...X_AXIS, data: roadNetwork.roads.map((r) => r.type) },
              yAxis: Y_AXIS,
              series: [
                { name: '标准', type: 'bar', data: standardKms, itemStyle: { color: '#3b82f6' }, barGap: '10%', barWidth: 18 },
                { name: '实际', type: 'bar', data: roadNetwork.roads.map((r) => r.km), itemStyle: { color: '#f59e0b' }, barWidth: 18 },
              ],
            }} />
          );
        })()}

        {roadInnerTab === '辖区排名' && (
          <ul className="rank-list">
            {roadNetwork.districtRank.map((d, i) => (
              <li key={d.name}>
                <span className="rank">{i + 1}</span>
                <span className="name">{d.name}</span>
                <span className="count">{d.density} km/km²</span>
                <span className="count" style={{ marginLeft: 8 }}>{d.totalKm.toLocaleString()} km</span>
                <span className="district-pin" onClick={() => setSelectedDistrict(selectedDistrict === d.name ? null : d.name)}>📍</span>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>
    </>
  );

  /* ── 城市概况 RIGHT ──────────────────────────────────────── */
  const cityRightPanel = (
    <PanelCard title="驾驶人保有量">
      <div className="big-number">{driverOwnership.total.toLocaleString()}</div>
      <TabBar tabs={driverInnerTabs} active={driverInnerTab} onChange={setDriverInnerTab} />

      {driverInnerTab === '趋势' && (
        <ReactECharts style={{ height: 220 }} option={lineChartOption(
          driverOwnership.monthlyTrend.map((m) => m.month),
          [
            { name: '保有量', data: driverOwnership.monthlyTrend.map((m) => m.total) },
            { name: '注册', data: driverOwnership.monthlyTrend.map((m) => m.registered) },
            { name: '注销', data: driverOwnership.monthlyTrend.map((m) => m.cancelled) },
          ],
        )} />
      )}

      {driverInnerTab === '辖区排名' && (
        <ul className="rank-list">
          {driverOwnership.districtRank.map((d, i) => (
            <li key={d.name}>
              <span className="rank">{i + 1}</span>
              <span className="name">{d.name}</span>
              <span className="count">{d.count.toLocaleString()}</span>
              <span className={`change ${d.change >= 0 ? 'up' : 'down'}`}>
                {d.change >= 0 ? '+' : ''}{d.change}%
              </span>
              <span className="district-pin" onClick={() => setSelectedDistrict(selectedDistrict === d.name ? null : d.name)}>📍</span>
            </li>
          ))}
        </ul>
      )}

      {driverInnerTab === '驾证状态' && (
        <ReactECharts style={{ height: 220 }} option={funnelOption(driverOwnership.statusFunnel)} />
      )}

      {driverInnerTab === '年龄构成' && (
        <ReactECharts style={{ height: 240 }} option={funnelOption(driverOwnership.ageFunnel)} />
      )}

      {driverInnerTab === '驾龄分布' && (
        <ReactECharts style={{ height: 220 }} option={pieOption(driverOwnership.drivingAge)} />
      )}

      {driverInnerTab === '驾证类型' && (
        <ReactECharts style={{ height: 220 }} option={pieOption(driverOwnership.licenseType)} />
      )}

      {driverInnerTab === '重点驾驶人两率' && (
        <>
          <div className="gauge-row">
            <ReactECharts style={{ height: 150, flex: 1 }} option={gaugeOption(driverOwnership.renewRate, '换证率', PALETTE[0])} />
            <ReactECharts style={{ height: 150, flex: 1 }} option={gaugeOption(driverOwnership.auditRate, '审验率', PALETTE[2])} />
          </div>
          <div className="rate-abs-line">
            逾期未换证 {Math.round(driverOwnership.total * (1 - driverOwnership.renewRate / 100))} 人 · 逾期未审验 {Math.round(driverOwnership.total * (1 - driverOwnership.auditRate / 100))} 人
          </div>
          <DistrictRatesList districts={DISTRICTS_7} label1="换证率" label2="审验率" onDistrictClick={setSelectedDistrict} selectedDistrict={selectedDistrict} />
        </>
      )}
    </PanelCard>
  );

  /* ── 运行概况 LEFT ───────────────────────────────────────── */
  const operationLeftPanel = (
    <>
      <div className="data-cards-row">
        <DataCard title="交通指数" value={trafficIndex.current} color="#00d4ff" />
        <DataCard title="平均速度" value={trafficIndex.avgSpeed} unit="km/h" color="#22c55e" />
        <AnomalyWrap change={trafficIndex.congestionChange}>
          <DataCard title="拥堵里程" value={trafficIndex.congestionKm} unit="km" trend={trafficIndex.congestionChange} color="#f59e0b" />
        </AnomalyWrap>
      </div>

      <PanelCard title="24小时交通指数" extra={<CompareSelector value={trafficCompare} onChange={setTrafficCompare} />}>
        <ReactECharts style={{ height: 200 }} option={threeLineOption(
          trafficIndex.hourlyToday.map((h) => h.hour),
          trafficIndex.hourlyToday.map((h) => h.value),
          trafficIndex.hourlyLastWeek.map((h) => h.value),
          TRAFFIC_LAST_MONTH,
        )} />
      </PanelCard>

      <PanelCard title="大队排名" subtitle="点击📍联动地图显示交通指数">
        <div className="rank-list-header" style={{ display: 'flex', fontSize: '.72rem', color: '#64748b', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.06)', marginBottom: 4 }}>
          <span style={{ width: 28 }}>排名</span>
          <span style={{ flex: 1 }}>大队名称</span>
          <span style={{ width: 60, textAlign: 'right' }}>交通指数</span>
          <span style={{ width: 56, textAlign: 'right' }}>周同比</span>
          <span style={{ width: 24 }}></span>
        </div>
        <ul className="rank-list">
          {trafficIndex.squadRank.map((s, i) => (
            <li key={s.name}>
              <span className="rank">{i + 1}</span>
              <span className="name">{s.name}</span>
              <span className="count" style={{ color: s.index > 4 ? '#ef4444' : s.index > 2 ? '#f59e0b' : '#00d4ff' }}>{s.index}</span>
              <span className={`change ${s.change >= 0 ? 'up' : 'down'}`}>
                {s.change >= 0 ? '+' : ''}{s.change}%
              </span>
              <span className="loc-btn" onClick={() => setSelectedDistrict(SQUAD_TO_DISTRICT[s.name] || null)}>📍</span>
            </li>
          ))}
        </ul>
      </PanelCard>
    </>
  );

  /* ── 运行概况 RIGHT ──────────────────────────────────────── */
  const operationRightPanel = (
    <>
      <PanelCard title="拥堵路段排名">
        <ul className="congestion-list">
          {trafficIndex.congestionRoads.flatMap((r) => {
            const items = [
              <li key={r.rank} className="congestion-row" onClick={() => setExpandedRoad(expandedRoad === r.rank ? null : r.rank)}>
                <span className="rank">{r.rank}</span>
                <span className="name">{r.name}</span>
                <span className="index">{r.index}</span>
                <span className="speed">{r.speed} km/h</span>
                {r.frequent && <span className="tag">常发</span>}
                <span className="star-btn" style={{ color: watchedItems.has(`road-${r.rank}`) ? '#f59e0b' : '#64748b' }} onClick={(e) => { e.stopPropagation(); toggleWatch(`road-${r.rank}`); }}>
                  {watchedItems.has(`road-${r.rank}`) ? '★' : '☆'}
                </span>
              </li>,
            ];
            if (expandedRoad === r.rank) {
              items.push(
                <li key={`rd-${r.rank}`} className="expand-detail">
                  <div>{r.name} · 拥堵指数 <strong>{r.index}</strong> · {r.speed} km/h</div>
                  <div style={{ marginTop: 4 }}>视频 {4 + r.rank} · 警力 {Math.max(1, 5 - r.rank)} · 警情 {r.rank <= 2 ? 2 : 1}</div>
                </li>,
              );
            }
            return items;
          })}
        </ul>
      </PanelCard>

      <PanelCard title="拥堵区域">
        <ul className="congestion-list">
          {trafficIndex.congestionAreas.flatMap((a) => {
            const items = [
              <li key={a.rank} className="congestion-row" onClick={() => setExpandedArea(expandedArea === a.rank ? null : a.rank)}>
                <span className="rank">{a.rank}</span>
                <span className="name">{a.name}</span>
                <span className="index">{a.index}</span>
                <span className="speed">{a.speed} km/h</span>
                <span className="star-btn" style={{ color: watchedItems.has(`area-${a.rank}`) ? '#f59e0b' : '#64748b' }} onClick={(e) => { e.stopPropagation(); toggleWatch(`area-${a.rank}`); }}>
                  {watchedItems.has(`area-${a.rank}`) ? '★' : '☆'}
                </span>
              </li>,
            ];
            if (expandedArea === a.rank) {
              items.push(
                <li key={`ad-${a.rank}`} className="expand-detail">
                  <div>{a.name} · 拥堵指数 <strong>{a.index}</strong> · {a.speed} km/h</div>
                  <div style={{ marginTop: 4 }}>视频 {6 + a.rank} · 警力 {Math.max(1, 4 - a.rank)} · 警情 {a.rank <= 2 ? 3 : 1}</div>
                </li>,
              );
            }
            return items;
          })}
        </ul>
      </PanelCard>

      <PanelCard title="重点关注">
        <ul className="congestion-list">
          {trafficIndex.watchList.map((w) => (
            <li key={w.rank}>
              <span className="rank">{w.rank}</span>
              <span className="name">{w.name}</span>
              <span className="tag" style={{ background: w.type === '路段' ? 'rgba(0,212,255,.15)' : 'rgba(139,92,246,.15)', color: w.type === '路段' ? '#00d4ff' : '#8b5cf6' }}>{w.type}</span>
              <span className="index">{w.index}</span>
              <span className="speed">{w.speed} km/h</span>
              <span className="star-btn" style={{ color: watchedItems.has(`watch-${w.rank}`) ? '#f59e0b' : '#64748b' }} onClick={() => toggleWatch(`watch-${w.rank}`)}>
                {watchedItems.has(`watch-${w.rank}`) ? '★' : '☆'}
              </span>
            </li>
          ))}
        </ul>
      </PanelCard>
    </>
  );

  /* ── 内部交通压力 LEFT (日活跃车辆) ──────────────────────── */
  const internalLeftPanel = (
    <>
      <AnomalyWrap change={activeVehicles.change}>
        <DataCard title="日活跃车辆" value={activeVehicles.today} trend={activeVehicles.change} color="#00d4ff" />
      </AnomalyWrap>

      <PanelCard title="24小时趋势" extra={<CompareSelector value={activeCompare} onChange={setActiveCompare} />}>
        <ReactECharts style={{ height: 180 }} option={threeLineOption(
          activeVehicles.hourly.map((h) => h.hour),
          activeVehicles.hourly.map((h) => h.today),
          activeVehicles.hourly.map((h) => h.lastWeek),
          activeVehicles.hourly.map((h) => h.lastMonth),
        )} />
      </PanelCard>

      <PanelCard title="大队分析">
        <ul className="rank-list">
          {activeVehicles.squadRank.map((s, i) => (
            <li key={s.name}>
              <span className="rank">{i + 1}</span>
              <span className="name">{s.name}</span>
              <span className="count">{s.count.toLocaleString()}</span>
              <span className={`change ${s.change >= 0 ? 'up' : 'down'}`}>
                {s.change >= 0 ? '+' : ''}{s.change}%
              </span>
              <span className="loc-btn" onClick={() => setSelectedDistrict(SQUAD_TO_DISTRICT[s.name] || null)}>📍</span>
            </li>
          ))}
        </ul>
      </PanelCard>

      <div className="pie-row" style={{ flexDirection: 'row' }}>
        <PanelCard title="归属地分布">
          <ReactECharts style={{ height: 140 }} option={{
            ...pieOption(activeVehicles.origin),
            series: [{ ...pieOption(activeVehicles.origin).series[0], radius: ['40%', '60%'], center: ['50%', '50%'] }],
          }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, fontSize: '.72rem' }}>
            {activeVehicles.origin.map((o, i) => (
              <span key={o.name} style={{ color: ['#22c55e', '#f59e0b', '#8b5cf6'][i] }}>
                {o.name}: {o.value}%
              </span>
            ))}
          </div>
        </PanelCard>
        <PanelCard title="号牌类型">
          <ReactECharts style={{ height: 140 }} option={{
            ...pieOption(activeVehicles.plateType),
            series: [{ ...pieOption(activeVehicles.plateType).series[0], radius: ['40%', '60%'], center: ['50%', '50%'] }],
          }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, fontSize: '.72rem' }}>
            {activeVehicles.plateType.map((p, i) => (
              <span key={p.name} style={{ color: ['#00d4ff', '#f59e0b', '#64748b'][i] }}>
                {p.name}: {p.value}%
              </span>
            ))}
          </div>
        </PanelCard>
      </div>

      <PanelCard title="外省省份明细">
        <ul className="rank-list compact">
          {activeVehicles.provinceDetail.map((p, i) => (
            <li key={p.name}>
              <span className="rank">{i + 1}</span>
              <span className="name">{p.name}</span>
              <span className="count">{p.count.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </PanelCard>
    </>
  );

  /* ── 内部交通压力 RIGHT (在途车辆) ───────────────────────── */
  const internalRightPanel = (
    <>
      <AnomalyWrap change={transitVehicles.change}>
        <DataCard title="在途车辆" value={transitVehicles.today} trend={transitVehicles.change} color="#818cf8" />
      </AnomalyWrap>

      <PanelCard title="在途趋势" extra={<CompareSelector value={transitCompare} onChange={setTransitCompare} />}>
        <ReactECharts style={{ height: 180 }} option={threeLineOption(
          transitVehicles.hourly.map((h) => h.hour),
          transitVehicles.hourly.map((h) => h.today),
          transitVehicles.hourly.map((h) => h.lastWeek),
          transitVehicles.hourly.map((h) => h.lastMonth),
        )} />
      </PanelCard>

      <PanelCard title="大队分析">
        <ul className="rank-list">
          {transitVehicles.squadRank.map((s, i) => (
            <li key={s.name}>
              <span className="rank">{i + 1}</span>
              <span className="name">{s.name}</span>
              <span className="count">{s.count.toLocaleString()}</span>
              <span className={`change ${s.change >= 0 ? 'up' : 'down'}`}>
                {s.change >= 0 ? '+' : ''}{s.change}%
              </span>
            </li>
          ))}
        </ul>
      </PanelCard>

      <div className="pie-row" style={{ flexDirection: 'row' }}>
        <PanelCard title="在途归属地">
          <ReactECharts style={{ height: 160 }} option={pieOption(transitVehicles.origin)} />
        </PanelCard>
        <PanelCard title="在途号牌">
          <ReactECharts style={{ height: 160 }} option={pieOption(transitVehicles.plateType)} />
        </PanelCard>
      </div>
    </>
  );

  /* ── 进出交通压力 LEFT (进城) / RIGHT (出城) ─────────────── */
  const ioLeftPanel = (
    <CheckpointBlock title="进城车辆" data={inboundVehicles} expanded={expandedCpIn} setExpanded={setExpandedCpIn} compareValue={inboundCompare} onCompareChange={setInboundCompare} yoyType={inboundYoyType} onYoyChange={setInboundYoyType} />
  );
  const ioRightPanel = (
    <CheckpointBlock title="出城车辆" data={outboundVehicles} expanded={expandedCpOut} setExpanded={setExpandedCpOut} compareValue={outboundCompare} onCompareChange={setOutboundCompare} yoyType={outboundYoyType} onYoyChange={setOutboundYoyType} />
  );

  /* ── Assemble ─────────────────────────────────────────────── */
  const leftPanel = (
    <div className="traffic-status-panel">
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      {activeTab === '城市概况' && cityLeftPanel}
      {activeTab === '运行概况' && operationLeftPanel}
      {activeTab === '内部交通压力' && internalLeftPanel}
      {activeTab === '进出交通压力' && ioLeftPanel}

      <style>{`
        .traffic-tab-bar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .traffic-tab-bar button {
          padding: 6px 12px; font-size: .75rem; border-radius: 4px;
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
          color: #94a3b8; cursor: pointer; transition: all .2s;
        }
        .traffic-tab-bar button:hover { border-color: #00d4ff; color: #00d4ff; }
        .traffic-tab-bar button.active { background: rgba(0,212,255,.15); border-color: #00d4ff; color: #00d4ff; }

        .traffic-status-panel .big-number {
          font-family: 'Orbitron', monospace; font-size: 1.8rem; font-weight: 700;
          color: #00d4ff; margin-bottom: 12px; letter-spacing: 1px;
        }

        .rank-list { list-style: none; padding: 0; margin: 0; }
        .rank-list li {
          display: flex; align-items: center; gap: 10px; padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,.06); font-size: .82rem; color: #cbd5e1;
        }
        .rank-list .rank { width: 24px; color: #00d4ff; font-weight: 600; text-align: center; }
        .rank-list .name { flex: 1; }
        .rank-list .count { font-family: monospace; }
        .rank-list .change { font-size: .75rem; }
        .rank-list .change.up { color: #22c55e; }
        .rank-list .change.down { color: #ef4444; }
        .rank-list .loc-btn { cursor: pointer; font-size: .85rem; opacity: .5; transition: opacity .2s; }
        .rank-list .loc-btn:hover { opacity: 1; }
        .rank-list.compact li { padding: 5px 0; font-size: .78rem; }

        .gauge-row { display: flex; gap: 16px; }
        .data-cards-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }

        .congestion-list { list-style: none; padding: 0; margin: 0; max-height: 260px; overflow-y: auto; }
        .congestion-list li {
          display: flex; align-items: center; gap: 8px; padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,.06); font-size: .8rem; color: #cbd5e1;
        }
        .congestion-list .rank { width: 20px; color: #00d4ff; font-weight: 600; }
        .congestion-list .name { flex: 1; }
        .congestion-list .index { color: #00d4ff; font-family: monospace; }
        .congestion-list .speed { color: #94a3b8; font-family: monospace; font-size: .75rem; }
        .congestion-list .tag {
          font-size: .65rem; padding: 2px 6px; border-radius: 2px;
          background: rgba(245,158,11,.2); color: #f59e0b;
        }
        .congestion-row { cursor: pointer; transition: background .15s; }
        .congestion-row:hover { background: rgba(255,255,255,.03); }

        .pie-row { display: flex; flex-direction: column; gap: 12px; }

        .checkpoint-table { font-size: .78rem; }
        .checkpoint-table .table-header,
        .checkpoint-table .table-row {
          display: grid; grid-template-columns: 36px 1fr 52px 68px 52px 52px;
          gap: 6px; padding: 8px 0; align-items: center;
        }
        .checkpoint-table .table-header {
          color: #64748b; border-bottom: 1px solid rgba(255,255,255,.06); font-size: .72rem;
        }
        .checkpoint-table .table-row { color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,.04); }
        .checkpoint-table .up { color: #22c55e; }
        .checkpoint-table .down { color: #ef4444; }
        .cp-clickable { cursor: pointer; transition: background .15s; }
        .cp-clickable:hover { background: rgba(255,255,255,.03); }

        .trend-badge {
          font-size: .75rem; font-weight: 600; padding: 2px 8px; border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
        }
        .trend-badge.up { color: #22c55e; background: rgba(34,197,94,.12); }
        .trend-badge.down { color: #ef4444; background: rgba(239,68,68,.12); }

        .compare-select {
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
          color: #94a3b8; border-radius: 4px; padding: 2px 6px; font-size: .72rem;
        }

        .rate-abs-line {
          text-align: center; font-size: .75rem; color: #94a3b8;
          padding: 6px 0 2px; border-top: 1px dashed rgba(255,255,255,.08);
          margin-top: 4px;
        }

        .district-pin { font-size: .8rem; cursor: pointer; transition: transform .15s; }
        .district-pin:hover { transform: scale(1.3); }

        .star-btn { cursor: pointer; font-size: .9rem; transition: transform .15s; user-select: none; }
        .star-btn:hover { transform: scale(1.25); }

        .expand-detail {
          display: block !important; flex-direction: column;
          background: rgba(0,212,255,.05); padding: 10px 12px !important;
          border-left: 2px solid #00d4ff; font-size: .78rem; color: #94a3b8;
          animation: slideDown .2s ease;
        }
        .cp-expand-detail {
          background: rgba(0,212,255,.05); padding: 10px 12px;
          border-left: 2px solid #00d4ff; font-size: .78rem; color: #94a3b8;
          animation: slideDown .2s ease;
        }

        .sparkline-placeholder {
          font-family: monospace; font-size: .7rem; color: #00d4ff;
          letter-spacing: 1px; opacity: .7;
        }

        .video-btn {
          padding: 4px 10px;
          background: rgba(239,68,68,.15);
          border: 1px solid rgba(239,68,68,.3);
          border-radius: 4px;
          color: #ef4444;
          font-size: .72rem;
          cursor: pointer;
          transition: all .2s;
        }
        .video-btn:hover {
          background: rgba(239,68,68,.25);
          border-color: rgba(239,68,68,.5);
        }

        .anomaly-pulse { animation: anomalyPulse 1.5s ease-in-out infinite; border-radius: 8px; }
        .anomaly-badge-abs {
          position: absolute; top: -6px; right: -6px; z-index: 1;
          background: #ef4444; color: #fff; font-size: .6rem;
          padding: 1px 6px; border-radius: 8px; font-weight: 600;
        }
        .anomaly-badge-inline {
          background: #ef4444; color: #fff; font-size: .6rem;
          padding: 1px 6px; border-radius: 8px; font-weight: 600;
          margin-left: 6px; vertical-align: middle;
        }
        @keyframes anomalyPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50% { box-shadow: 0 0 12px 2px rgba(239,68,68,.3); }
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 200px; }
        }
        .expand-btn {
          display: block; width: 100%; margin-top: 8px; padding: 6px 0;
          background: rgba(0,212,255,.1); border: 1px solid rgba(0,212,255,.3);
          border-radius: 4px; color: #00d4ff; font-size: .75rem; cursor: pointer;
          transition: all .2s;
        }
        .expand-btn:hover { background: rgba(0,212,255,.2); }
      `}</style>
    </div>
  );

  const rightPanel = (
    <div className="traffic-status-panel">
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      {activeTab === '城市概况' && cityRightPanel}
      {activeTab === '运行概况' && operationRightPanel}
      {activeTab === '内部交通压力' && internalRightPanel}
      {activeTab === '进出交通压力' && ioRightPanel}
    </div>
  );

  const getMapDistrictColors = () => {
    if (selectedDistrict) return [{ name: selectedDistrict, color: '#00d4ff', score: '' }];
    // 运行概况 - 大队排名交通指数
    if (activeTab === '运行概况') {
      return trafficIndex.squadRank.map(s => ({
        name: SQUAD_TO_DISTRICT[s.name] || s.name,
        color: s.index > 4 ? '#ef4444' : s.index > 2 ? '#f59e0b' : '#22c55e',
        score: `指数 ${s.index}`
      }));
    }
    // 机动车辖区排名
    if (activeTab === '城市概况' && vehicleInnerTab === '辖区排名') {
      const sorted = [...vehicleOwnership.districtRank].sort((a, b) => b.count - a.count);
      const max = sorted[0]?.count || 1;
      return sorted.map((d, i) => ({
        name: d.name,
        color: i === 0 ? '#22c55e' : i < 3 ? '#00d4ff' : i < 5 ? '#f59e0b' : '#818cf8',
        score: d.count.toLocaleString()
      }));
    }
    // 机动车两率
    if (activeTab === '城市概况' && vehicleInnerTab === '两率') {
      return DISTRICTS_7.map(d => {
        const rate = randFloat(85, 98);
        return { name: d, color: rate > 92 ? '#22c55e' : rate > 85 ? '#f59e0b' : '#ef4444', score: rate + '%' };
      });
    }
    // 驾驶人辖区排名
    if (activeTab === '城市概况' && driverInnerTab === '辖区排名') {
      const sorted = [...driverOwnership.districtRank].sort((a, b) => b.count - a.count);
      const max = sorted[0]?.count || 1;
      return sorted.map((d, i) => ({
        name: d.name,
        color: i === 0 ? '#22c55e' : i < 3 ? '#00d4ff' : i < 5 ? '#f59e0b' : '#818cf8',
        score: d.count.toLocaleString()
      }));
    }
    // 重点驾驶人两率
    if (activeTab === '城市概况' && driverInnerTab === '重点驾驶人两率') {
      return DISTRICTS_7.map(d => {
        const rate = randFloat(82, 96);
        return { name: d, color: rate > 90 ? '#22c55e' : rate > 82 ? '#f59e0b' : '#ef4444', score: rate + '%' };
      });
    }
    return undefined;
  };

  // 获取选中辖区的详情数据
  const getSelectedDistrictDetail = () => {
    if (!selectedDistrict) return null;
    if (activeTab === '城市概况' && (vehicleInnerTab === '辖区排名' || vehicleInnerTab === '两率')) {
      return vehicleOwnership.districtRank.find(d => d.name === selectedDistrict);
    }
    if (activeTab === '城市概况' && (driverInnerTab === '辖区排名' || driverInnerTab === '重点驾驶人两率')) {
      return driverOwnership.districtRank.find(d => d.name === selectedDistrict);
    }
    if (activeTab === '城市概况' && roadInnerTab === '辖区排名') {
      return roadNetwork.districtRank.find(d => d.name === selectedDistrict);
    }
    return null;
  };

  const mapContent = (
    <AMapView districtColors={getMapDistrictColors()} districtDetail={getSelectedDistrictDetail()} />
  );

  return { leftPanel, rightPanel, mapContent };
}
