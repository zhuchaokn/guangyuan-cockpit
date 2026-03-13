# 广元行驾驶舱需求核对问题清单

> 核对日期：2026-03-14
> 核对依据：副本广元行驾驶舱清单.xlsx
> 代码库：guangyuan-cockpit
> 最后更新：2026-03-14 第三轮复核

---

## 最终状态：全部修复 ✅

经过三轮复核，原始 35 项问题已 **全部修复**（修复率 100%）。

---

## 修复记录

### P0 — 文字/名称错误（4项 ✅）

| 编号 | 问题 | 修复方式 |
|------|------|----------|
| P1-6 | "视频监控"→"监控点位" | `mockData.js` resources name 修改 |
| P5-18c | 号牌种类"蓝牌/黄牌/绿牌"→"小型车/大型车/其它" | `TrafficStatus` CheckpointBlock pieOption 数据修改 |
| P11-nav-a | "道路流量"→"道路流量管理" | `Header.jsx` MODULES label 修改 |
| P11-nav-b | "车辆数据"→"车辆数据管理" | `Header.jsx` MODULES label 修改 |

### P1 — 数据展示缺失（11项 ✅）

| 编号 | 问题 | 修复方式 |
|------|------|----------|
| P2-12b | 机动车两率增加未检验/未报废绝对数量 | `TrafficStatus` 新增 `.rate-abs-line` 展示 |
| P2-13b | 驾驶人两率增加逾期未换证/逾期未审验数量 | 同上 |
| P4-16b | 日活跃趋势改为3条线 | `threeLineOption` 函数同时展示今日/上周/上月 |
| P4-17b | 在途趋势改为3条线 | 同上 + mockData 增加 lastMonth 字段 |
| P4-17c | 在途车辆新增大队分析 | `TrafficStatus` 新增大队分析面板 + mockData 新增 `transitVehicles.squadRank` |
| P4-16f | 日活跃归属地增加外省明细 | 新增"外省省份明细"PanelCard + mockData 新增 `provinceDetail` |
| P6-20 | 驾驶人页面展示总量数字 | `TrafficSafety` 新增 `drivers.total` 数字展示 |
| P6-21a | 车辆页面展示总量数字 | `TrafficSafety` 新增 `vehicles.total` 数字展示 |
| P6-21b | 车辆tooltip增加各县区分布 | `TrafficSafety` vehicleOpt tooltip + mockData 新增 `vehicles.districtDetail` |
| P7-month | 四色预警增加月份选择器 | `FourColorWarning` 新增 `selectedMonth` state + 月份下拉UI |
| P12-layout | 运行态势面板布局单侧为空 | 运行概况/内部交通压力/进出交通压力均已分配左右面板内容 |

### P2 — 交互功能（7项 ✅）

| 编号 | 问题 | 修复方式 |
|------|------|----------|
| P3-15d | 拥堵路段关注功能 | 新增★/☆星标按钮 + `toggleWatch` |
| P3-15e | 拥堵路段点击展开详情 | 点击行展开显示拥堵详情/周边资源 |
| P3-15f | 拥堵区域关注+点击展开 | 同上 |
| P3-15g | 重点关注关注按钮 | 新增★/☆星标按钮 |
| P5-18d | 卡口点击详情弹窗 | 点击卡口行展开详情（名称/日累计/设备状态/趋势线） |
| P3-15b | 自定义对比日期选择器 | CompareSelector 选"自定义"后显示 `<input type="date">` |
| P4-16c | 日活跃自定义日期选择器 | 复用 CompareSelector 组件 |

### P3 — 地图联动（7项 ✅）

| 编号 | 问题 | 修复方式 |
|------|------|----------|
| P2-12a | 机动车辖区排名定时跳转 | `autoRotateRef` + `useEffect` 每5秒自动轮播辖区高亮 |
| P2-13a | 驾驶人辖区排名定时跳转 | 同上（`isDistrictRankActive` 含 driverInnerTab） |
| P2-14b | 路网辖区排名定时跳转 | 同上（`isDistrictRankActive` 含 roadInnerTab） |
| P2-12c | 机动车两率结合地图 | `getMapDistrictColors()` 当两率tab激活时按辖区着色 |
| P2-13c | 驾驶人两率结合地图 | 同上 |
| P3-15c | 大队排名与地图联动 | 新增📍按钮 + `SQUAD_TO_DISTRICT` 映射 |
| P4-16e | 日活跃大队分析地图联动 | 同上 |

### P4 — 异常值高亮（5项 ✅）

| 编号 | 问题 | 修复方式 |
|------|------|----------|
| P2-14a | 路网密度异常值高亮 | 条件判断 + 红色文字 + "异常"badge |
| P3-15a | 交通指数/拥堵里程异常值 | `AnomalyWrap` 组件包裹 |
| P4-16a | 日活跃异常值 | 同上 |
| P4-17a | 在途车辆异常值 | 同上 |
| P5-18a/e | 进/出城异常值 | 同上 |

### 其他（1项 ✅）

| 编号 | 问题 | 修复方式 |
|------|------|----------|
| P4-16d | 日活跃大队分析数据源独立 | 改用 `activeVehicles.squadRank` + mockData 新增独立数据 |
