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
};
const X_AXIS = { type: 'category', axisLine: { lineStyle: { color: 'rgba(255,255,255,.06)' } }, axisLabel: { color: '#94a3b8' } };
const Y_AXIS = { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,.06)' } }, axisLine: { lineStyle: { color: 'rgba(255,255,255,.06)' } }, axisLabel: { color: '#94a3b8' } };

const DISTRICTS_7 = ['利州区', '昭化区', '朝天区', '旺苍县', '青川县', '剑阁县', '苍溪县'];
const randFloat = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="traffic-tab-bar">
      {tabs.map((t) => (
        <button key={t} className={active === t ? 'active' : ''} onClick={() => onChange(t)}>{t}</button>
      ))}
    </div>
  );
}

function pieOption(data) {
  return {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['35%', '65%'],
      data: data.map((d, i) => ({ ...d, itemStyle: { color: PALETTE[i % PALETTE.length] } })),
      label: { color: '#94a3b8', fontSize: 11 },
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
  return {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8' },
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [{
      type: 'funnel', sort: 'descending', left: '10%', right: '10%', top: 16, bottom: 8,
      gap: 4, label: { show: true, position: 'inside', color: '#e2e8f0', fontSize: 11 },
      itemStyle: { borderWidth: 0 },
      data: data.map((d, i) => ({ ...d, itemStyle: { color: palette[i % palette.length] } })),
    }],
  };
}

function DistrictRatesList({ districts, label1, label2 }) {
  return (
    <ul className="rank-list" style={{ marginTop: 8 }}>
      {districts.map((d, i) => (
        <li key={d}>
          <span className="rank">{i + 1}</span>
          <span className="name">{d}</span>
          <span className="count">{randFloat(85, 96)}%</span>
          <span className="count" style={{ marginLeft: 8 }}>{randFloat(88, 99)}%</span>
        </li>
      ))}
      <li style={{ color: '#64748b', fontSize: '.7rem', borderBottom: 'none', paddingTop: 4 }}>
        <span className="rank" /><span className="name" /><span className="count">{label1}</span><span className="count" style={{ marginLeft: 8 }}>{label2}</span>
      </li>
    </ul>
  );
}

export default function useTrafficStatus() {
  const [activeTab, setActiveTab] = useState('城市概况');
  const [vehicleInnerTab, setVehicleInnerTab] = useState('趋势');
  const [driverInnerTab, setDriverInnerTab] = useState('趋势');
  const [roadInnerTab, setRoadInnerTab] = useState('路网概况');
  const [trafficCompare, setTrafficCompare] = useState('today-lastweek');
  const [activeCompare, setActiveCompare] = useState('today-lastweek');

  const {
    vehicleOwnership, driverOwnership, roadNetwork, trafficIndex,
    activeVehicles, transitVehicles, inboundVehicles, outboundVehicles,
  } = trafficStatusData;

  const vehicleInnerTabs = ['趋势', '辖区排名', '状态分析', '类型分布', '使用性质', '两率'];
  const driverInnerTabs = ['趋势', '辖区排名', '驾证状态', '年龄构成', '驾龄分布', '驾证类型', '两率'];
  const roadInnerTabs = ['路网概况', '合理性对比', '辖区排名'];

  // ─── 城市概况 LEFT ─────────────────────────────────────────
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
                <span style={{ fontSize: '.8rem' }}>📍</span>
              </li>
            ))}
          </ul>
        )}

        {vehicleInnerTab === '状态分析' && (
          <ReactECharts style={{ height: 200 }} option={{
            ...CHART_BASE,
            tooltip: { trigger: 'axis' },
            xAxis: { ...X_AXIS, type: 'value' },
            yAxis: { ...Y_AXIS, type: 'category', data: vehicleOwnership.statusTop5.map((s) => s.name).reverse() },
            series: [{ type: 'bar', data: vehicleOwnership.statusTop5.map((s) => s.count).reverse(), itemStyle: { color: PALETTE[0] }, barWidth: 16 }],
          }} />
        )}

        {vehicleInnerTab === '类型分布' && (
          <ReactECharts style={{ height: 220 }} option={pieOption(vehicleOwnership.typeDistribution)} />
        )}

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
            <DistrictRatesList districts={DISTRICTS_7} label1="检验率" label2="报废率" />
          </>
        )}
      </PanelCard>

      <PanelCard title="路网分析">
        <div style={{ display: 'flex', gap: 24, marginBottom: 10 }}>
          <div><span style={{ color: '#64748b', fontSize: '.75rem' }}>路网密度</span><div className="big-number" style={{ fontSize: '1.3rem', marginBottom: 0 }}>{roadNetwork.density} <small style={{ fontSize: '.65rem', color: '#94a3b8' }}>km/km²</small></div></div>
          <div><span style={{ color: '#64748b', fontSize: '.75rem' }}>总里程</span><div className="big-number" style={{ fontSize: '1.3rem', marginBottom: 0 }}>{roadNetwork.totalLength.toLocaleString()} <small style={{ fontSize: '.65rem', color: '#94a3b8' }}>km</small></div></div>
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
              </li>
            ))}
          </ul>
        )}
      </PanelCard>
    </>
  );

  // ─── 城市概况 RIGHT ────────────────────────────────────────
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
              <span style={{ fontSize: '.8rem' }}>📍</span>
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

      {driverInnerTab === '两率' && (
        <>
          <div className="gauge-row">
            <ReactECharts style={{ height: 150, flex: 1 }} option={gaugeOption(driverOwnership.renewRate, '换证率', PALETTE[0])} />
            <ReactECharts style={{ height: 150, flex: 1 }} option={gaugeOption(driverOwnership.auditRate, '审验率', PALETTE[2])} />
          </div>
          <DistrictRatesList districts={DISTRICTS_7} label1="换证率" label2="审验率" />
        </>
      )}
    </PanelCard>
  );

  // ─── 运行概况 LEFT ─────────────────────────────────────────
  const compareSelector = (
    <select
      value={trafficCompare}
      onChange={(e) => setTrafficCompare(e.target.value)}
      style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: 4, padding: '2px 6px', fontSize: '.72rem' }}
    >
      <option value="today-lastweek">今日vs上周</option>
      <option value="today-lastmonth">今日vs上月</option>
    </select>
  );

  const operationLeftPanel = (
    <>
      <div className="data-cards-row">
        <DataCard title="交通指数" value={trafficIndex.current} color="#00d4ff" />
        <DataCard title="平均速度" value={trafficIndex.avgSpeed} unit="km/h" color="#22c55e" />
        <DataCard title="拥堵里程" value={trafficIndex.congestionKm} unit="km" trend={trafficIndex.congestionChange} color="#f59e0b" />
      </div>

      <PanelCard title="24小时交通指数" extra={compareSelector}>
        <ReactECharts style={{ height: 200 }} option={lineChartOption(
          trafficIndex.hourlyToday.map((h) => h.hour),
          [
            { name: '今日', data: trafficIndex.hourlyToday.map((h) => h.value) },
            { name: trafficCompare === 'today-lastweek' ? '上周' : '上月', data: trafficIndex.hourlyLastWeek.map((h) => h.value) },
          ],
        )} />
      </PanelCard>

      <PanelCard title="大队排名">
        <ul className="rank-list">
          {trafficIndex.squadRank.map((s, i) => (
            <li key={s.name}>
              <span className="rank">{i + 1}</span>
              <span className="name">{s.name}</span>
              <span className="count" style={{ color: '#00d4ff' }}>{s.index}</span>
              <span className={`change ${s.change >= 0 ? 'up' : 'down'}`}>
                {s.change >= 0 ? '+' : ''}{s.change}%
              </span>
            </li>
          ))}
        </ul>
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

      <PanelCard title="拥堵区域">
        <ul className="congestion-list">
          {trafficIndex.congestionAreas.map((a) => (
            <li key={a.rank}>
              <span className="rank">{a.rank}</span>
              <span className="name">{a.name}</span>
              <span className="index">{a.index}</span>
              <span className="speed">{a.speed} km/h</span>
            </li>
          ))}
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
            </li>
          ))}
        </ul>
      </PanelCard>
    </>
  );

  // ─── 内部交通压力 RIGHT ────────────────────────────────────
  const activeCompareSelector = (
    <select
      value={activeCompare}
      onChange={(e) => setActiveCompare(e.target.value)}
      style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: 4, padding: '2px 6px', fontSize: '.72rem' }}
    >
      <option value="today-lastweek">今日vs上周</option>
      <option value="today-lastmonth">今日vs上月</option>
    </select>
  );

  const internalRightPanel = (
    <>
      <DataCard title="日活跃车辆" value={activeVehicles.today} trend={activeVehicles.change} color="#00d4ff" />

      <PanelCard title="24小时趋势" extra={activeCompareSelector}>
        <ReactECharts style={{ height: 180 }} option={lineChartOption(
          activeVehicles.hourly.map((h) => h.hour),
          [
            { name: '今日', data: activeVehicles.hourly.map((h) => h.today) },
            { name: activeCompare === 'today-lastweek' ? '上周' : '上月', data: activeVehicles.hourly.map((h) => h.lastWeek) },
          ],
        )} />
      </PanelCard>

      <PanelCard title="大队分析">
        <ul className="rank-list">
          {trafficIndex.squadRank.map((s, i) => (
            <li key={s.name}>
              <span className="rank">{i + 1}</span>
              <span className="name">{s.name}</span>
              <span className="count">{s.activeCount.toLocaleString()}</span>
              <span className={`change ${s.change >= 0 ? 'up' : 'down'}`}>
                {s.change >= 0 ? '+' : ''}{s.change}%
              </span>
            </li>
          ))}
        </ul>
      </PanelCard>

      <div className="pie-row">
        <PanelCard title="归属地分布">
          <ReactECharts style={{ height: 160 }} option={pieOption(activeVehicles.origin)} />
        </PanelCard>
        <PanelCard title="号牌类型">
          <ReactECharts style={{ height: 160 }} option={pieOption(activeVehicles.plateType)} />
        </PanelCard>
      </div>

      <DataCard title="在途车辆" value={transitVehicles.today} trend={transitVehicles.change} color="#818cf8" />

      <PanelCard title="在途趋势">
        <ReactECharts style={{ height: 180 }} option={{
          ...CHART_BASE,
          tooltip: { trigger: 'axis' },
          xAxis: { ...X_AXIS, data: transitVehicles.hourly.map((h) => h.hour) },
          yAxis: Y_AXIS,
          series: [{ type: 'line', data: transitVehicles.hourly.map((h) => h.today), smooth: true, color: PALETTE[1] }],
        }} />
      </PanelCard>

      <div className="pie-row">
        <PanelCard title="在途归属地">
          <ReactECharts style={{ height: 160 }} option={pieOption(transitVehicles.origin)} />
        </PanelCard>
        <PanelCard title="在途号牌">
          <ReactECharts style={{ height: 160 }} option={pieOption(transitVehicles.plateType)} />
        </PanelCard>
      </div>
    </>
  );

  // ─── 进出交通压力 LEFT ─────────────────────────────────────
  function CheckpointBlock({ title, data }) {
    return (
      <PanelCard title={title}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
          <span className="big-number" style={{ marginBottom: 0 }}>{data.today.toLocaleString()}</span>
          <span className={`trend-badge ${data.change >= 0 ? 'up' : 'down'}`}>
            {data.change >= 0 ? '↑' : '↓'} {Math.abs(data.change)}%
          </span>
        </div>

        <ReactECharts style={{ height: 160 }} option={{
          ...CHART_BASE,
          tooltip: { trigger: 'axis' },
          xAxis: { ...X_AXIS, data: data.hourly.map((h) => h.hour) },
          yAxis: Y_AXIS,
          series: [{ type: 'line', data: data.hourly.map((h) => h.today), smooth: true, areaStyle: { color: 'rgba(0,212,255,.08)' }, color: PALETTE[0] }],
        }} />

        <div className="pie-row" style={{ flexDirection: 'row' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: 4, textAlign: 'center' }}>归属地</div>
            <ReactECharts style={{ height: 140 }} option={{
              backgroundColor: 'transparent',
              textStyle: { color: '#94a3b8' },
              tooltip: { trigger: 'item' },
              series: [{ type: 'pie', radius: ['30%', '58%'], data: data.origin.map((d, i) => ({ ...d, itemStyle: { color: PALETTE[i] } })), label: { color: '#94a3b8', fontSize: 10 } }],
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: 4, textAlign: 'center' }}>号牌种类</div>
            <ReactECharts style={{ height: 140 }} option={{
              backgroundColor: 'transparent',
              textStyle: { color: '#94a3b8' },
              tooltip: { trigger: 'item' },
              series: [{ type: 'pie', radius: ['30%', '58%'], data: (data.origin.length && data === inboundVehicles ? [{ name: '蓝牌', value: 72 }, { name: '黄牌', value: 18 }, { name: '绿牌', value: 7 }, { name: '其他', value: 3 }] : [{ name: '蓝牌', value: 70 }, { name: '黄牌', value: 20 }, { name: '绿牌', value: 6 }, { name: '其他', value: 4 }]).map((d, i) => ({ ...d, itemStyle: { color: PALETTE[i] } })), label: { color: '#94a3b8', fontSize: 10 } }],
            }} />
          </div>
        </div>

        <div className="checkpoint-table" style={{ marginTop: 8 }}>
          <div className="table-header">
            <span>排名</span><span>卡口</span><span>5分钟</span><span>日累计</span><span>同比</span><span>分担率</span>
          </div>
          {data.topCheckpoints.map((c) => (
            <div key={c.rank} className="table-row">
              <span>{c.rank}</span>
              <span>{c.name}</span>
              <span>{c.flow5min}</span>
              <span>{c.dayTotal.toLocaleString()}</span>
              <span className={c.change >= 0 ? 'up' : 'down'}>{c.change >= 0 ? '+' : ''}{c.change}%</span>
              <span>{c.ratio}%</span>
            </div>
          ))}
        </div>
      </PanelCard>
    );
  }

  const ioLeftPanel = (
    <>
      <CheckpointBlock title="进城车辆" data={inboundVehicles} />
      <CheckpointBlock title="出城车辆" data={outboundVehicles} />
    </>
  );

  // ─── Assemble panels by tab ────────────────────────────────
  const leftPanel = (
    <div className="traffic-status-panel">
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      {activeTab === '城市概况' && cityLeftPanel}
      {activeTab === '运行概况' && operationLeftPanel}
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

        .gauge-row { display: flex; gap: 16px; }

        .data-cards-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }

        .congestion-list { list-style: none; padding: 0; margin: 0; max-height: 220px; overflow-y: auto; }
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

        .trend-badge {
          font-size: .75rem; font-weight: 600; padding: 2px 8px; border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
        }
        .trend-badge.up { color: #22c55e; background: rgba(34,197,94,.12); }
        .trend-badge.down { color: #ef4444; background: rgba(239,68,68,.12); }
      `}</style>
    </div>
  );

  const rightPanel = (
    <div className="traffic-status-panel">
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      {activeTab === '城市概况' && cityRightPanel}
      {activeTab === '内部交通压力' && internalRightPanel}
    </div>
  );

  const mapContent = <MapView />;

  return { leftPanel, rightPanel, mapContent };
}
