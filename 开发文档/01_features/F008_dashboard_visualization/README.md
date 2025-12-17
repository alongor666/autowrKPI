# F008 交互式数据可视化仪表盘

## 功能概述
提供基于 Web 的单页应用（SPA）界面，用于车险经营数据的可视化分析。取代了传统的静态 HTML 报告生成模式。

## 业务背景
用户需要更灵活地探索数据，而不仅仅是查看生成的静态报告。新系统支持：
- 实时筛选（年度、周次）
- 多维下钻（机构、客户类别、业务类型）
- 图表联动与交互

## 核心逻辑
1. **SPA 架构**: `index.html` 作为应用容器，不再进行页面跳转或 Iframe 嵌套。
2. **组件化渲染**: `Dashboard` 对象负责管理 UI 状态和图表生命周期。
3. **ECharts 集成**: 使用 ECharts 渲染高性能图表（柱状图、散点气泡图等）。
4. **动态交互**: 
   - 点击筛选按钮触发 Worker 数据重算。
   - 重算结果通过回调更新 `Dashboard.data`。
   - `Dashboard` 触发图表 `setOption` 更新视图。

## 技术选型
- **ECharts 5.4**: 可视化引擎。
- **原生 JS (ES6+)**: 无框架依赖，保持轻量。
- **CSS3 Variables**: 统一主题管理。

## 使用示例
```javascript
// 初始化仪表盘
Dashboard.init(initialData, workerInstance);

// 切换维度
Dashboard.switchDimension('cost', 'category');

// 打开下钻弹窗
Dashboard.openDrillModal();
```

## 已知问题
- 目前图表配置逻辑较长，未来可进一步拆分为独立的 ChartConfig 模块。
