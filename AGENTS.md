# AGENTS.md — 广元市综合管控驾驶舱

> 本文件记录该项目的 AI 辅助开发过程、使用的 Skills 和工作约定，供后续 AI 协作时参考。

---

## 项目概述

广元市综合管控驾驶舱的前端静态展示系统，用于竞标演示。全屏大屏布局，7 大模块 41 项功能，Mock 假数据驱动，无需后端。

- **仓库**: https://github.com/Waynejoker-bot/guangyuan-cockpit
- **在线地址**: https://waynejoker-bot.github.io/guangyuan-cockpit/
- **技术栈**: React 19 + Vite 8 + ECharts 6 + GeoJSON

---

## 使用的 Skills

### 核心开发 Skills

| Skill | 用途 | 阶段 |
|-------|------|------|
| **brainstorming** | 需求理解、技术方案讨论、布局方案选择 | 项目启动 |
| **frontend-design** | 深色科技风 UI 设计指导，避免 "AI slop" 审美 | 全程 |
| **writing-plans** | 将 41 项功能点扩展为完整需求规格文档 | 需求阶段 |
| **using-superpowers** | 确保在每个步骤调用正确的 Skill | 全程 |

### 辅助 Skills

| Skill | 用途 |
|-------|------|
| **dispatching-parallel-agents** | 并行派发 4 个子 Agent 同时构建 7 个页面模块 |
| **verification-before-completion** | 使用 Playwright 验证所有模块渲染正确，0 错误 |
| **subagent-driven-development** | 按模块拆分任务，每个子 Agent 独立完成一个模块 |

---

## 开发流程记录

### 第一阶段：需求分析

1. 使用 Python openpyxl 解析 `副本广元行驾驶舱清单.xlsx`
2. 提取 7 大模块、22 个二级标题、41 项功能点
3. 通过 `brainstorming` 确认技术选型：React + Vite + ECharts
4. 通过交互问答确认布局风格：全屏大屏指挥中心模式

### 第二阶段：架构设计

1. 使用 `writing-plans` 将每个功能点扩展为完整需求文档（含实现方案）
2. 设计模块 Hook 模式：每个模块导出 `{ leftPanel, rightPanel, mapContent }`
3. 设计通用组件体系：DataCard / PanelCard / RingProgress / MapView / MiniChart

### 第三阶段：并行开发

1. 创建核心布局框架（Header + CockpitLayout）和通用组件
2. 使用 `dispatching-parallel-agents` 并行派发 4 个子 Agent：
   - Agent 1: MapOverview 模块
   - Agent 2: TrafficStatus 模块
   - Agent 3: TrafficSafety + FourColorWarning 模块
   - Agent 4: TrafficFlow + VehicleData + SurveillanceAlert 模块
3. 合并后修复 React Hooks 规则冲突（将条件性 Hook 调用封装为独立组件）

### 第四阶段：地图升级

1. 从阿里 DataV 获取广元市 GeoJSON 数据（行政编码 510800）
2. 将 SVG 占位符替换为 ECharts geo 地图（真实区县边界）
3. 校正所有 Mock 经纬度到 7 个区县的真实地理范围
4. 修复 `import.meta.env.BASE_URL` 路径以兼容 GitHub Pages 子路径部署

### 第五阶段：部署与文档

1. 配置 GitHub Actions 自动构建部署到 GitHub Pages
2. 使用 Playwright 自动化验证全部 7 个模块无 JS 错误
3. 编写 README、开发文档、测试文档

---

## 工作约定

### 代码规范

- 每个模块一个目录（`src/pages/<ModuleName>/index.jsx`）
- 通用组件放 `src/components/common/`
- 布局组件放 `src/components/layout/`
- Mock 数据集中在 `src/data/mockData.js`，按模块导出
- 样式使用 CSS 变量 + 内联 style/style 标签，不使用 CSS Modules
- ECharts 配置统一深色主题：transparent 背景、`#94a3b8` 文字、`rgba(148,163,184,.1)` 网格线

### 模块接口约定

每个模块导出一个自定义 Hook：

```jsx
export default function useModuleName() {
  // 内部可自由使用 useState / useEffect 等 Hooks
  return {
    leftPanel: <JSX />,    // 左侧面板内容
    rightPanel: <JSX />,   // 右侧面板内容
    mapContent: <JSX />,   // 中间地图区域内容
    bottomBar: <JSX />,    // 可选：底部浮动栏
  };
}
```

在 `App.jsx` 中必须封装为独立组件后使用（避免 Hooks 规则冲突）：

```jsx
function ModuleXxx() {
  const d = useModuleName();
  return <CockpitInner {...d} />;
}
// 通过 key={activeModule} 切换时完全重建
```

### 地图约定

- GeoJSON 数据存放在 `public/guangyuan.json`
- MapView 组件使用 `import.meta.env.BASE_URL` 拼接 fetch 路径
- 标注类型通过 `type` 字段区分，颜色和形状在 MapView 内部映射
- 广元市中心坐标：`[105.84, 32.44]`

### 部署约定

- `main` 分支推送自动触发 GitHub Pages 部署
- Vite `base` 配置为 `/guangyuan-cockpit/`（如部署到其他路径需修改）
- 构建产物在 `dist/`，包含 `guangyuan.json` 地图数据

---

## 关键决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 框架 | React（非 Vue） | 用户选择，组件化能力强 |
| 图表库 | ECharts（非 D3/Highcharts） | 中国项目生态成熟，地图支持好 |
| 地图方案 | ECharts geo + GeoJSON（非高德/百度 API） | 无需 API Key，纯前端离线可用 |
| 布局模式 | 全屏大屏指挥中心 | 用户选择，竞标冲击力最强 |
| 样式方案 | CSS 变量 + 内联样式 | 简单直接，无额外构建配置 |
| 部署 | GitHub Pages | 用户已有 GitHub 账号，免费可用 |
| Mock 数据 | 集中式单文件 | 方便后续替换为 API，一目了然 |
