# CLAUDE.md

> 车险经营分析可视化系统 - AI 开发助手指南

---

## 🚨 治理协作协议（必读优先级最高）

### 必经入口（接到任务必须先查看）

1. **三大索引**（快速定位）
   - [📚 DOC_INDEX.md](./开发文档/00_index/DOC_INDEX.md) - 所有文档导航
   - [💻 CODE_INDEX.md](./开发文档/00_index/CODE_INDEX.md) - 所有代码地图
   - [📈 PROGRESS_INDEX.md](./开发文档/00_index/PROGRESS_INDEX.md) - 进展追踪入口

2. **两本账**（需求与进展）
   - [📋 BACKLOG.md](./BACKLOG.md) - 需求待办清单（所有任务的唯一来源）
   - [📈 PROGRESS.md](./PROGRESS.md) - 里程碑与阻塞记录（状态机思维）

3. **协作上下文**
   - [🤖 AGENT.md](./AGENT.md) - Agent工作规范与禁区

### 护栏（禁止触碰区域）

**🔒 唯一事实来源（禁止擅自修改）**:
- `/reference/business_type_mapping.json` - 业务类型映射
- `/reference/thresholds.json` - KPI阈值配置
- `/reference/year-plans.json` - 年度保费计划
- `/开发文档/板块文档/01_指标体系.md` - 指标口径定义

**变更流程**: 必须先在 `/开发文档/decisions/` 创建ADR（决策记录），说明原因、影响、替代方案、回滚策略，再修改。

**🚫 禁止操作**:
- 不得在主线程进行大数据处理（必须用Worker）
- 不得直接修改 `rawCSVData`（必须用映射函数）
- 不得跳过字段映射配置（添加新维度必须更新 `dimensionConfigMap`）
- 不得在代码中硬编码阈值/映射（必须从 `/reference/` 加载）

### 交付协议（任务完成标准）

**1. 新增需求必须进BACKLOG**
- 格式：在 `BACKLOG.md` 新增一行，状态为 `PROPOSED`
- 必填字段：ID、提出时间、板块、需求描述、优先级

**2. DONE必须有证据（缺一不可）**
- ✅ **关联文档路径**：必填
- ✅ **关联代码路径**：涉及代码则必填，纯文档任务可标记 `N/A`
- ✅ **验收/证据**：PR链接 / commit哈希 / 对比报告路径 至少一种

**3. 涉及核心层改动必须更新索引**
- 修改 `/js/` → 更新 `js/INDEX.md` + `CODE_INDEX.md`
- 修改 `/reference/` → 更新 `reference/INDEX.md` + 创建ADR
- 新增功能 → 更新 `开发文档/01_features/INDEX.md` + `DOC_INDEX.md`
- 新增板块 → 更新 `开发文档/板块文档/INDEX.md` + `DOC_INDEX.md`

**4. 治理一致性校验**
- 提交前运行：`node scripts/check-governance.mjs`
- 校验规则：根目录文件完整性、索引存在性、DONE证据完整性

---

## 📚 项目概览

@README

**核心特性**: 纯前端数据分析系统，Web Worker 架构，电商式筛选体验，完全离线运行

---

## 🎯 开发原则

### 代码风格
- **缩进**: 2 空格（JavaScript、CSS）
- **命名约定**:
  - 驼峰命名：JavaScript 函数和变量 (`calculateKPI`, `filterState`)
  - 下划线命名：数据字段 (`third_level_organization`, `customer_category_3`)
  - 短横线命名：CSS 类名 (`.drill-selector`, `.kpi-card`)
- **注释**: 关键业务逻辑必须注释，格式 `// 说明原因`
- **文件组织**: 单一职责原则，避免超过 500 行的文件

### 提交规范
```bash
# 提交消息格式（遵循 Gitmoji）
<emoji> <类型>: <简短描述>

常用 emoji：
✨ feat: 新功能
🐛 fix: 修复 Bug
📝 docs: 文档更新
🎨 style: UI/样式优化
⚡️ perf: 性能优化
♻️ refactor: 代码重构
```

---

## 🏗️ 核心架构

### 数据处理流程

```
用户上传 CSV/Excel
    ↓
Web Worker 解析 (data.worker.js)
    ↓
业务类型映射 (mapBusinessTypes)
    ↓
KPI 计算 (calculateKPIsForGroup)
    ↓
多维度聚合 (aggregateByDimension)
    ↓
Dashboard 渲染 (dashboard.js)
```

### 关键技术决策

#### 1. Web Worker 架构（性能优化）

**位置**: `js/data.worker.js`

**原因**: 处理大型 CSV 文件（16000+ 行）时避免主线程阻塞

**通信模式**:
```javascript
// 主线程 → Worker
worker.postMessage({
  type: 'filter_data',
  payload: { filterState }
});

// Worker → 主线程
self.postMessage({
  type: 'filter_complete',
  payload: processedData
});
```

**⚠️ 关键注意**:
- Worker 通信必须使用**一次性监听器模式** (`dashboard.js:675-686`)
- 处理完毕后必须 `removeEventListener` 防止内存泄漏

```javascript
// ✅ 正确写法
const handler = (e) => {
  if (e.data.type === 'filter_complete') {
    this.processData(e.data.payload);
    this.worker.removeEventListener('message', handler); // 必须移除
  }
};
this.worker.addEventListener('message', handler);

// ❌ 错误写法
this.worker.onmessage = (e) => { /* 会导致监听器累积 */ };
```

#### 2. 电商式下拉筛选（核心功能）

**位置**: `js/dashboard.js` (`initDrillSelectors`, `toggleDropdown`)

**设计理念**: 类似淘宝/京东的商品筛选，批量选择 → 一次应用

**状态管理** (`dashboard.js:19-31`):
```javascript
filterState: {
  time: {
    applied: { year: null, weekStart: 1, weekEnd: 52 }
  },
  drill: {
    applied: [],  // 已应用的筛选 [{dimension, values}]
    draft: {}     // 草稿状态 {dimensionKey: [selectedValues]}
  }
},
activeDropdown: null  // 当前打开的下拉面板
```

**筛选逻辑**:
- 多维度间：**AND**（必须同时满足）
- 同维度多值：**OR**（任一值匹配即可）

```javascript
// 示例：筛选"天府"或"青羊"的"非营业个人客车"
filterState.drill.applied = [
  { dimension: 'third_level_organization', values: ['天府', '青羊'] },
  { dimension: 'customer_category_3', values: ['非营业个人客车'] }
];
```

**执行顺序**: 时间筛选 → 下钻筛选 → 重新聚合

#### 3. 维度字段映射（兼容性设计）

**位置**: `js/data.worker.js:524-532`

**目的**: 支持不同 CSV 导出格式的字段名

```javascript
const dimensionConfigMap = {
  'third_level_organization': ['third_level_organization', '三级机构', '机构'],
  'customer_category_3': ['customer_category_3', '客户类别'],
  'ui_short_label': ['ui_short_label', '业务类型简称', 'business_type_category'],
  'energy_type': ['energy_type', '能源类型', '是否新能源车'],
  'renewal_status': ['renewal_status', '续保状态'],
  'terminal_source': ['terminal_source', '终端来源', '出单渠道']
};
```

**⚠️ 关键注意**:
- 下钻维度 key 必须与 `dimensionConfigMap` 匹配
- 错误示例：`{ dimension: '机构', values: ['天府'] }` ❌
- 正确示例：`{ dimension: 'third_level_organization', values: ['天府'] }` ✅

---

## 📁 关键文件映射

### 前端核心

| 文件路径 | 职责 | 关键函数/变量 | 行数 |
|---------|------|-------------|------|
| `index.html` | SPA 主页面 | 上传区、仪表盘容器、下拉选择器 | ~200 |
| `js/dashboard.js` | UI 交互逻辑 | `renderKPI()`, `renderChart()`, `applyFilters()` | ~2000 |
| `js/static-report-generator.js` | Worker 管理器 | `loadData()`, `handleFilterRequest()` | ~200 |
| `js/data.worker.js` | 数据处理引擎 | `processData()`, `applyFiltersAndRecalc()` | ~1000 |
| `css/dashboard.css` | 麦肯锡风格样式 | 主题色 `#a02724` | ~1500 |

### 业务配置

| 文件路径 | 用途 | 格式 |
|---------|------|------|
| `reference/business_type_mapping.json` | 业务类型映射（原始值→标准化值） | JSON |
| `reference/thresholds.json` | KPI 阈值（变动成本率、赔付率、费用率） | JSON |
| `reference/year-plans.json` | 年度保费计划（计算达成率） | JSON |

### 开发文档

| 文件路径 | 用途 |
|---------|------|
| `开发文档/KNOWLEDGE_INDEX.md` | 功能特性索引 |
| `开发文档/manuals/DRILL_DOWN_GUIDE.md` | 下钻功能用户手册 |
| `开发文档/板块文档/02_经营概览板块.md` | 各板块详细设计 |
| `开发文档/全局设计规范.md` | UI/UX 设计规范 |

---

## 📊 业务规则与计算逻辑

### KPI 计算公式（快速参考）

**位置**: `js/data.worker.js:244-309`

```javascript
变动成本率 = 满期赔付率 + 费用率
满期赔付率 = (已报告赔款 / 满期保费) × 100
费用率 = (费用额 / 签单保费) × 100
赔付频度 = (赔案件数 / 保单件数) × 100
保费进度率 = (实际保费 / 计划保费) × 100
```

**详细说明**: 需要深入了解计算逻辑时，查看 → @.claude/rules/kpi-metrics.md

### KPI 阈值规范

**位置**: `js/dashboard.js:82-106`

| KPI | 良好 | 警告 | 危险 |
|-----|------|------|------|
| 变动成本率 | ≤91% | >91% | >94% |
| 满期赔付率 | ≤70% | >70% | >75% |
| 费用率 | ≤14% | >14% | >17% |
| 保费进度率 | ≥100% | 95-100% | <95% |

**图表预警线**: 满期赔付率统一为 **70%**

### 聚合维度配置（快速参考）

**位置**: `js/data.worker.js:477-487`

支持的聚合维度：
- `third_level_organization`: 三级机构
- `customer_category_3`: 客户类别
- `ui_short_label`: 业务类型
- `energy_type`: 是否新能源（新能源 vs 燃油车）
- `renewal_status`: 续保状态（新保 vs 续保）
- `terminal_source`: 终端来源（出单渠道）
- `policy_start_year`: 保单年度
- `week_number`: 周次

**详细配置**: 添加新维度或调试映射问题时，查看 → @.claude/rules/data-dimensions.md

---

## 🎨 UI 规范

### 配色规范

**位置**: `css/dashboard.css`

```css
/* 主题色 */
--primary-red: #a02724      /* 主题色、危险状态 */
--warning-yellow: #ffc000   /* 警告状态 */
--success-green: #00b050    /* 良好状态 */

/* 图表配色（2025-12-21 更新）*/
保费贡献度: #e0e0e0  /* 浅灰色 */
赔款贡献度: #a6a6a6  /* 灰色 */
满期赔付率线条: #0070c0  /* 蓝色，lineWidth: 2 */
```

### 维度颜色标识

**位置**: `css/dashboard.css:1172-1179`

| 维度 | 颜色 | Hex |
|------|------|-----|
| 三级机构 | 蓝色 | #0070c0 |
| 客户类别 | 绿色 | #00b050 |
| 业务类型 | 红色 | #ff0000 |
| 是否新能源 | 浅蓝 | #5b9bd5 |
| 续保状态 | 浅绿 | #a9d18e |
| 终端来源 | 黄色 | #ffd966 |

### 术语规范

- ✅ **满期赔付率 VS 赔款贡献度**（新标准）
- ❌ ~~赔付率 VS 占比~~（已废弃）

---

## ⚠️ 关键注意事项（必读）

### 🚫 禁止操作

1. **不要直接修改 `rawCSVData`**
   ```javascript
   // ❌ 错误：会污染原始数据
   rawCSVData.forEach(row => row.ui_short_label = 'xxx');

   // ✅ 正确：使用映射函数
   const mappedData = mapBusinessTypes(csvData);
   ```

2. **不要跳过字段映射配置**
   - 添加新维度时，必须同时更新 `dimensionConfigMap`
   - 否则数据无法正确聚合

3. **不要在主线程进行大数据处理**
   - 所有数据聚合/筛选必须在 Worker 中完成
   - 主线程只负责 UI 渲染

### ✅ 必须遵守

1. **图表 X 轴优化**（`dashboard.js:462-476`）
   - 标签倾斜 45 度避免重叠
   - 字体大小 10px
   - 超长文本截断（>8 字符+省略号）
   - 强制显示所有标签（`interval: 0`）

2. **Worker 监听器管理**
   - 每次通信使用一次性监听器
   - 处理完毕后必须 `removeEventListener`

3. **状态管理模式**
   - Draft（草稿）→ Applied（已应用）
   - 用户点击"应用筛选"后才触发数据重算

---

## 🛠️ 常见开发场景

### 添加新维度

**步骤**:

1. **更新维度配置** (`dashboard.js:1496-1507`)
   ```javascript
   getDrillDownDimensions() {
     return [
       { key: 'new_dimension', label: '新维度名称' }
     ];
   }
   ```

2. **添加字段映射** (`data.worker.js:524-532`)
   ```javascript
   dimensionConfigMap: {
     'new_dimension': ['csv_field_name', '中文字段名']
   }
   ```

3. **添加维度颜色** (`css/dashboard.css:1172-1179`)
   ```css
   .drill-condition-tag.dimension-new {
     border-left-color: #your-color;
   }
   ```

4. **更新颜色映射** (`dashboard.js:1978-1987`)
   ```javascript
   const dimensionClassMap = {
     'new_dimension': 'dimension-new'
   };
   ```

5. **验证数据可用性**: 确保 CSV 中包含对应字段

### 修改 KPI 阈值

编辑 `reference/thresholds.json`，保存后刷新页面即可生效（无需重启服务器）

### 调整图表样式

主要函数: `dashboard.js:404-616` (`renderChart`)

修改图表配置：
- 颜色方案：修改 `color` 数组
- 图表类型：修改 `series.type`
- 预警线：修改 `markLine.data`

### 调试技巧

#### 查看 Worker 日志
```javascript
// Worker 内所有日志以 [Worker] 前缀标识
console.log('[Worker] 开始处理数据，行数:', csvData.length);
```

#### 追踪筛选状态
```javascript
// 浏览器 Console 执行
Dashboard.filterState  // 查看当前筛选条件
```

#### 性能分析
```javascript
// data.worker.js 中已有日志节点
// 观察：CSV 解析完成 → 业务类型映射 → 全局 KPI 计算
```

---

## 🚢 部署与测试

### 本地开发

```bash
# 启动本地服务器（推荐）
python3 -m http.server 8000

# 访问应用
open http://localhost:8000
```

### 其他启动方式

```bash
# 使用 Node.js
npx http-server -p 8000

# 使用 PHP
php -S localhost:8000
```

### GitHub Pages 自动部署

```bash
git add .
git commit -m "✨ feat: 功能更新"
git push origin main

# GitHub Actions 会自动部署到：
# https://[username].github.io/autowrKPI
```

### 本地测试部署版本

```bash
# 模拟生产环境
python3 -m http.server 8000 --bind 127.0.0.1
```

---

## 📚 文档资源

- **功能特性索引**: `开发文档/KNOWLEDGE_INDEX.md`
- **下钻功能手册**: `开发文档/manuals/DRILL_DOWN_GUIDE.md`
- **技术决策记录**: `开发文档/decisions/`
- **板块设计文档**: `开发文档/板块文档/`
- **开发日志**: `开发文档/reports/DEVLOG.md`

---

## 🎯 开发最佳实践

### 代码审查关注点

- ✓ 检查 Worker 监听器是否正确移除
- ✓ 验证维度 key 是否匹配 `dimensionConfigMap`
- ✓ 确认 KPI 计算公式正确性
- ✓ 检查图表配色是否符合规范
- ✓ 验证筛选逻辑的 AND/OR 关系

### 性能优化

- Worker 已处理 16000+ 行无卡顿
- 如需更高性能，考虑：
  - 分页聚合
  - 虚拟滚动
  - 增量计算

### Git 工作流

```bash
# 1. 创建功能分支
git checkout -b feature/new-dimension

# 2. 开发完成后
git add .
git commit -m "✨ feat: 添加新维度筛选功能"

# 3. 推送到远程
git push origin feature/new-dimension

# 4. 创建 Pull Request
# 5. 代码审查通过后合并到 main
```

---

**最后更新**: 2025-12-21
**维护者**: autowrKPI Team
