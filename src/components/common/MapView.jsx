import { useEffect, useRef, useState, useMemo } from 'react';
import * as echarts from 'echarts';

const GY_CENTER = [105.84, 32.44];

const DISTRICT_CENTERS = {
  '利州区': [105.826, 32.432],
  '昭化区': [105.964, 32.323],
  '朝天区': [105.889, 32.643],
  '旺苍县': [106.290, 32.228],
  '青川县': [105.239, 32.586],
  '剑阁县': [105.527, 32.287],
  '苍溪县': [105.940, 31.732],
};

let mapRegistered = false;
let geoJsonCache = null;

async function ensureMapRegistered() {
  if (mapRegistered && geoJsonCache) return geoJsonCache;
  try {
    const base = import.meta.env.BASE_URL || '/';
    const res = await fetch(`${base}guangyuan.json`);
    geoJsonCache = await res.json();
    echarts.registerMap('guangyuan', geoJsonCache);
    mapRegistered = true;
    return geoJsonCache;
  } catch (e) {
    console.error('Failed to load Guangyuan GeoJSON:', e);
    return null;
  }
}

export { DISTRICT_CENTERS, GY_CENTER };

export default function MapView({
  markers = [],
  heatmapData,
  districtColors,
  onMarkerClick,
  children,
  showDistrictLabel = true,
  zoom = 1,
}) {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    ensureMapRegistered().then((geo) => {
      if (disposed || !geo || !chartRef.current) return;
      setReady(true);
    });
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    if (!ready || !chartRef.current) return;

    const chart = echarts.init(chartRef.current, null, { renderer: 'canvas' });
    instanceRef.current = chart;

    const resizeOb = new ResizeObserver(() => chart.resize());
    resizeOb.observe(chartRef.current);

    return () => {
      resizeOb.disconnect();
      chart.dispose();
      instanceRef.current = null;
    };
  }, [ready]);

  useEffect(() => {
    if (!instanceRef.current || !ready) return;
    const chart = instanceRef.current;

    const districtMap = {};
    if (districtColors) {
      districtColors.forEach(d => { districtMap[d.name] = d; });
    }

    const geoRegions = Object.keys(DISTRICT_CENTERS).map(name => {
      const dc = districtMap[name];
      return {
        name,
        itemStyle: {
          areaColor: dc ? dc.color + '25' : 'rgba(0,212,255,.06)',
          borderColor: dc ? dc.color + '80' : 'rgba(0,212,255,.25)',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: dc ? dc.color + '40' : 'rgba(0,212,255,.15)',
            borderColor: '#00d4ff',
            borderWidth: 2,
          },
        },
        label: {
          show: showDistrictLabel,
          color: dc ? dc.color : '#64748b',
          fontSize: 11,
          fontWeight: dc ? 700 : 400,
        },
      };
    });

    const series = [];

    if (markers.length > 0) {
      const typeGroups = {};
      markers.forEach(m => {
        const t = m.type || 'default';
        if (!typeGroups[t]) typeGroups[t] = [];
        typeGroups[t].push(m);
      });

      const typeConfig = {
        camera:      { color: '#00d4ff', symbol: 'circle', size: 7, name: '监控' },
        checkpoint:  { color: '#22c55e', symbol: 'diamond', size: 8, name: '卡口' },
        signal:      { color: '#f59e0b', symbol: 'triangle', size: 8, name: '信号机' },
        enforcement: { color: '#3b82f6', symbol: 'rect', size: 7, name: '执法站' },
        persuasion:  { color: '#22c55e', symbol: 'circle', size: 5, name: '劝导站' },
        inspection:  { color: '#8b5cf6', symbol: 'pin', size: 10, name: '检查站' },
        alert:       { color: '#ef4444', symbol: 'circle', size: 10, name: '报警' },
        default:     { color: '#00d4ff', symbol: 'circle', size: 6, name: '标注' },
      };

      Object.entries(typeGroups).forEach(([type, items]) => {
        const cfg = typeConfig[type] || typeConfig.default;
        series.push({
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: items.map(m => ({
            name: m.name || '',
            value: [m.lng, m.lat, m.count || 1],
            itemData: m,
          })),
          symbolSize: cfg.size,
          symbol: cfg.symbol,
          showEffectOn: type === 'alert' ? 'render' : 'emphasis',
          rippleEffect: {
            brushType: 'stroke',
            scale: type === 'alert' ? 4 : 2.5,
            period: type === 'alert' ? 2 : 4,
          },
          itemStyle: {
            color: cfg.color,
            shadowBlur: 8,
            shadowColor: cfg.color + '80',
          },
          label: { show: false },
          tooltip: {
            formatter: (p) => {
              const d = p.data.itemData;
              let html = `<b>${d.name || d.plate || ''}</b>`;
              if (d.status) html += `<br/>状态: ${d.status === 'online' ? '<span style="color:#22c55e">在线</span>' : '<span style="color:#ef4444">离线</span>'}`;
              if (d.code) html += `<br/>编号: ${d.code}`;
              if (d.reason) html += `<br/>原因: ${d.reason}`;
              if (d.location) html += `<br/>地点: ${d.location}`;
              return html;
            },
          },
          zlevel: type === 'alert' ? 5 : 2,
        });
      });
    }

    if (heatmapData && heatmapData.length > 0) {
      series.push({
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: heatmapData.map(h => ({
          name: h.type || '事故',
          value: [h.lng, h.lat, h.count || 1],
          itemData: h,
        })),
        symbolSize: (val) => 6 + (val[2] || 1) * 2.5,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 3, period: 3 },
        itemStyle: {
          color: 'rgba(239,68,68,.75)',
          shadowBlur: 10,
          shadowColor: 'rgba(239,68,68,.4)',
        },
        tooltip: {
          formatter: (p) => {
            const d = p.data.itemData;
            return `${d.type || '事故'}<br/>时间: ${d.time || ''}<br/>严重度: ${d.count}`;
          },
        },
        zlevel: 3,
      });
    }

    if (districtColors) {
      series.push({
        type: 'scatter',
        coordinateSystem: 'geo',
        data: districtColors.map(d => ({
          name: d.name,
          value: [...(DISTRICT_CENTERS[d.name] || GY_CENTER), d.score],
        })),
        symbol: 'circle',
        symbolSize: 28,
        itemStyle: {
          color: 'transparent',
          borderWidth: 0,
        },
        label: {
          show: true,
          formatter: (p) => p.data.value[2],
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
        },
        zlevel: 4,
      });
    }

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        show: true,
        backgroundColor: 'rgba(5,11,26,.92)',
        borderColor: 'rgba(0,212,255,.3)',
        borderWidth: 1,
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        padding: [8, 12],
      },
      geo: {
        map: 'guangyuan',
        roam: true,
        zoom: zoom,
        center: GY_CENTER,
        label: {
          show: showDistrictLabel,
          color: '#64748b',
          fontSize: 11,
        },
        emphasis: {
          label: {
            show: true,
            color: '#00d4ff',
            fontSize: 13,
            fontWeight: 700,
          },
        },
        itemStyle: {
          areaColor: 'rgba(0,212,255,.04)',
          borderColor: 'rgba(0,212,255,.2)',
          borderWidth: 1,
          shadowColor: 'rgba(0,212,255,.1)',
          shadowBlur: 8,
        },
        regions: geoRegions,
      },
      series,
    };

    chart.setOption(option, true);

    if (onMarkerClick) {
      chart.off('click');
      chart.on('click', (params) => {
        if (params.data && params.data.itemData) {
          onMarkerClick(params.data.itemData);
        }
      });
    }
  }, [ready, markers, heatmapData, districtColors, onMarkerClick, showDistrictLabel, zoom]);

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #050b1a 0%, #071428 50%, #0a1a30 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: .06, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,212,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,.4) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {!ready && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-dim)', fontSize: '.85rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 32, height: 32, border: '2px solid var(--accent)',
              borderTopColor: 'transparent', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto 8px',
            }} />
            地图加载中...
          </div>
        </div>
      )}

      <div ref={chartRef} style={{
        width: '100%', height: '100%',
        opacity: ready ? 1 : 0,
        transition: 'opacity .5s',
      }} />

      {children}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
