import { useEffect, useRef, useState, useCallback } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';

// 高德地图 API Key
const AMAP_KEY = '715e7f3bc104ca94aee9f5d940c32c12';

// 广元市中心坐标
const GY_CENTER = [105.84, 32.44];

// 各区县中心点坐标 (高德坐标系)
const DISTRICT_CENTERS = {
  '利州区': [105.826, 32.432],
  '昭化区': [105.964, 32.323],
  '朝天区': [105.889, 32.643],
  '旺苍县': [106.290, 32.228],
  '青川县': [105.239, 32.586],
  '剑阁县': [105.527, 32.287],
  '苍溪县': [105.940, 31.732],
};

// 区县边界颜色配置
const DISTRICT_COLORS_DEFAULT = {
  '利州区': '#00d4ff',
  '昭化区': '#22c55e',
  '朝天区': '#f59e0b',
  '旺苍县': '#8b5cf6',
  '青川县': '#3b82f6',
  '剑阁县': '#ec4899',
  '苍溪县': '#06b6d4',
};

export { DISTRICT_CENTERS, GY_CENTER };

export default function AMapView({
  markers = [],
  heatmapData,
  districtColors,
  onMarkerClick,
  children,
  showDistrictLabel = true,
  zoom = 9,
  districtDetail,
  autoRotate = false,
  rotateInterval = 5000,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const AMapRef = useRef(null);
  const [ready, setReady] = useState(false);
  const polygonsRef = useRef([]);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const rotateTimerRef = useRef(null);
  const currentDistrictIndexRef = useRef(0);

  // 初始化地图
  useEffect(() => {
    let disposed = false;

    AMapLoader.load({
      key: AMAP_KEY,
      version: '2.0',
      plugins: [
        'AMap.Scale',
        'AMap.ToolBar',
        'AMap.Geolocation',
        'AMap.DistrictSearch',
        'AMap.InfoWindow',
        'AMap.Marker',
        'AMap.Polygon',
        'AMap.HeatMap',
      ],
    }).then((AMap) => {
      if (disposed || !containerRef.current) return;

      AMapRef.current = AMap;

      const map = new AMap.Map(containerRef.current, {
        viewMode: '2D',
        zoom: zoom,
        minZoom: 8,      // 最小缩放（看全市）
        maxZoom: 18,     // 最大缩放（看街道/建筑）
        center: GY_CENTER,
        mapStyle: 'amap://styles/dark', // 深色主题
        features: ['bg', 'road', 'point'], // 背景+道路+POI标注
        showLabel: true, // 显示标签（街道名称等）
        resizeEnable: true,
        showIndoorMap: false,
      });

      // 添加缩放控件
      map.addControl(new AMap.Scale());

      mapRef.current = map;
      setReady(true);

      // 加载广元市边界
      loadGuangyuanBoundary(AMap, map);
    }).catch((e) => {
      console.error('高德地图加载失败:', e);
    });

    return () => {
      disposed = true;
      if (rotateTimerRef.current) {
        clearInterval(rotateTimerRef.current);
      }
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, []);

  // 加载广元市各区县边界
  const loadGuangyuanBoundary = useCallback((AMap, map) => {
    const districtSearch = new AMap.DistrictSearch({
      level: 'district',
      extensions: 'all',
      subdistrict: 1,
    });

    // 先获取广元市边界
    districtSearch.search('广元市', (status, result) => {
      if (status !== 'complete') {
        console.error('获取广元市边界失败:', result);
        return;
      }

      const districtList = result.districtList;
      if (!districtList || districtList.length === 0) return;

      const guangyuan = districtList[0];

      // 绘制广元市整体边界（每个独立边界单独创建 Polygon）
      if (guangyuan.boundaries && guangyuan.boundaries.length > 0) {
        guangyuan.boundaries.forEach((boundary) => {
          new AMap.Polygon({
            path: boundary,
            strokeColor: '#00d4ff',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: 'transparent',
            fillOpacity: 0,
            map: map,
          });
        });
      }

      // 获取各区县并绘制边界
      const subDistricts = guangyuan.districtList;
      if (subDistricts && subDistricts.length > 0) {
        subDistricts.forEach((district) => {
          drawDistrictBoundary(AMap, map, district);
        });
      }
    });

    // 单独绘制各区县
    Object.keys(DISTRICT_CENTERS).forEach((name) => {
      districtSearch.search(name, (status, result) => {
        if (status !== 'complete' || !result.districtList?.[0]) return;

        const district = result.districtList[0];
        drawDistrictBoundary(AMap, map, district, name);
      });
    });
  }, []);

  // 绘制单个区县边界
  const drawDistrictBoundary = useCallback((AMap, map, district, nameOverride) => {
    const name = nameOverride || district.name;
    const boundaries = district.boundaries;

    if (!boundaries || boundaries.length === 0) return;

    const color = districtColors
      ? (districtColors.find(d => d.name === name)?.color || DISTRICT_COLORS_DEFAULT[name])
      : DISTRICT_COLORS_DEFAULT[name];

    boundaries.forEach((boundary) => {
      const polygon = new AMap.Polygon({
        path: boundary,
        strokeColor: color || '#00d4ff',
        strokeWeight: 1.5,
        strokeOpacity: 0.7,
        fillColor: color || '#00d4ff',
        fillOpacity: 0.15,
        map: map,
        extData: { name: name },
      });

      // 添加鼠标事件
      polygon.on('mouseover', () => {
        polygon.setOptions({
          fillOpacity: 0.3,
          strokeWeight: 2.5,
        });
      });

      polygon.on('mouseout', () => {
        polygon.setOptions({
          fillOpacity: 0.15,
          strokeWeight: 1.5,
        });
      });

      polygon.on('click', () => {
        const center = DISTRICT_CENTERS[name];
        if (center) {
          map.setCenter(center);
          map.setZoom(14); // 放大到街道级别
        }
      });

      polygonsRef.current.push(polygon);
    });

    // 添加区县名称标签
    if (showDistrictLabel) {
      const center = DISTRICT_CENTERS[name];
      if (center) {
        const marker = new AMap.Marker({
          position: center,
          content: `<div style="
            background: rgba(5,11,26,.85);
            border: 1px solid ${color || '#00d4ff'};
            border-radius: 4px;
            padding: 4px 10px;
            color: ${color || '#00d4ff'};
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,.4);
          ">${name}</div>`,
          offset: new AMap.Pixel(-30, -15),
          map: map,
        });
        markersRef.current.push(marker);
      }
    }
  }, [districtColors, showDistrictLabel]);

  // 添加标注点
  useEffect(() => {
    if (!ready || !mapRef.current || !AMapRef.current) return;
    if (markers.length === 0) return;

    const AMap = AMapRef.current;
    const map = mapRef.current;

    // 清除旧的标注点（保留区县标签）
    const oldMarkers = markersRef.current.filter(m => m._isDataMarker);
    oldMarkers.forEach(m => m.setMap(null));
    markersRef.current = markersRef.current.filter(m => !m._isDataMarker);

    const typeConfig = {
      camera:      { color: '#00d4ff', icon: '📹' },
      checkpoint:  { color: '#22c55e', icon: '🚧' },
      signal:      { color: '#f59e0b', icon: '🚦' },
      enforcement: { color: '#3b82f6', icon: '👮' },
      persuasion:  { color: '#22c55e', icon: '📢' },
      inspection:  { color: '#8b5cf6', icon: '🔍' },
      alert:       { color: '#ef4444', icon: '🚨' },
      default:     { color: '#00d4ff', icon: '📍' },
    };

    markers.forEach((m) => {
      const cfg = typeConfig[m.type] || typeConfig.default;

      const markerContent = document.createElement('div');
      markerContent.style.cssText = `
        width: 28px;
        height: 28px;
        background: ${cfg.color};
        border: 2px solid rgba(255,255,255,.8);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 2px 10px ${cfg.color}80;
        cursor: pointer;
        transition: transform .2s;
      `;
      markerContent.innerHTML = cfg.icon;

      const marker = new AMap.Marker({
        position: [m.lng, m.lat],
        content: markerContent,
        offset: new AMap.Pixel(-14, -14),
        extData: m,
      });

      marker._isDataMarker = true;

      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(m);
        }
      });

      marker.on('mouseover', () => {
        markerContent.style.transform = 'scale(1.2)';

        // 显示信息窗口
        if (!infoWindowRef.current) {
          infoWindowRef.current = new AMap.InfoWindow({
            isCustom: true,
            autoMove: true,
            offset: new AMap.Pixel(0, -35),
          });
        }

        let content = `<div style="
          background: rgba(5,11,26,.95);
          border: 1px solid rgba(0,212,255,.4);
          border-radius: 6px;
          padding: 10px 14px;
          min-width: 150px;
          box-shadow: 0 4px 20px rgba(0,0,0,.5);
        ">`;
        content += `<div style="color: #00d4ff; font-weight: 600; margin-bottom: 6px;">${m.name || ''}</div>`;

        if (m.status) {
          const statusColor = m.status === 'online' ? '#22c55e' : '#ef4444';
          const statusText = m.status === 'online' ? '在线' : '离线';
          content += `<div style="color: #94a3b8; font-size: 12px;">状态: <span style="color: ${statusColor}">${statusText}</span></div>`;
        }
        if (m.code) content += `<div style="color: #94a3b8; font-size: 12px;">编号: ${m.code}</div>`;
        if (m.reason) content += `<div style="color: #ef4444; font-size: 12px;">原因: ${m.reason}</div>`;
        if (m.location) content += `<div style="color: #94a3b8; font-size: 12px;">地点: ${m.location}</div>`;

        content += '</div>';

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, [m.lng, m.lat]);
      });

      marker.on('mouseout', () => {
        markerContent.style.transform = 'scale(1)';
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
      });

      marker.setMap(map);
      markersRef.current.push(marker);
    });
  }, [ready, markers, onMarkerClick]);

  // 自动轮播辖区
  useEffect(() => {
    if (!ready || !mapRef.current || !autoRotate) return;

    const districts = Object.keys(DISTRICT_CENTERS);

    rotateTimerRef.current = setInterval(() => {
      const currentDistrict = districts[currentDistrictIndexRef.current];
      const center = DISTRICT_CENTERS[currentDistrict];

      if (center) {
        mapRef.current.setCenter(center, true, 500);

        // 高亮当前辖区
        polygonsRef.current.forEach((polygon) => {
          const extData = polygon.getExtData();
          if (extData.name === currentDistrict) {
            polygon.setOptions({
              fillOpacity: 0.4,
              strokeWeight: 3,
            });
          } else {
            polygon.setOptions({
              fillOpacity: 0.15,
              strokeWeight: 1.5,
            });
          }
        });
      }

      currentDistrictIndexRef.current = (currentDistrictIndexRef.current + 1) % districts.length;
    }, rotateInterval);

    return () => {
      if (rotateTimerRef.current) {
        clearInterval(rotateTimerRef.current);
      }
    };
  }, [ready, autoRotate, rotateInterval]);

  // 显示辖区详情弹窗
  useEffect(() => {
    if (!ready || !mapRef.current || !AMapRef.current) return;
    if (!districtDetail) return;

    const center = DISTRICT_CENTERS[districtDetail.name];
    if (!center) return;

    // 移动到该辖区并放大到街道级别
    mapRef.current.setCenter(center, true, 500);
    mapRef.current.setZoom(14, true, 500);

    // 高亮该辖区
    polygonsRef.current.forEach((polygon) => {
      const extData = polygon.getExtData();
      if (extData.name === districtDetail.name) {
        polygon.setOptions({
          fillOpacity: 0.4,
          strokeWeight: 3,
        });
      } else {
        polygon.setOptions({
          fillOpacity: 0.15,
          strokeWeight: 1.5,
        });
      }
    });
  }, [ready, districtDetail]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 地图容器 */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          background: '#050b1a',
        }}
      />

      {/* 加载提示 */}
      {!ready && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5,11,26,.9)',
          color: 'var(--text-dim)',
          fontSize: '.85rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 32,
              height: 32,
              border: '2px solid var(--accent)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 8px',
            }} />
            地图加载中...
          </div>
        </div>
      )}

      {/* 辖区详情弹窗 */}
      {districtDetail && ready && (
        <div className="district-detail-popup">
          <div className="detail-header">
            <span className="detail-title">{districtDetail.name}</span>
            <span className="detail-total">保有量: {districtDetail.count?.toLocaleString()}</span>
          </div>
          <div className="detail-body">
            <div className="detail-row"><span>正常</span><span>{districtDetail.normal?.toLocaleString()}</span></div>
            <div className="detail-row"><span>转出</span><span>{districtDetail.transferOut?.toLocaleString()}</span></div>
            <div className="detail-row"><span>被盗抢</span><span>{districtDetail.stolen?.toLocaleString()}</span></div>
            <div className="detail-row"><span>未年审</span><span>{districtDetail.notInspected?.toLocaleString()}</span></div>
            <div className="detail-row"><span>注销</span><span>{districtDetail.cancelled?.toLocaleString()}</span></div>
            <div className="detail-row"><span>查封</span><span>{districtDetail.seized?.toLocaleString()}</span></div>
            <div className="detail-row"><span>违法未处理</span><span>{districtDetail.illegal?.toLocaleString()}</span></div>
          </div>
        </div>
      )}

      {children}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .district-detail-popup {
          position: absolute;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          background: rgba(5,11,26,.95);
          border: 1px solid rgba(0,212,255,.4);
          border-radius: 8px;
          padding: 12px 16px;
          min-width: 180px;
          box-shadow: 0 4px 20px rgba(0,0,0,.5);
          animation: fadeIn .3s ease;
          z-index: 100;
        }
        .district-detail-popup .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(0,212,255,.2);
          margin-bottom: 8px;
        }
        .district-detail-popup .detail-title {
          color: #00d4ff;
          font-weight: 700;
          font-size: .9rem;
        }
        .district-detail-popup .detail-total {
          color: #94a3b8;
          font-size: .75rem;
        }
        .district-detail-popup .detail-body {
          font-size: .78rem;
        }
        .district-detail-popup .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          color: #cbd5e1;
        }
        .district-detail-popup .detail-row span:last-child {
          color: #00d4ff;
          font-family: 'JetBrains Mono', monospace;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-50%) translateX(10px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>
    </div>
  );
}
