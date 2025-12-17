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

## 图表样式规范

### 通用样式配置
为确保所有图表的视觉一致性和可读性，实施了统一的样式规范：

#### 1. 网格线管理
- **去除所有网格线**: 所有X轴和Y轴的 `splitLine` 均设置为 `false`
- **保留坐标轴线**: 轴线宽度 1px，保持图表边界清晰

#### 2. 文字样式
- **全局粗体**: 所有文字（坐标轴标签、名称、图例、提示框）统一使用粗体
- **字号标准**:
  - 坐标轴标签: 11-12px
  - 坐标轴名称: 14px
  - 预警线标签: 13px

#### 3. X轴标签优化
- **水平显示**: 所有X轴标签 `rotate: 0`，不倾斜
- **自适应宽度**: 根据数据数量动态计算标签宽度
- **防重叠机制**:
  - `interval: 0` - 显示所有标签
  - `overflow: 'truncate'` - 超长文字截断
  - `hideOverlap: false` - 不隐藏重叠标签

#### 4. 预警线显示
- **线型**: 使用实线（`type: 'solid'`）而非虚线，确保清晰可见
- **线宽**: 3px，醒目突出
- **标签**: 粗体，位于线条末端

#### 5. 气泡图坐标轴
- **X轴名称**: 字号14px，粗体，向下偏移30px
- **Y轴名称**: 字号14px，粗体，向左偏移35px
- **名称位置**: 居中显示，避免被数据遮挡

### 实现方法
通过 `getGlobalChartOptions()` 函数提供统一的图表配置模板：

```javascript
const globalOptions = this.getGlobalChartOptions();
option = {
    grid: globalOptions.grid,
    xAxis: { ...globalOptions.xAxis, /* 特定配置 */ },
    yAxis: { ...globalOptions.yAxis, /* 特定配置 */ }
};
```

所有图表模块（overview、cost、premium、loss、expense）均已应用此规范。

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
