# 广元市综合管控驾驶舱

> 智慧交通数据可视化大屏系统 — 前端静态演示版

**在线演示：** https://waynejoker-bot.github.io/guangyuan-cockpit/

---

## 项目概述

本项目为广元市综合管控驾驶舱的前端展示系统，采用全屏大屏布局设计，涵盖 7 大核心模块、22 个子模块、41 项功能点。所有数据使用 Mock 假数据，无需后端接口，可独立运行。

地图使用广元市真实 GeoJSON 行政区划数据（利州区、昭化区、朝天区、旺苍县、青川县、剑阁县、苍溪县），标注点位均落在真实地理区域内。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 19.x |
| 构建 | Vite | 8.x |
| 图表 | ECharts | 6.x |
| 图表桥接 | echarts-for-react | 3.x |
| 路由 | react-router-dom | 7.x |
| 地图数据 | 阿里 DataV GeoJSON | 广元市 510800 |
| 部署 | GitHub Pages + Actions | - |

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/Waynejoker-bot/guangyuan-cockpit.git
cd guangyuan-cockpit

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 本地预览生产版本
npm run preview
```

开发服务器默认地址：`http://localhost:5173/`

### 部署

项目已配置 GitHub Actions 自动部署。推送到 `main` 分支后会自动构建并部署到 GitHub Pages。

手动部署到其他平台：

```bash
npm run build
# 将 dist/ 目录部署到任意静态文件服务器
```

## 功能模块

| 模块 | 功能概述 | 子模块数 | 功能点 |
|------|----------|---------|--------|
| 地图总览 | 资源分布地图、数据总览、设备在线率 | 3 | 11 |
| 运行态势 | 保有量分析、交通指数、车辆活跃度、进出城流量 | 4 | 8 |
| 交通安全 | 人车路数据、隐患排查、企业管理、安全站点 | 8 | 8 |
| 四色预警 | 区县评分、隐患统计、事故分析、事故热力图 | 7 | 7 |
| 道路流量 | 月度流量趋势、路口流量排行 | 2 | 2 |
| 车辆数据 | 归属地统计、车辆类型分布 | 2 | 4 |
| 布控预警 | 实时报警列表、报警类型统计、趋势分析 | 1 | 1 |

## 项目结构

```
guangyuan-cockpit/
├── .github/workflows/deploy.yml  # GitHub Pages 自动部署
├── public/
│   └── guangyuan.json            # 广元市 GeoJSON 行政区划数据
├── src/
│   ├── components/
│   │   ├── common/               # 通用组件
│   │   │   ├── DataCard.jsx      #   数据指标卡片（数字滚动动画）
│   │   │   ├── MapView.jsx       #   ECharts 地图组件（GeoJSON 渲染）
│   │   │   ├── MiniChart.jsx     #   迷你折线图/柱状图
│   │   │   ├── PanelCard.jsx     #   面板容器卡片
│   │   │   └── RingProgress.jsx  #   环形进度条（SVG）
│   │   └── layout/               # 布局组件
│   │       ├── CockpitLayout.jsx #   驾驶舱主布局框架
│   │       └── Header.jsx        #   顶部导航栏（模块切换 + 时钟）
│   ├── data/
│   │   └── mockData.js           # 全量 Mock 数据（~386 行）
│   ├── pages/                    # 7 个功能模块页面
│   │   ├── MapOverview/          #   地图总览
│   │   ├── TrafficStatus/        #   运行态势（含子 Tab 切换）
│   │   ├── TrafficSafety/        #   交通安全（含子 Tab 切换）
│   │   ├── FourColorWarning/     #   四色预警
│   │   ├── TrafficFlow/          #   道路流量管理
│   │   ├── VehicleData/          #   车辆数据管理
│   │   └── SurveillanceAlert/    #   布控预警（含自动滚动）
│   ├── styles/
│   │   └── global.css            # 全局样式和 CSS 变量
│   ├── App.jsx                   # 应用入口（模块路由）
│   └── main.jsx                  # React 挂载入口
├── docs/
│   └── plans/                    # 需求文档和设计文档
├── vite.config.js                # Vite 构建配置
└── package.json
```

## 相关文档

- [完整需求文档](docs/plans/2026-03-13-guangyuan-cockpit-requirements.md) — 41 项功能点的详细描述和实现方案
- [开发文档](docs/development.md) — 架构设计、组件接口、数据结构、扩展指南
- [测试文档](docs/testing.md) — 功能测试清单和验收报告

## License

本项目为竞标演示用途，仅限内部使用。
