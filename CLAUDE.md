# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# 车险经营分析可视化系统 - 开发指南

## 🚀 快速启动

### 本地开发
```bash
# 启动本地HTTP服务器（推荐）
python3 -m http.server 8000

# 访问应用
open http://localhost:8000
```

### 其他启动方式
```bash
# 使用Node.js
npx http-server -p 8000

# 使用PHP
php -S localhost:8000
```

## 📐 核心架构

### 数据处理流程
```
用户上传CSV/Excel
    ↓
Web Worker解析文件 (data.worker.js)
    ↓
业务类型映射 (mapBusinessTypes)
    ↓
KPI计算 (calculateKPIsForGroup)
    ↓
多维度聚合 (aggregateByDimension)
    ↓
Dashboard渲染 (dashboard.js)
```

### 关键技术决策

#### 1. Web Worker架构（性能优化）
- **原因**: 处理大型CSV文件（16000+行）时避免主线程阻塞
- **实现**: `js/data.worker.js` 独立线程处理数据
- **通信**: 消息桥接模式（主线程 ↔ Worker）
```javascript
// 主线程发送
worker.postMessage({ type: 'filter_data', payload: { filterState } });

// Worker响应
self.postMessage({ type: 'filter_complete', payload: processedData });
```

#### 2. 下钻筛选逻辑（核心功能）
- **位置**: `js/data.worker.js:488-549` (applyFiltersAndRecalc)
- **筛选顺序**: 时间筛选 → 下钻筛选 → 重新聚合
- **维度关系**:
  - 多维度间：AND（必须同时满足）
  - 同维度多值：OR（任一值匹配即可）
```javascript
// 示例：筛选"天府"或"青羊"的"非营业个人客车"
filterState.drill.applied = [
  { dimension: 'third_level_organization', values: ['天府', '青羊'] },
  { dimension: 'customer_category_3', values: ['非营业个人客车'] }
];
```

#### 3. 状态管理模式（Draft/Applied）
- **目的**: 避免每次选择立即刷新，提供"批量选择→一次应用"体验
- **实现**: `dashboard.js:19-28`
```javascript
filterState: {
  time: { applied: { year: null, weekStart: 1, weekEnd: 52 } },
  drill: {
    applied: [],  // 已应用的筛选条件
    draft: null   // 弹窗编辑中的草稿
  }
}
```

## 🗂️ 关键文件说明

### 前端核心
| 文件 | 职责 | 关键函数 |
|------|------|----------|
| `index.html` | SPA主页面 | 上传区、仪表盘容器、下钻弹窗 |
| `js/dashboard.js` | UI交互逻辑 | `renderKPI()`, `renderChart()`, `applyFilters()` |
| `js/static-report-generator.js` | Worker管理器 | `loadData()`, `handleFilterRequest()` |
| `js/data.worker.js` | 数据处理引擎 | `processData()`, `applyFiltersAndRecalc()` |
| `css/dashboard.css` | 麦肯锡风格样式 | 主题色 `#a02724` |

### 业务配置
| 文件 | 用途 |
|------|------|
| `reference/business_type_mapping.json` | 业务类型映射（原始值→标准化值） |
| `reference/thresholds.json` | KPI阈值（变动成本率、赔付率、费用率） |
| `reference/year-plans.json` | 年度保费计划（用于计算达成率） |

## 🔧 维度字段映射

**重要**: 下钻功能依赖字段兼容性映射，支持不同CSV字段名

```javascript
// 位置: js/data.worker.js:463-469
const dimensionConfigMap = {
  'third_level_organization': ['third_level_organization', '三级机构', '机构'],
  'customer_category_3': ['customer_category_3', '客户类别'],
  'ui_short_label': ['ui_short_label', '业务类型简称', 'business_type_category'],
  'policy_start_year': ['policy_start_year', '保单年度', '年度'],
  'week_number': ['week_number', '周次']
};
```

## 📊 数据聚合逻辑

### 关键聚合维度
- **三级机构** (`third_level_organization`): 按分支机构聚合
- **客户类别** (`customer_category_3`): 按客户类型聚合
- **业务类型** (`ui_short_label`): 按业务分类聚合

### KPI计算公式
```javascript
// 位置: js/data.worker.js:244-309
变动成本率 = 满期赔付率 + 费用率
满期赔付率 = (已报告赔款 / 满期保费) × 100
费用率 = (费用额 / 签单保费) × 100
赔付频度 = (赔案件数 / 保单件数) × 100
```

## 🎨 UI状态颜色规范

### KPI阈值（符合业务规范）
```javascript
// 位置: dashboard.js:82-106
变动成本率: { 危险: >94%, 警告: >91%, 良好: ≤91% }
满期赔付率: { 危险: >75%, 警告: >70%, 良好: ≤70% }
费用率:     { 危险: >17%, 警告: >14%, 良好: ≤14% }
保费进度率: { 危险: <95%, 警告: 95-100%, 良好: ≥100% }
```

### 颜色变量
```css
--primary-red: #a02724      /* 主题色、危险状态 */
--warning-yellow: #ffc000   /* 警告状态 */
--success-green: #00b050    /* 良好状态 */
```

## 🐛 调试技巧

### 查看Worker日志
```javascript
// Worker内所有日志以 [Worker] 前缀标识
console.log('[Worker] 开始处理数据，行数:', csvData.length);
```

### 追踪筛选状态
```javascript
// 浏览器Console执行
Dashboard.filterState  // 查看当前筛选条件
```

### 性能分析
```javascript
// data.worker.js 中已有日志节点
// 观察：CSV解析完成 → 业务类型映射 → 全局KPI计算
```

## ⚠️ 重要注意事项

### 1. 不要直接修改rawCSVData
```javascript
// ❌ 错误：会污染原始数据
rawCSVData.forEach(row => row.ui_short_label = 'xxx');

// ✅ 正确：mapBusinessTypes会在processData中统一处理
const mappedData = mapBusinessTypes(csvData);
```

### 2. 下钻维度key必须与dimensionConfigMap匹配
```javascript
// ❌ 错误：无法识别
{ dimension: '机构', values: ['天府'] }

// ✅ 正确：使用标准key
{ dimension: 'third_level_organization', values: ['天府'] }
```

### 3. Worker通信采用一次性监听器模式
```javascript
// 位置: dashboard.js:675-686
const handler = (e) => {
  if (e.data.type === 'filter_complete') {
    // 处理数据
    this.worker.removeEventListener('message', handler); // 必须移除
  }
};
this.worker.addEventListener('message', handler);
```

## 📝 添加新维度步骤

1. **更新维度配置** (`dashboard.js:618-626`)
```javascript
getDrillDownDimensions() {
  return [
    { key: 'new_dimension', label: '新维度名称' }
  ];
}
```

2. **添加字段映射** (`data.worker.js:463-469`)
```javascript
dimensionConfigMap: {
  'new_dimension': ['csv_field_name', '中文字段名']
}
```

3. **验证数据可用性**: 确保CSV中包含对应字段

## 🚢 部署说明

### GitHub Pages自动部署
```bash
git add .
git commit -m "功能更新"
git push origin main
# GitHub Actions会自动部署到 https://[username].github.io/utoweKPI-py
```

### 本地测试部署版本
```bash
# 模拟生产环境
python3 -m http.server 8000 --bind 127.0.0.1
```

## 📚 文档索引

- **功能特性**: 查看 `开发文档/KNOWLEDGE_INDEX.md`
- **下钻方案**: 查看 `开发文档/reports/下钻功能集成方案.md`
- **特性文档**: 查看 `开发文档/01_features/F00X_*/README.md`

## 🔍 常见开发场景

### 修改KPI阈值
编辑 `reference/thresholds.json`，重启服务器即可生效

### 调整图表样式
主要位置: `dashboard.js:404-616` (renderChart函数)

### 新增聚合维度
1. 在 `data.worker.js:aggregateByDimension` 中添加分组逻辑
2. 在 `dashboard.js` 中添加对应UI切换

### 优化大数据处理
- Worker已处理16000+行无卡顿
- 如需更高性能，考虑分页聚合或虚拟滚动
