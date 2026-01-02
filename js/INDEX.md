# 💻 前端核心代码层 (js/)

> **职责**: 业务逻辑、数据处理、UI交互的核心实现
> **更新时间**: 2026-01-02
> **变更规则**: 修改核心逻辑必须同步更新关联的功能文档

---

## 📖 目录职责

本目录包含车险经营分析可视化系统的所有前端JavaScript代码，采用 **Web Worker架构** 实现主线程与数据处理的分离，确保大数据量（16000+行）下的流畅交互。

---

## 🔑 关键入口文件

| 文件 | 行数 | 职责 | 关键函数/类 | 关联功能 |
|------|------|------|------------|---------|
| **dashboard.js** | ~2000 | UI交互逻辑、仪表盘渲染 | `Dashboard`类、`renderKPI()`、`renderChart()`、`applyFilters()` | [F008](../开发文档/01_features/F008_dashboard_visualization/README.md) |
| **data.worker.js** | ~1000 | Web Worker数据处理引擎 | `processData()`、`calculateKPIsForGroup()`、`aggregateByDimension()` | [F003](../开发文档/01_features/F003_kpi_calculation/README.md), [F004](../开发文档/01_features/F004_data_aggregation/README.md) |
| **static-report-generator.js** | ~200 | Worker管理器、通信协调 | `StaticReportGenerator`类、`loadData()` | [F006](../开发文档/01_features/F006_static_deployment/README.md) |

---

## 📂 模块分解

### 1️⃣ dashboard.js（UI交互层）

**核心能力**:
- KPI卡片渲染与动态更新
- ECharts图表配置与渲染
- 电商式下拉筛选器（批量选择→一次应用）
- 时间筛选器（年度、周次范围）
- Worker通信管理（一次性监听器模式）

**关键代码段**:
| 行号范围 | 功能 | 关联文档 |
|---------|------|---------|
| 19-31 | 筛选状态管理（filterState） | [板块文档/07_筛选器系统.md](../开发文档/板块文档/07_筛选器系统.md) |
| 82-200 | KPI卡片渲染逻辑 | [板块文档/02_经营概览板块.md](../开发文档/板块文档/02_经营概览板块.md) |
| 404-616 | ECharts图表渲染（含预警线、双Y轴） | [D003](../开发文档/decisions/D003_图表优化与损失暴露分析.md) |
| 675-686 | Worker一次性监听器模式（防内存泄漏） | [CLAUDE.md](../CLAUDE.md#83-99) |
| 1496-1507 | 下钻维度配置（getDrillDownDimensions） | [F007](../开发文档/01_features/F007_metadata_extraction/README.md) |
| 1978-1987 | 维度颜色映射（dimensionClassMap） | [板块文档/00_UI设计.md](../开发文档/板块文档/00_UI设计.md) |

**⚠️ 关键注意**:
- 禁止在主线程进行大数据处理，必须通过Worker
- Worker监听器必须使用一次性模式并正确移除
- 图表X轴标签必须倾斜45度，字体10px，超长截断

---

### 2️⃣ data.worker.js（数据处理引擎）

**核心能力**:
- CSV/Excel解析（Papa Parse库）
- 业务类型映射（基于 `/reference/business_type_mapping.json`）
- KPI计算（满期赔付率、费用率、变动成本率等）
- 多维度数据聚合
- 筛选条件应用与重算

**关键代码段**:
| 行号范围 | 功能 | 关联文档 |
|---------|------|---------|
| 1-100 | CSV解析与数据加载 | [F001](../开发文档/01_features/F001_csv_parsing/README.md) |
| 150-250 | 业务类型映射（mapBusinessTypes） | [F002](../开发文档/01_features/F002_business_mapping/README.md) |
| 244-309 | KPI计算引擎（calculateKPIsForGroup） | [板块文档/01_指标体系.md](../开发文档/板块文档/01_指标体系.md) |
| 477-600 | 多维度聚合（aggregateByDimension） | [F004](../开发文档/01_features/F004_data_aggregation/README.md) |
| 524-532 | 维度字段映射配置（dimensionConfigMap） | [F007](../开发文档/01_features/F007_metadata_extraction/README.md) |

**⚠️ 关键注意**:
- 禁止直接修改 `rawCSVData`，必须使用映射函数
- 添加新维度必须同步更新 `dimensionConfigMap`
- KPI计算公式必须与 `/reference/thresholds.json` 和指标体系文档一致

---

### 3️⃣ static-report-generator.js（Worker管理器）

**核心能力**:
- Worker生命周期管理
- 主线程与Worker通信协调
- 数据加载流程编排

**关键代码段**:
| 行号范围 | 功能 | 关联文档 |
|---------|------|---------|
| 全文 | Worker管理与数据加载 | [F006](../开发文档/01_features/F006_static_deployment/README.md) |

---

## 🔗 与其他层的关联

### 配置依赖（/reference）
- **business_type_mapping.json**: 业务类型映射规则
- **thresholds.json**: KPI阈值配置（告警边界）
- **year-plans.json**: 年度保费计划数据

### 样式依赖（/css）
- **dashboard.css**: 主题色、KPI卡片样式、图表容器布局

### 页面依赖（/）
- **index.html**: DOM容器、CDN引入、事件绑定

---

## 🔄 变更协议

### 必须更新索引的场景
1. **新增函数/类**：更新本INDEX.md的"关键代码段"表格
2. **修改关键函数签名**：更新本INDEX.md并同步关联功能文档
3. **重构代码结构**：更新行号范围映射
4. **修改KPI计算逻辑**：必须先创建ADR（`/开发文档/decisions/`）

### 变更流程
1. 修改代码
2. 更新本INDEX.md
3. 更新 [CODE_INDEX.md](../开发文档/00_index/CODE_INDEX.md)
4. 同步更新关联的功能文档（`/开发文档/01_features/`）
5. 如涉及口径变更，创建ADR并更新 `/reference/`

---

## 📌 维护注意事项

- **行数同步**：重大重构后需更新行号范围
- **禁止硬编码**：阈值、映射、配置必须从 `/reference/` 加载
- **强制互链**：本文档必须链回 [CODE_INDEX.md](../开发文档/00_index/CODE_INDEX.md)
- **代码审查清单**：参见 [CLAUDE.md](../CLAUDE.md#439-447)

---

**全局代码索引**: [CODE_INDEX.md](../开发文档/00_index/CODE_INDEX.md)
**最后更新**: 2026-01-02
**维护者**: autowrKPI Governance Team
