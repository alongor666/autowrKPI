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

## 损失暴露分析设计 (2025-12-18)

### 功能目标
提供二维风险分析视图，帮助用户识别"高赔付率×高占比"的高风险高暴露业务单元。

### 图表设计

#### 损失暴露气泡图
- **位置**: 损失分析板块 > 新增子标签页"损失暴露"
- **图表类型**: 散点图（气泡图）`type: 'scatter'`
- **坐标轴**:
  - **X轴**: 已报告赔款占比（%）
  - **Y轴**: 满期赔付率（%）
  - **气泡大小**: 已报告赔款绝对值（元）
- **排序规则**: 按赔款占比降序排列
- **四象限分析**:
  ```
  高赔付×高占比(左上) | 高赔付×低占比(右上)
  ─────────────────┼───────────────────
  低赔付×高占比(左下) | 低赔付×低占比(右下)
  ```
  重点关注左上象限（高风险高暴露）

#### 数据处理逻辑
```javascript
// 计算赔款占比
const total已报告赔款 = data.reduce((sum, item) => sum + item.已报告赔款, 0);
data.forEach(item => {
    item.已报告赔款占比 = (item.已报告赔款 / total已报告赔款) * 100;
});

// 按占比降序排序
data.sort((a, b) => b.已报告赔款占比 - a.已报告赔款占比);
```

#### 气泡大小映射
```javascript
// 使用平方根缩放，避免大小差异过大
symbolSize: (data) => {
    const value = data[2]; // 已报告赔款绝对值
    const minSize = 15;
    const maxSize = 80;
    const scale = Math.sqrt(value / maxValue);
    return minSize + (maxSize - minSize) * scale;
}
```

### 气泡图标签优化规范

#### 标签显示策略
1. **简化信息**: 只显示名称和率值，移除绝对值
   ```javascript
   label: {
       color: '#000000',  // 统一使用黑色，确保在所有背景色下清晰可读
       formatter: (params) => {
           const name = params.data.name;
           const rate = params.data.满期赔付率.toFixed(1);  // 保留1位小数
           return `${name}\n${rate}%`;
       }
   }
   ```

2. **视觉规范** (2025-12-18 补充):
   - **颜色**: 统一使用黑色(#000000)，不随气泡颜色变化
   - **小数精度**: 率值保留1位小数（85.1%而非85.06%）
   - **理由**: 黑色文字对比度最高，1位小数减少视觉干扰

3. **防重叠配置**:
   ```javascript
   label: {
       overflow: 'truncate',
       ellipsis: '...',
       fontSize: 11
   }
   ```

3. **优先级排序**: 按照以下规则确定标签显示优先级
   - **状态权重**: 危险(100分) > 警告(50分) > 正常(0分)
   - **占比权重**: 赔款占比（0-100分）
   - **综合得分**: 状态权重 + 占比权重
   - **显示规则**: 只显示前10个优先级最高的标签

#### 优先级算法实现
```javascript
function calculateLabelPriority(item) {
    // 计算状态权重
    const statusScore = {
        'danger': 100,   // 赔付率 > 75%
        'warning': 50,   // 赔付率 > 70%
        'good': 0
    }[item.status] || 0;

    // 占比权重
    const sizeScore = item.已报告赔款占比 || 0;

    return statusScore + sizeScore;
}

// 应用优先级
const sortedData = data
    .map(item => ({
        ...item,
        priority: calculateLabelPriority(item)
    }))
    .sort((a, b) => b.priority - a.priority);

// 配置标签显示
series: [{
    data: sortedData.map((item, index) => ({
        ...item,
        label: {
            show: index < 10,  // 只显示前10个
            fontSize: index < 5 ? 12 : 10  // 前5个字体更大
        }
    }))
}]
```

### 预警线优化规范

#### 调整原则
- **移除危险线**: 避免过于刺激的视觉语言
- **保留预警线**: 使用单一警戒线，语义更积极
- **线型调整**: 改用虚线，视觉更柔和

#### 统一配置函数
```javascript
function getWarningLineConfig(kpiType, threshold) {
    return {
        yAxis: threshold,
        name: '预警线',
        lineStyle: {
            color: '#ffc000',
            type: 'dashed',  // 虚线
            width: 2
        },
        label: {
            formatter: `预警线: ${threshold}%`,
            position: 'insideEndTop',
            color: '#ffc000',
            fontSize: 12,
            fontWeight: 'bold'
        }
    };
}
```

#### 各KPI预警线阈值
| KPI | 预警线阈值 | 说明 |
|-----|-----------|------|
| 变动成本率 | 91% | 超过需关注 |
| 满期赔付率 | 70% | 超过需关注 |
| 费用率 | 14% | 超过需关注 |
| 保费进度率 | 95% | 低于需关注 |

### 单位标准化规范

#### 案均赔款单位调整
- **修改前**: 显示为"万元"，如"1.57万元"
- **修改后**: 显示为"元"，如"15,700元"
- **原因**:
  - 符合保险业报告习惯
  - 保留数据精度（避免小数点）
  - 与KPI计算逻辑单位一致

#### 格式化函数
```javascript
// 案均赔款格式化（带千分位）
formatInteger(value) {
    if (value === null || value === undefined) return 'N/A';
    return Math.round(value).toLocaleString('zh-CN');
}

// 使用示例
tooltip: {
    formatter: (params) => {
        return `案均赔款: ${this.formatInteger(params.data.案均赔款)}元`;
    }
}
```

#### 影响范围
- 损失分析 > 频度VS额度图表
- Y轴标签: "案均赔款(元)"
- Tooltip显示: "案均赔款: 15,000元"

### 交互增强

#### Tooltip详细信息
虽然标签简化，但tooltip需提供完整信息：
```javascript
tooltip: {
    trigger: 'item',
    formatter: (params) => {
        const d = params.data;
        return `
            <strong>${d.name}</strong><br/>
            满期赔付率: ${d.满期赔付率.toFixed(1)}%<br/>
            赔款占比: ${d.已报告赔款占比.toFixed(1)}%<br/>
            已报告赔款: ${this.formatWanYuanFromYuan(d.已报告赔款)}万元
        `;
    }
}
```

#### 下钻支持
损失暴露图表支持与其他维度联动：
- 点击气泡可进一步下钻到具体业务明细
- 支持时间筛选（年度、周次）
- 支持维度切换（机构/客户类别/业务类型）

## 已知问题
- 目前图表配置逻辑较长，未来可进一步拆分为独立的 ChartConfig 模块。
- 气泡图标签优先级算法可能需要根据实际使用反馈调整权重。
