const DISTRICTS = ['利州区', '昭化区', '朝天区', '旺苍县', '青川县', '剑阁县', '苍溪县'];
const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const HOURS = Array.from({length: 24}, (_, i) => `${String(i).padStart(2,'0')}:00`);

const DISTRICT_CENTERS = {
  '利州区': [105.826, 32.432],
  '昭化区': [105.964, 32.323],
  '朝天区': [105.889, 32.643],
  '旺苍县': [106.290, 32.228],
  '青川县': [105.239, 32.586],
  '剑阁县': [105.527, 32.287],
  '苍溪县': [105.940, 31.732],
};

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, dec = 1) { return +(Math.random() * (max - min) + min).toFixed(dec); }
function genTrend(base, count, variance) {
  return Array.from({length: count}, () => base + rand(-variance, variance));
}
function randAroundCenter(center, spreadLng = 0.08, spreadLat = 0.06) {
  return {
    lng: center[0] + (Math.random() - 0.5) * 2 * spreadLng,
    lat: center[1] + (Math.random() - 0.5) * 2 * spreadLat,
  };
}
function randInDistrict(districtName) {
  const c = DISTRICT_CENTERS[districtName] || DISTRICT_CENTERS['利州区'];
  return randAroundCenter(c, 0.12, 0.08);
}

export const mapOverviewData = {
  markers: {
    cameras: Array.from({length: 35}, (_, i) => {
      const distIdx = i % 7;
      const distName = DISTRICTS[distIdx];
      const pos = i < 15 ? randAroundCenter(DISTRICT_CENTERS['利州区'], 0.05, 0.04) : randInDistrict(distName);
      return {
        id: `cam_${i}`, name: `${distName}监控点位${i+1}`, type: 'camera',
        lng: pos.lng, lat: pos.lat,
        status: Math.random() > 0.04 ? 'online' : 'offline',
        code: `GY-CAM-${String(i+1).padStart(4,'0')}`,
        installDate: `202${rand(1,4)}-${String(rand(1,12)).padStart(2,'0')}-${String(rand(1,28)).padStart(2,'0')}`
      };
    }),
    checkpoints: Array.from({length: 18}, (_, i) => {
      const distName = DISTRICTS[i % 7];
      const pos = i < 8 ? randAroundCenter(DISTRICT_CENTERS['利州区'], 0.06, 0.05) : randInDistrict(distName);
      return {
        id: `ck_${i}`, name: `${distName}卡口${i+1}`, type: 'checkpoint',
        lng: pos.lng, lat: pos.lat,
        status: Math.random() > 0.05 ? 'online' : 'offline',
        code: `GY-CK-${String(i+1).padStart(4,'0')}`,
        installDate: `202${rand(0,4)}-${String(rand(1,12)).padStart(2,'0')}-${String(rand(1,28)).padStart(2,'0')}`
      };
    }),
    signals: Array.from({length: 22}, (_, i) => {
      const pos = randAroundCenter(DISTRICT_CENTERS['利州区'], 0.04, 0.03);
      return {
        id: `sig_${i}`, name: `利州区信号机${i+1}`, type: 'signal',
        lng: pos.lng, lat: pos.lat,
        status: Math.random() > 0.04 ? 'online' : 'offline',
        code: `GY-SIG-${String(i+1).padStart(4,'0')}`,
        installDate: `202${rand(1,4)}-${String(rand(1,12)).padStart(2,'0')}-${String(rand(1,28)).padStart(2,'0')}`
      };
    })
  },
  dataOverview: {
    todayVehicles: 128456, monthVehicles: 3842100,
    todayViolations: 2341, monthViolations: 68920,
    todayAlarms: 156, monthAlarms: 4523,
    vehicleTrend: genTrend(18000, 7, 3000),
    violationTrend: genTrend(340, 7, 80),
    alarmTrend: genTrend(22, 7, 8)
  },
  resources: [
    { name: '监控点位', icon: 'camera', total: 1245, online: 1198, rate: 96.2, color: '#00d4ff' },
    { name: '卡口', icon: 'checkpoint', total: 86, online: 82, rate: 95.3, color: '#22c55e' },
    { name: '移动设备', icon: 'mobile', total: 324, online: 289, rate: 89.2, color: '#f59e0b' },
    { name: '电子警察', icon: 'police', total: 156, online: 150, rate: 96.1, color: '#818cf8' },
    { name: '信号机', icon: 'signal', total: 218, online: 210, rate: 96.3, color: '#38e8ff' },
    { name: 'LED显示屏', icon: 'led', total: 45, online: 42, rate: 93.3, color: '#f472b6' }
  ]
};

export const trafficStatusData = {
  vehicleOwnership: {
    total: 523680,
    monthlyTrend: MONTHS.map((_, i) => ({ month: MONTHS[i], total: 500000 + i * 2000 + rand(-500, 500), added: rand(1800, 2600), cancelled: rand(300, 600) })),
    districtRank: DISTRICTS.map(d => ({
      name: d,
      count: rand(45000, 120000),
      change: randFloat(-2, 5),
      // 详细状态数据
      normal: rand(40000, 100000),
      transferOut: rand(1500, 3500),
      stolen: rand(80, 300),
      notInspected: rand(400, 1200),
      cancelled: rand(800, 2500),
      seized: rand(200, 800),
      illegal: rand(500, 1500)
    })).sort((a,b) => b.count - a.count),
    statusAll: [
      { name: '正常', count: 468200 },
      { name: '转出', count: 23400 },
      { name: '注销', count: 18600 },
      { name: '未年审', count: 8600 },
      { name: '违法未处理', count: 4200 },
      { name: '查封', count: 1800 },
      { name: '被盗抢', count: 1240 },
      { name: '其他', count: 640 }
    ],
    typeAll: [
      { name: '小型轿车', value: 52 },
      { name: '小型SUV', value: 18 },
      { name: '摩托车', value: 10 },
      { name: '中型货车', value: 6 },
      { name: '大型货车', value: 5 },
      { name: '特种车辆', value: 4 },
      { name: '其他', value: 5 }
    ],
    usageNature: [
      { name: '非营运', value: 85 },
      { name: '公路客运', value: 5 },
      { name: '旅游客运', value: 3 },
      { name: '危化品运输', value: 2 },
      { name: '其他营运', value: 5 }
    ],
    inspectionRate: 92.1, scrapRate: 98.5
  },
  driverOwnership: {
    total: 412350,
    monthlyTrend: MONTHS.map((_, i) => ({ month: MONTHS[i], total: 400000 + i * 1000 + rand(-300, 300), registered: rand(1200, 1800), cancelled: rand(200, 400) })),
    districtRank: DISTRICTS.map(d => ({
      name: d,
      count: rand(35000, 95000),
      change: randFloat(-1, 4),
      // 驾驶人详细状态
      normal: rand(30000, 85000),
      overdue: rand(1500, 4500),
      cancelled: rand(600, 2000),
      revoked: rand(200, 800),
      withdrawn: rand(50, 200)
    })).sort((a,b) => b.count - a.count),
    statusFunnel: [
      { name: '正常', value: 382000 }, { name: '逾期', value: 18200 },
      { name: '注销', value: 8600 }, { name: '吊销', value: 2800 }, { name: '撤销', value: 750 }
    ],
    ageFunnel: [
      { name: '18-25岁', value: 52400 }, { name: '26-35岁', value: 118600 },
      { name: '36-45岁', value: 124800 }, { name: '46-55岁', value: 78200 },
      { name: '56-65岁', value: 31200 }, { name: '65岁以上', value: 7150 }
    ],
    drivingAge: [
      { name: '1年以下', value: 8 }, { name: '1-3年', value: 15 },
      { name: '3-5年', value: 18 }, { name: '5-10年', value: 32 }, { name: '10年以上', value: 27 }
    ],
    licenseType: [
      { name: 'C1', value: 68 }, { name: 'C2', value: 12 }, { name: 'B2', value: 8 },
      { name: 'A2', value: 5 }, { name: 'A1', value: 3 }, { name: '其他', value: 4 }
    ],
    renewRate: 88.3, auditRate: 91.2
  },
  roadNetwork: {
    density: 4.82,
    totalLength: 12680,
    roads: [
      { type: '快速路', standard: 1, actual: 0.8, km: 45.2, count: 3 },
      { type: '主干路', standard: 2, actual: 1.6, km: 128.5, count: 18 },
      { type: '次干路', standard: 3, actual: 3.4, km: 256.8, count: 42 },
      { type: '支路', standard: 6, actual: 5.2, km: 412.3, count: 156 }
    ],
    districtRank: DISTRICTS.map(d => ({
      name: d,
      density: randFloat(2.5, 7.2),
      totalKm: rand(800, 2400),
      roadTypes: [
        { type: '快速路', km: rand(15, 50), count: rand(1, 4) },
        { type: '主干路', km: rand(80, 160), count: rand(10, 25) },
        { type: '次干路', km: rand(150, 320), count: rand(30, 55) },
        { type: '支路', km: rand(300, 550), count: rand(100, 200) }
      ]
    })).sort((a,b) => b.density - a.density)
  },
  trafficIndex: {
    current: 3.2, avgSpeed: 38.5, congestionKm: 12.3, congestionChange: 5.2,
    hourlyToday: HOURS.map((_, i) => ({ hour: HOURS[i], value: i < 6 ? randFloat(1, 2) : i < 9 ? randFloat(3, 5.5) : i < 11 ? randFloat(2.5, 4) : i < 14 ? randFloat(2, 3.5) : i < 17 ? randFloat(2.5, 4) : i < 20 ? randFloat(3.5, 5.8) : randFloat(1.5, 3) })),
    hourlyLastWeek: HOURS.map((_, i) => ({ hour: HOURS[i], value: i < 6 ? randFloat(1, 2) : i < 9 ? randFloat(2.8, 5) : i < 11 ? randFloat(2.2, 3.8) : i < 14 ? randFloat(1.8, 3.2) : i < 17 ? randFloat(2.2, 3.8) : i < 20 ? randFloat(3.2, 5.5) : randFloat(1.2, 2.8) })),
    squadRank: [
      { name: '利州大队', index: 3.8, change: 5.2, activeCount: 32400 }, { name: '昭化大队', index: 2.9, change: -2.1, activeCount: 12800 },
      { name: '朝天大队', index: 2.1, change: 1.3, activeCount: 8600 }, { name: '旺苍大队', index: 2.5, change: -0.8, activeCount: 10200 },
      { name: '青川大队', index: 1.8, change: 0.5, activeCount: 6800 }, { name: '剑阁大队', index: 2.2, change: 3.1, activeCount: 9400 },
      { name: '苍溪大队', index: 2.6, change: -1.2, activeCount: 11200 }
    ],
    congestionRoads: [
      {
        rank: 1, name: '蜀门南路', index: 5.8, speed: 18.2, frequent: true,
        lng: 105.821, lat: 32.428,
        path: [[105.815, 32.435], [105.821, 32.428], [105.827, 32.420]],
        resources: { cameras: 8, police: 3, alerts: 2 },
        detail: '南河大桥至老城方向，早高峰拥堵严重，建议绕行利州东路'
      },
      {
        rank: 2, name: '利州东路', index: 5.2, speed: 21.5, frequent: true,
        lng: 105.835, lat: 32.438,
        path: [[105.828, 32.442], [105.835, 32.438], [105.842, 32.434]],
        resources: { cameras: 6, police: 4, alerts: 1 },
        detail: '市政府至东坝路段，商业区集中，车流量大'
      },
      {
        rank: 3, name: '万缘街', index: 4.8, speed: 23.1, frequent: false,
        lng: 105.845, lat: 32.432,
        path: [[105.840, 32.436], [105.845, 32.432], [105.850, 32.428]],
        resources: { cameras: 5, police: 2, alerts: 0 },
        detail: '商业街区，周末及节假日易拥堵'
      },
      {
        rank: 4, name: '嘉陵路', index: 4.5, speed: 24.8, frequent: true,
        lng: 105.818, lat: 32.418,
        path: [[105.812, 32.422], [105.818, 32.418], [105.824, 32.412]],
        resources: { cameras: 7, police: 2, alerts: 1 },
        detail: '连接老城与南河片区的主干道，早晚高峰拥堵'
      },
      {
        rank: 5, name: '东坝大道', index: 4.2, speed: 26.3, frequent: false,
        lng: 105.852, lat: 32.445,
        path: [[105.846, 32.450], [105.852, 32.445], [105.858, 32.440]],
        resources: { cameras: 4, police: 2, alerts: 0 },
        detail: '新城区主干道，周末购物车流集中'
      }
    ],
    congestionAreas: [
      {
        rank: 1, name: '老城核心区', index: 4.6, speed: 22.5,
        lng: 105.820, lat: 32.425,
        bounds: [[105.810, 32.418], [105.830, 32.432]],
        stats: { congestionRatio: 18.5, unfinishedAlerts: 3, police: 8, cameras: 24 },
        detail: '广元老城区，商业集中，道路狭窄'
      },
      {
        rank: 2, name: '东坝商圈', index: 4.1, speed: 25.8,
        lng: 105.840, lat: 32.440,
        bounds: [[105.830, 32.432], [105.850, 32.448]],
        stats: { congestionRatio: 14.2, unfinishedAlerts: 2, police: 6, cameras: 18 },
        detail: '新兴商业区，大型商场集中'
      },
      {
        rank: 3, name: '南河片区', index: 3.8, speed: 27.2,
        lng: 105.828, lat: 32.412,
        bounds: [[105.818, 32.405], [105.838, 32.420]],
        stats: { congestionRatio: 11.8, unfinishedAlerts: 1, police: 5, cameras: 15 },
        detail: '居民区为主，通勤高峰拥堵'
      },
      {
        rank: 4, name: '上西坝区域', index: 3.2, speed: 30.1,
        lng: 105.808, lat: 32.438,
        bounds: [[105.798, 32.430], [105.818, 32.446]],
        stats: { congestionRatio: 8.5, unfinishedAlerts: 1, police: 4, cameras: 12 },
        detail: '交通枢纽区，火车站周边'
      },
      {
        rank: 5, name: '宝轮镇区', index: 2.8, speed: 32.6,
        lng: 105.752, lat: 32.398,
        bounds: [[105.742, 32.390], [105.762, 32.406]],
        stats: { congestionRatio: 5.2, unfinishedAlerts: 0, police: 3, cameras: 8 },
        detail: '郊区城镇，节假日车流增加'
      }
    ],
    watchList: [
      { rank: 1, name: '蜀门南路', type: '路段', index: 5.8, speed: 18.2 },
      { rank: 2, name: '老城核心区', type: '区域', index: 4.6, speed: 22.5 },
      { rank: 3, name: '利州东路', type: '路段', index: 5.2, speed: 21.5 }
    ]
  },
  activeVehicles: {
    today: 86432, change: 12.5,
    hourly: HOURS.map((_, i) => ({ hour: HOURS[i], today: i < 6 ? rand(2000, 8000) : i < 9 ? rand(35000, 65000) : i < 17 ? rand(50000, 80000) : i < 21 ? rand(40000, 70000) : rand(5000, 20000), lastWeek: i < 6 ? rand(1800, 7500) : i < 9 ? rand(33000, 60000) : i < 17 ? rand(48000, 78000) : i < 21 ? rand(38000, 68000) : rand(4500, 18000), lastMonth: i < 6 ? rand(1500, 7000) : i < 9 ? rand(30000, 58000) : i < 17 ? rand(45000, 75000) : i < 21 ? rand(36000, 65000) : rand(4000, 16000) })),
    origin: [{ name: '本市', value: 65 }, { name: '本省外市', value: 22 }, { name: '外省', value: 13 }],
    plateType: [{ name: '小型车', value: 78 }, { name: '大型车', value: 15 }, { name: '其他', value: 7 }],
    provinceDetail: [
      { name: '重庆', count: 3240 }, { name: '陕西', count: 2180 }, { name: '甘肃', count: 1560 },
      { name: '河南', count: 1120 }, { name: '湖北', count: 890 }, { name: '贵州', count: 720 },
      { name: '云南', count: 480 }, { name: '其他', count: 1030 }
    ],
    squadRank: [
      { name: '利州大队', count: 32400, change: 5.8 }, { name: '昭化大队', count: 12800, change: -1.6 },
      { name: '朝天大队', count: 8600, change: 2.1 }, { name: '旺苍大队', count: 10200, change: -3.2 },
      { name: '青川大队', count: 6800, change: 1.4 }, { name: '剑阁大队', count: 9400, change: 4.2 },
      { name: '苍溪大队', count: 11200, change: -0.9 }
    ]
  },
  transitVehicles: {
    today: 23156, change: -2.1,
    hourly: HOURS.map((_, i) => ({ hour: HOURS[i], today: i < 6 ? rand(1000, 4000) : i < 9 ? rand(12000, 20000) : i < 17 ? rand(18000, 25000) : i < 21 ? rand(14000, 22000) : rand(2000, 6000), lastWeek: i < 6 ? rand(800, 3500) : i < 9 ? rand(11000, 19000) : i < 17 ? rand(17000, 24000) : i < 21 ? rand(13000, 21000) : rand(1800, 5500), lastMonth: i < 6 ? rand(700, 3200) : i < 9 ? rand(10000, 18000) : i < 17 ? rand(16000, 23000) : i < 21 ? rand(12000, 20000) : rand(1500, 5000) })),
    origin: [{ name: '本市', value: 58 }, { name: '本省外市', value: 28 }, { name: '外省', value: 14 }],
    plateType: [{ name: '小型车', value: 72 }, { name: '大型车', value: 20 }, { name: '其他', value: 8 }],
    squadRank: [
      { name: '利州大队', count: 8600, change: -1.2 }, { name: '昭化大队', count: 3200, change: 2.4 },
      { name: '朝天大队', count: 2100, change: -0.8 }, { name: '旺苍大队', count: 2800, change: 1.5 },
      { name: '青川大队', count: 1600, change: 0.3 }, { name: '剑阁大队', count: 2400, change: -2.1 },
      { name: '苍溪大队', count: 2900, change: 1.8 }
    ]
  },
  inboundVehicles: {
    today: 45230, change: 6.1,
    hourly: HOURS.map((_, i) => ({ hour: HOURS[i], today: i < 6 ? rand(500, 2000) : i < 9 ? rand(8000, 15000) : i < 17 ? rand(12000, 22000) : i < 21 ? rand(8000, 16000) : rand(1000, 4000), lastWeek: i < 6 ? rand(400, 1800) : i < 9 ? rand(7000, 14000) : i < 17 ? rand(11000, 20000) : i < 21 ? rand(7000, 15000) : rand(800, 3500), lastMonth: i < 6 ? rand(350, 1600) : i < 9 ? rand(6500, 13000) : i < 17 ? rand(10000, 19000) : i < 21 ? rand(6500, 14000) : rand(600, 3000) })),
    origin: [{ name: '本市', value: 45 }, { name: '本省外市', value: 35 }, { name: '外省', value: 20 }],
    topCheckpoints: [
      { rank: 1, name: '广陕高速入口', flow5min: 128, dayTotal: 8920, change: 5.2, changeDay: 2.8, ratio: 19.7, inbound: 5320, outbound: 3600 },
      { rank: 2, name: '广巴高速入口', flow5min: 96, dayTotal: 7230, change: -2.1, changeDay: 1.5, ratio: 16.0, inbound: 4210, outbound: 3020 },
      { rank: 3, name: '108国道北入口', flow5min: 85, dayTotal: 6450, change: 3.8, changeDay: -1.2, ratio: 14.3, inbound: 3850, outbound: 2600 },
      { rank: 4, name: '212国道南入口', flow5min: 72, dayTotal: 5680, change: 1.5, changeDay: 3.5, ratio: 12.6, inbound: 3400, outbound: 2280 },
      { rank: 5, name: '绵广高速入口', flow5min: 68, dayTotal: 5120, change: -0.8, changeDay: 0.5, ratio: 11.3, inbound: 2980, outbound: 2140 }
    ]
  },
  outboundVehicles: {
    today: 42890, change: 3.8,
    hourly: HOURS.map((_, i) => ({ hour: HOURS[i], today: i < 6 ? rand(400, 1800) : i < 9 ? rand(6000, 12000) : i < 17 ? rand(10000, 20000) : i < 21 ? rand(9000, 18000) : rand(800, 3500), lastWeek: i < 6 ? rand(350, 1600) : i < 9 ? rand(5500, 11000) : i < 17 ? rand(9000, 18000) : i < 21 ? rand(8000, 16000) : rand(700, 3200), lastMonth: i < 6 ? rand(300, 1500) : i < 9 ? rand(5000, 10000) : i < 17 ? rand(8500, 17000) : i < 21 ? rand(7500, 15000) : rand(600, 2800) })),
    origin: [{ name: '本市', value: 48 }, { name: '本省外市', value: 32 }, { name: '外省', value: 20 }],
    topCheckpoints: [
      { rank: 1, name: '广陕高速出口', flow5min: 118, dayTotal: 8320, change: 3.8, changeDay: 1.6, ratio: 19.4, inbound: 4890, outbound: 3430 },
      { rank: 2, name: '广巴高速出口', flow5min: 92, dayTotal: 6980, change: -1.5, changeDay: -0.8, ratio: 16.3, inbound: 4120, outbound: 2860 },
      { rank: 3, name: '108国道南出口', flow5min: 78, dayTotal: 5860, change: 2.2, changeDay: 2.1, ratio: 13.7, inbound: 3520, outbound: 2340 },
      { rank: 4, name: '212国道北出口', flow5min: 65, dayTotal: 5240, change: 0.6, changeDay: -1.5, ratio: 12.2, inbound: 3100, outbound: 2140 },
      { rank: 5, name: '绵广高速出口', flow5min: 62, dayTotal: 4890, change: -2.3, changeDay: 0.9, ratio: 11.4, inbound: 2850, outbound: 2040 }
    ]
  }
};

export const trafficSafetyData = {
  drivers: {
    total: 412350,
    byType: [
      { type: 'C1', count: 280400 }, { type: 'C2', count: 49480 }, { type: 'B2', count: 32990 },
      { type: 'A2', count: 20620 }, { type: 'A1', count: 12370 }, { type: 'B1', count: 8250 },
      { type: 'A3', count: 4120 }, { type: 'D', count: 2060 }, { type: 'E', count: 1240 }, { type: 'C3', count: 820 }
    ],
    districtDetail: DISTRICTS.reduce((acc, d) => {
      acc[d] = { C1: rand(28000, 52000), C2: rand(5000, 9000), B2: rand(3000, 6000), A2: rand(1500, 4000), A1: rand(800, 2500) };
      return acc;
    }, {})
  },
  vehicles: {
    total: 523680,
    districtDetail: DISTRICTS.reduce((acc, d) => {
      acc[d] = { '家庭自用': rand(35000, 65000), '货运': rand(5000, 12000), '公路客运': rand(2000, 6000), '出租客运': rand(1000, 3000), '公交客运': rand(500, 1500), '旅游客运': rand(300, 1000), '危化品运输': rand(200, 600), '教练车': rand(200, 500), '租赁': rand(150, 400), '其他': rand(3000, 8000) };
      return acc;
    }, {}),
    byUsage: [
      { type: '家庭自用', count: 345600 }, { type: '货运', count: 62800 },
      { type: '公路客运', count: 28400 }, { type: '出租客运', count: 15200 },
      { type: '公交客运', count: 8600 }, { type: '旅游客运', count: 5800 },
      { type: '危化品运输', count: 3200 }, { type: '教练车', count: 2800 },
      { type: '租赁', count: 2400 }, { type: '其他', count: 48880 }
    ]
  },
  roads: {
    types: [
      { type: '高速', km: 286.5, count: 4 }, { type: '国道', km: 425.8, count: 6 },
      { type: '省道', km: 862.3, count: 18 }, { type: '县道', km: 1560.2, count: 45 },
      { type: '乡道', km: 3280.6, count: 186 }, { type: '村道', km: 5420.1, count: 842 },
      { type: '城市快速路', km: 45.2, count: 3 }, { type: '主干路', km: 128.5, count: 18 },
      { type: '次干路', km: 256.8, count: 42 }, { type: '支路', km: 412.3, count: 156 }
    ]
  },
  driverHazards: {
    total: 1245, resolved: 986, rate: 79.2,
    categories: [
      { name: '逾期未换证', count: 423, resolved: 356 },
      { name: '逾期未审验', count: 318, resolved: 245 },
      { name: '满分未学习', count: 186, resolved: 142 },
      { name: '驾驶证暂扣', count: 156, resolved: 128 },
      { name: '实习期违规', count: 98, resolved: 68 },
      { name: '其他', count: 64, resolved: 47 }
    ]
  },
  vehicleHazards: {
    total: 2890, resolved: 2134, rate: 73.8,
    categories: [
      { name: '逾期未检验', count: 986, resolved: 742 },
      { name: '达报废标准未注销', count: 645, resolved: 523 },
      { name: '违法未处理(重点)', count: 534, resolved: 398 },
      { name: '逾期未报废', count: 425, resolved: 312 },
      { name: '多次违法未处理', count: 186, resolved: 98 },
      { name: '其他', count: 114, resolved: 61 }
    ]
  },
  roadHazards: {
    total: 156, resolved: 98, rate: 62.8,
    byLevel: [
      { level: '重大隐患', count: 12, resolved: 5, color: '#ef4444' },
      { level: '较大隐患', count: 34, resolved: 18, color: '#f59e0b' },
      { level: '一般隐患', count: 68, resolved: 48, color: '#eab308' },
      { level: '低风险', count: 42, resolved: 27, color: '#3b82f6' }
    ]
  },
  enterprises: {
    total: 342, highRisk: 18,
    list: [
      { name: '广元顺达运输有限公司', level: '高', reason: '逾期未检车辆12台', status: '整改中' },
      { name: '苍溪通运物流公司', level: '高', reason: '3个月内发生2起事故', status: '未整改' },
      { name: '剑阁安达客运公司', level: '高', reason: '超速违法频发', status: '已整改' },
      { name: '旺苍鑫通危化运输', level: '高', reason: '驾驶员资质问题', status: '整改中' },
      { name: '广元万通货运公司', level: '中', reason: '违法未处理车辆多', status: '整改中' },
      { name: '青川绿源客运公司', level: '中', reason: '车辆检验逾期', status: '已整改' },
      { name: '利州恒达物流公司', level: '中', reason: '安全制度不完善', status: '未整改' },
      { name: '昭化畅途运输公司', level: '低', reason: '偶发违章', status: '已整改' }
    ]
  },
  safetyStations: {
    enforcement: 12, persuasion: 45, inspection: 8,
    positions: Array.from({length: 65}, (_, i) => {
      const distName = DISTRICTS[i % 7];
      const pos = randInDistrict(distName);
      return {
        type: i < 12 ? 'enforcement' : i < 57 ? 'persuasion' : 'inspection',
        name: `${distName}${i < 12 ? '执法站' : i < 57 ? '劝导站' : '检查站'}${Math.floor(i/7)+1}`,
        lng: pos.lng, lat: pos.lat,
      };
    })
  }
};

export const fourColorWarningData = {
  districtScores: DISTRICTS.map(d => {
    const score = rand(60, 98);
    return {
      name: d, score,
      color: score >= 90 ? '#22c55e' : score >= 80 ? '#eab308' : score >= 70 ? '#f59e0b' : '#ef4444',
      level: score >= 90 ? '绿色' : score >= 80 ? '黄色' : score >= 70 ? '橙色' : '红色',
      deductions: {
        person: rand(0, 8), vehicle: rand(0, 10), road: rand(0, 6),
        enterprise: rand(0, 5), accident: rand(0, 12), station: rand(0, 4)
      }
    };
  }),
  roadRisk: [
    { name: '重大风险', value: 12, color: '#ef4444' },
    { name: '较大风险', value: 23, color: '#f59e0b' },
    { name: '一般风险', value: 45, color: '#eab308' },
    { name: '低风险', value: 20, color: '#3b82f6' }
  ],
  vehicleHazardItems: [
    { name: '逾期未检', total: 986, added: 123, resolved: 89 },
    { name: '未报废', total: 645, added: 56, resolved: 78 },
    { name: '违法未处理', total: 534, added: 98, resolved: 65 },
    { name: '多次违法', total: 186, added: 34, resolved: 28 },
    { name: '逾期未报废', total: 425, added: 45, resolved: 52 },
    { name: '其他隐患', total: 114, added: 18, resolved: 12 }
  ],
  // 车辆隐患按月数据
  vehicleHazardMonthly: MONTHS.map((_, monthIdx) => ({
    month: MONTHS[monthIdx],
    items: [
      { name: '逾期未检', total: rand(850, 1100), added: rand(100, 150), resolved: rand(70, 120) },
      { name: '未报废', total: rand(550, 750), added: rand(40, 80), resolved: rand(60, 100) },
      { name: '违法未处理', total: rand(450, 650), added: rand(80, 120), resolved: rand(50, 90) },
      { name: '多次违法', total: rand(150, 250), added: rand(25, 50), resolved: rand(20, 40) },
      { name: '逾期未报废', total: rand(350, 500), added: rand(30, 60), resolved: rand(40, 70) },
      { name: '其他隐患', total: rand(80, 150), added: rand(10, 30), resolved: rand(8, 20) }
    ]
  })),
  accidents: {
    monthly: MONTHS.map((m, i) => ({ month: m, injury: rand(8, 35), property: rand(45, 120) }))
  },
  driverHazardItems: [
    { name: '逾期未换证', total: 423, a: 45, b: 128 },
    { name: '逾期未审验', total: 318, a: 38, b: 96 },
    { name: '满分未学习', total: 186, a: 22, b: 54 }
  ],
  // 事故原因按月份数据（1-12月）
  accidentCausesMonthly: MONTHS.map((month, idx) => ({
    month,
    causes: [
      { name: '未保持安全距离', value: rand(20, 35) },
      { name: '违规变道', value: rand(12, 25) },
      { name: '超速行驶', value: rand(10, 22) },
      { name: '违反信号灯', value: rand(8, 18) },
      { name: '疲劳驾驶', value: rand(6, 15) },
      { name: '酒后驾驶', value: rand(4, 12) },
      { name: '无证驾驶', value: rand(3, 10) },
      { name: '其他', value: rand(5, 12) }
    ]
  })),
  // 兼容旧版：默认取第一个月数据
  get accidentCauses() {
    return this.accidentCausesMonthly[0]?.causes || [];
  },
  accidentHeatmap: Array.from({length: 50}, (_, i) => {
    const distName = DISTRICTS[i % 7];
    const pos = randInDistrict(distName);
    return {
      lng: pos.lng, lat: pos.lat,
      count: rand(1, 10),
      type: ['追尾', '侧翻', '碰撞', '刮擦'][rand(0, 3)],
      time: `2026-0${rand(1,3)}-${String(rand(1,28)).padStart(2,'0')} ${String(rand(0,23)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}`
    };
  })
};

export const trafficFlowData = {
  monthlyFlow: MONTHS.map((m, i) => ({
    month: m,
    flow: rand(2800000, 4200000),
    lastYear: rand(2500000, 3800000)
  })),
  yearTotal: 42560000,
  monthAvg: 3546667,
  topIntersections: [
    { rank: 1, name: '蜀门南路-利州东路', flow: 1256000, ratio: 8.2 },
    { rank: 2, name: '嘉陵路-万缘街', flow: 1089000, ratio: 7.1 },
    { rank: 3, name: '东坝大道-滨河路', flow: 986000, ratio: 6.4 },
    { rank: 4, name: '南河路-翠柏路', flow: 875000, ratio: 5.7 },
    { rank: 5, name: '108国道-工业园路', flow: 768000, ratio: 5.0 },
    { rank: 6, name: '广元大道-金柜路', flow: 692000, ratio: 4.5 },
    { rank: 7, name: '三桥路-川陕路', flow: 634000, ratio: 4.1 },
    { rank: 8, name: '南环路-宝轮路', flow: 578000, ratio: 3.8 },
    { rank: 9, name: '上西坝-苴国路', flow: 523000, ratio: 3.4 },
    { rank: 10, name: '皇泽路-女皇路', flow: 489000, ratio: 3.2 }
  ]
};

export const vehicleDataMgmt = {
  localVehicles: { count: 342100, ratio: 65.3 },
  foreignVehicles: { count: 181580, ratio: 34.7 },
  provinceRank: [
    { name: '四川(本省外市)', count: 98400, ratio: 18.8 },
    { name: '重庆', count: 32600, ratio: 6.2 },
    { name: '陕西', count: 21400, ratio: 4.1 },
    { name: '甘肃', count: 14200, ratio: 2.7 },
    { name: '河南', count: 8600, ratio: 1.6 },
    { name: '其他', count: 6380, ratio: 1.2 }
  ],
  typeDistribution: [
    { name: '小型轿车', count: 324880, ratio: 62.0 },
    { name: '小型SUV', count: 94260, ratio: 18.0 },
    { name: '中型货车', count: 41900, ratio: 8.0 },
    { name: '大型货车', count: 26180, ratio: 5.0 },
    { name: '客车', count: 15710, ratio: 3.0 },
    { name: '摩托车', count: 10470, ratio: 2.0 },
    { name: '其他', count: 10280, ratio: 2.0 }
  ]
};

export const surveillanceAlertData = {
  alerts: Array.from({length: 30}, (_, i) => {
    const reasons = ['在逃车辆', '盗抢车辆', '违法未处理', '重点关注'];
    const reasonColors = ['#ef4444', '#f59e0b', '#eab308', '#3b82f6'];
    const reasonIdx = rand(0, 3);
    const h = rand(0, 23); const m = rand(0, 59); const s = rand(0, 59);
    return {
      id: `alert_${i}`,
      plate: `川H${String.fromCharCode(65+rand(0,25))}${rand(0,9)}${rand(0,9)}${rand(0,9)}${rand(0,9)}${rand(0,9)}`,
      reason: reasons[reasonIdx],
      reasonColor: reasonColors[reasonIdx],
      time: `2026-03-13 ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`,
      location: ['蜀门南路卡口','利州东路卡口','广陕高速入口','108国道检查站','嘉陵路电子警察','东坝大道卡口','广巴高速入口'][rand(0,6)],
      ...randAroundCenter(DISTRICT_CENTERS['利州区'], 0.06, 0.05)
    };
  }).sort((a, b) => b.time.localeCompare(a.time)),
  todayTotal: 156,
  typeStats: [
    { name: '在逃车辆', value: 12, color: '#ef4444' },
    { name: '盗抢车辆', value: 8, color: '#f59e0b' },
    { name: '违法未处理', value: 98, color: '#eab308' },
    { name: '重点关注', value: 38, color: '#3b82f6' }
  ],
  hourlyTrend: Array.from({length: 12}, (_, i) => ({ hour: `${String(i+8).padStart(2,'0')}:00`, count: rand(5, 25) }))
};

export { DISTRICTS, MONTHS, HOURS };
