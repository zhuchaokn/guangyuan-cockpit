# 开发文档

> 广元市综合管控驾驶舱 — 前端架构与开发指南

---

## 1. 架构设计

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    App.jsx（模块路由）                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              CockpitLayout（驾驶舱布局）                  │ │
│  │  ┌──────────────────────────────────────────────────┐   │ │
│  │  │              Header（顶部导航栏）                  │   │ │
│  │  │  [GY] 广元市综合管控驾驶舱  [Tab1][Tab2]...[Tab7]  │   │ │
│  │  └──────────────────────────────────────────────────┘   │ │
│  │  ┌──────────┐ ┌──────────────────┐ ┌──────────┐        │ │
│  │  │ 左侧面板  │ │   中间地图区域     │ │ 右侧面板  │        │ │
│  │  │ (420px)  │ │   (MapView)      │ │ (420px)  │        │ │
│  │  │          │ │                  │ │          │        │ │
│  │  │ 由当前   │ │  ECharts Geo     │ │ 由当前   │        │ │
│  │  │ 模块决定  │ │  + 标注/热力图    │ │ 模块决定  │        │ │
│  │  └──────────┘ └──────────────────┘ └──────────┘        │ │
│  │  ┌──────────────────────────────────────────────────┐   │ │
│  │  │              Footer（底部状态栏）                  │   │ │
│  │  └──────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 模块切换机制

每个模块（如 `MapOverview`、`TrafficStatus`）导出一个自定义 Hook，返回 `{ leftPanel, rightPanel, mapContent }` 三块 JSX 内容。`App.jsx` 将每个 Hook 封装为独立的 React 组件，通过 `key={activeModule}` 确保模块切换时完全卸载/重建，避免 React Hooks 规则冲突。

```jsx
// 模块 Hook 模式
export default function useMapOverview() {
  const [state, setState] = useState(...);
  // ...业务逻辑
  return { leftPanel: <JSX/>, rightPanel: <JSX/>, mapContent: <JSX/> };
}

// App.jsx 中的封装
function ModuleMapOverview() {
  const d = useMapOverview();
  return <CockpitInner {...d} />;
}
```

### 1.3 地图系统

地图使用 ECharts `geo` 组件 + 注册自定义地图的方式：

1. `public/guangyuan.json` — 广元市 GeoJSON 数据（来自阿里 DataV，行政编码 510800）
2. `MapView.jsx` 在首次渲染时通过 `fetch` 加载 GeoJSON 并调用 `echarts.registerMap('guangyuan', data)`
3. 使用模块级缓存 `mapRegistered` + `geoJsonCache` 避免重复加载
4. fetch 路径使用 `import.meta.env.BASE_URL` 兼容子路径部署

---

## 2. 通用组件 API

### 2.1 DataCard

数值指标卡片，支持数字滚动动画。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | string | - | 卡片标题 |
| `value` | number/string | - | 显示数值，数字类型会触发滚动动画 |
| `unit` | string | - | 单位文字 |
| `trend` | number | - | 同比变化百分比，正数绿色↑，负数红色↓ |
| `trendLabel` | string | - | 同比标签文字 |
| `color` | string | `var(--accent)` | 主题色 |
| `mini` | boolean | `false` | 紧凑模式 |
| `children` | ReactNode | - | 底部自定义内容区 |

### 2.2 PanelCard

面板容器卡片，带标题装饰线。

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | string | 标题文字（不传则不显示头部） |
| `extra` | ReactNode | 标题栏右侧附加内容 |
| `noPad` | boolean | 内容区域不加 padding |
| `children` | ReactNode | 卡片内容 |

### 2.3 RingProgress

SVG 环形进度条。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | number | - | 百分比值（0-100） |
| `size` | number | 56 | 直径（px） |
| `stroke` | number | 5 | 描边宽度 |
| `color` | string | `var(--accent)` | 进度条颜色 |
| `label` | string | - | 底部标签 |

### 2.4 MapView

ECharts 地图组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `markers` | Array<{lng, lat, type, name, ...}> | 标注点数组 |
| `heatmapData` | Array<{lng, lat, count, ...}> | 热力/散点数据 |
| `districtColors` | Array<{name, color, score}> | 区县着色数据 |
| `onMarkerClick` | function(marker) | 标注点击回调 |
| `showDistrictLabel` | boolean | 是否显示区县名称 |
| `zoom` | number | 初始缩放倍数 |
| `children` | ReactNode | 浮动覆盖层内容 |

**标注类型（`type` 字段）**：
- `camera` — 蓝色圆形，监控点位
- `checkpoint` — 绿色菱形，卡口
- `signal` — 黄色三角，信号机
- `enforcement` — 蓝色方形，执法站
- `persuasion` — 绿色小圆形，劝导站
- `inspection` — 紫色标签形，检查站
- `alert` — 红色脉冲圆形，报警点（带波纹动画）

### 2.5 MiniLine / MiniBar

迷你图表组件，用于 DataCard 内嵌。

| 属性 | 类型 | 说明 |
|------|------|------|
| `data` | number[] | 数据数组 |
| `color` | string | 图表颜色 |
| `height` | number | 高度（px） |

---

## 3. Mock 数据结构

数据文件：`src/data/mockData.js`

### 3.1 数据导出一览

| 导出名 | 使用模块 | 说明 |
|--------|---------|------|
| `mapOverviewData` | 地图总览 | 标注点、数据总览、资源列表 |
| `trafficStatusData` | 运行态势 | 保有量、交通指数、车辆活跃度、进出城 |
| `trafficSafetyData` | 交通安全 | 驾驶人/车辆/道路数据、隐患、企业、站点 |
| `fourColorWarningData` | 四色预警 | 区县评分、隐患统计、事故数据 |
| `trafficFlowData` | 道路流量 | 月度流量、路口排名 |
| `vehicleDataMgmt` | 车辆数据 | 归属地、类型统计 |
| `surveillanceAlertData` | 布控预警 | 报警列表、类型统计、趋势 |
| `DISTRICTS` | 全局 | 7 个区县名称数组 |

### 3.2 地理坐标说明

所有经纬度基于广元市 7 个区县的真实行政中心生成：

| 区县 | 经度 | 纬度 |
|------|------|------|
| 利州区（城区） | 105.826 | 32.432 |
| 昭化区 | 105.964 | 32.323 |
| 朝天区 | 105.889 | 32.643 |
| 旺苍县 | 106.290 | 32.228 |
| 青川县 | 105.239 | 32.586 |
| 剑阁县 | 105.527 | 32.287 |
| 苍溪县 | 105.940 | 31.732 |

监控/信号机集中分布在利州区城区，卡口/安全站点分布在各区县。

### 3.3 后端对接指南

当前所有数据为前端 Mock，后续对接后端 API 时：

1. 在 `src/data/` 下创建 `api.js`，封装 `fetch`/`axios` 请求
2. 将各模块 Hook 中的 `import { xxxData } from '../../data/mockData'` 替换为 API 调用
3. 建议使用 `useState` + `useEffect` 或 `useSWR` / `React Query` 管理数据加载状态
4. Mock 数据的字段命名可作为 API 响应 Schema 的参考

---

## 4. 样式体系

### 4.1 CSS 变量

定义在 `src/styles/global.css` 的 `:root` 中：

| 变量 | 值 | 用途 |
|------|-----|------|
| `--bg-deep` | `#050b1a` | 页面背景 |
| `--bg-panel` | `rgba(8,22,50,.88)` | 侧面板背景 |
| `--bg-card` | `rgba(10,28,60,.75)` | 卡片背景 |
| `--accent` | `#00d4ff` | 主强调色（科技蓝） |
| `--green` | `#22c55e` | 安全/正增长 |
| `--red` | `#ef4444` | 告警/负增长 |
| `--orange` | `#f59e0b` | 预警 |
| `--purple` | `#8b5cf6` | 信息 |
| `--text-primary` | `#e2e8f0` | 主文字 |
| `--text-secondary` | `#94a3b8` | 辅文字 |
| `--text-dim` | `#64748b` | 弱化文字 |
| `--panel-width` | `420px` | 侧面板宽度 |
| `--header-height` | `68px` | 头部高度 |

### 4.2 字体

- **标题/数字**：`Orbitron`（科技感）+ `JetBrains Mono`（等宽数字）
- **正文**：`Noto Sans SC`（中文）
- 通过 Google Fonts CDN 加载

### 4.3 ECharts 图表统一配置

所有图表使用统一的深色风格：

```js
{
  backgroundColor: 'transparent',
  textStyle: { color: '#94a3b8', fontSize: 11 },
  grid: { left: 50, right: 20, top: 20, bottom: 30 },
  // 坐标轴：splitLine color 'rgba(148,163,184,.1)'
  // 系列配色：['#00d4ff', '#818cf8', '#22c55e', '#f59e0b', '#ef4444', '#f472b6']
}
```

---

## 5. 构建与部署

### 5.1 构建产物

```bash
npm run build
```

产物输出到 `dist/` 目录：
- `index.html` — 入口页
- `assets/index-*.css` — 样式（~1.7 KB gzip）
- `assets/index-*.js` — 应用代码（~450 KB gzip，含 ECharts 库）
- `guangyuan.json` — 地图数据（107 KB，从 `public/` 复制）

### 5.2 GitHub Pages 部署

已配置 `.github/workflows/deploy.yml`：
- 触发条件：推送到 `main` 分支
- 构建环境：Node.js 20，`npm ci` + `npm run build`
- 部署目标：GitHub Pages（`dist/` 目录）
- Vite `base` 设置为 `/guangyuan-cockpit/`

### 5.3 其他部署方式

部署到自定义域名或根路径时，修改 `vite.config.js`：

```js
export default defineConfig({
  plugins: [react()],
  base: '/',  // 根路径部署改为 '/'
})
```

---

## 6. 新增模块指南

如需添加新的功能模块：

1. 在 `src/pages/` 下创建新目录和 `index.jsx`
2. 导出自定义 Hook：`export default function useNewModule() { return { leftPanel, rightPanel, mapContent }; }`
3. 在 `src/data/mockData.js` 中添加对应的 Mock 数据并 `export`
4. 在 `src/App.jsx` 中：
   - `import useNewModule from './pages/NewModule'`
   - 添加 `function ModuleNewModule()` 包装组件
   - 在 `MODULE_MAP` 中注册
5. 在 `src/components/layout/Header.jsx` 的 `MODULES` 数组中添加 Tab 配置
