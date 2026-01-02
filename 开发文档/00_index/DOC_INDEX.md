# 📚 文档索引 (DOC_INDEX)

> **唯一入口**: 所有开发文档的导航枢纽
> **更新时间**: 2026-01-02
> **维护规则**: 任何新增文档必须在此登记；删除文档必须同步移除

---

## 🎯 快速导航

| 类别 | 入口 | 用途 |
|------|------|------|
| **协作协议** | [CLAUDE.md](../../CLAUDE.md) | AI开发助手指南 |
| **协作协议** | [AGENT.md](../../AGENT.md) | Agent工作上下文入口 |
| **需求管理** | [BACKLOG.md](../../BACKLOG.md) | 需求与任务待办清单 |
| **进展追踪** | [PROGRESS.md](../../PROGRESS.md) | 里程碑与阻塞记录 |
| **代码地图** | [CODE_INDEX.md](./CODE_INDEX.md) | 代码文件导航 |
| **进展地图** | [PROGRESS_INDEX.md](./PROGRESS_INDEX.md) | 工作流与状态追踪 |

---

## 📖 文档体系结构

### 1️⃣ 唯一事实来源（最高权威）

| 文档路径 | 内容 | 变更规则 |
|---------|------|---------|
| `/reference/business_type_mapping.json` | 业务类型映射规则 | 禁止擅自修改；需决策记录 |
| `/reference/thresholds.json` | KPI阈值配置 | 禁止擅自修改；需决策记录 |
| `/reference/year-plans.json` | 年度保费计划 | 禁止擅自修改；需决策记录 |
| `/开发文档/板块文档/01_指标体系.md` | 指标口径定义 | 禁止擅自修改；需决策记录 |

**变更流程**: 修改前必须先在 `/开发文档/decisions/` 创建决策记录（ADR），说明原因、影响、替代方案。

---

### 2️⃣ 功能特性文档

**入口**: `/开发文档/01_features/`

| 功能ID | 功能名称 | README | 状态 |
|--------|----------|--------|------|
| F001 | 多源数据摄入与解析 | [README](../01_features/F001_csv_parsing/README.md) | ✅ implemented |
| F002 | 业务类型映射与转换 | [README](../01_features/F002_business_mapping/README.md) | ✅ implemented |
| F003 | KPI计算引擎 | [README](../01_features/F003_kpi_calculation/README.md) | ✅ implemented |
| F004 | 数据聚合与统计 | [README](../01_features/F004_data_aggregation/README.md) | ✅ implemented |
| F005 | HTML报告生成器（已弃用） | [README](../01_features/F005_report_generation/README.md) | ⚠️ deprecated |
| F006 | 静态部署系统 | [README](../01_features/F006_static_deployment/README.md) | ✅ implemented |
| F007 | 智能元数据提取 | [README](../01_features/F007_metadata_extraction/README.md) | ✅ fully_implemented |
| F008 | 交互式数据可视化仪表盘 | [README](../01_features/F008_dashboard_visualization/README.md) | ✅ implemented |
| F009 | UI优化 - 麦肯锡式仪表盘 | [README](../01_features/F009_ui_optimization/README.md) | 🚧 implementing |

**完整索引**: 参见自动生成的 [KNOWLEDGE_INDEX.md](../KNOWLEDGE_INDEX.md)

---

### 3️⃣ 板块设计文档

**入口**: `/开发文档/板块文档/`

| 板块 | 文档路径 | 核心内容 |
|------|---------|---------|
| 指标体系 | [01_指标体系.md](../板块文档/01_指标体系.md) | KPI定义、计算公式、阈值规则 |
| UI设计 | [00_UI设计.md](../板块文档/00_UI设计.md) | 设计规范、配色方案 |
| 经营概览 | [02_经营概览板块.md](../板块文档/02_经营概览板块.md) | 总览仪表盘设计 |
| 保费进度 | [03_保费进度板块.md](../板块文档/03_保费进度板块.md) | 保费分析设计 |
| 变动成本 | [04_变动成本板块.md](../板块文档/04_变动成本板块.md) | 成本分析设计 |
| 损失暴露 | [05_损失暴露板块.md](../板块文档/05_损失暴露板块.md) | 损失分析设计 |
| 费用支出 | [06_费用支出板块.md](../板块文档/06_费用支出板块.md) | 费用分析设计 |
| 筛选器系统 | [07_筛选器系统.md](../板块文档/07_筛选器系统.md) | 下钻筛选设计 |

**完整索引**: [板块文档/INDEX.md](../板块文档/INDEX.md)

---

### 4️⃣ 技术决策记录（ADR）

**入口**: `/开发文档/decisions/`

| 决策ID | 标题 | 日期 | 状态 |
|--------|------|------|------|
| D001 | [ECharts-CDN加载优化](../decisions/D001_ECharts-CDN加载优化.md) | 2025-12 | ✅ accepted |
| D002 | [JavaScript数据聚合逻辑对等实现](../decisions/D002_JavaScript数据聚合逻辑对等实现.md) | 2025-12 | ✅ accepted |
| D003 | [图表优化与损失暴露分析](../decisions/D003_图表优化与损失暴露分析.md) | 2025-12 | ✅ accepted |

**完整索引**: [decisions/INDEX.md](../decisions/INDEX.md)

---

### 5️⃣ 用户手册

**入口**: `/开发文档/manuals/`

| 手册名称 | 文档路径 | 目标用户 |
|---------|---------|---------|
| 下钻功能指南 | [DRILL_DOWN_GUIDE.md](../manuals/DRILL_DOWN_GUIDE.md) | 终端用户 |
| 新能源车分析指南 | [USER_GUIDE_NEW_ENERGY.md](../manuals/USER_GUIDE_NEW_ENERGY.md) | 终端用户 |

---

### 6️⃣ 开发报告

**入口**: `/开发文档/reports/`

| 报告类型 | 文档路径 | 用途 |
|---------|---------|------|
| 开发日志 | [DEVLOG.md](../reports/DEVLOG.md) | 按时间顺序记录开发过程 |
| 实施报告 | [IMPLEMENTATION_20251218.md](../reports/IMPLEMENTATION_20251218.md) | 重大功能实施记录 |
| 修复报告 | [FIX_20251219_FILTER_BUG.md](../reports/FIX_20251219_FILTER_BUG.md) | Bug修复记录 |
| 优化总结 | [OPTIMIZATION_SUMMARY.md](../reports/OPTIMIZATION_SUMMARY.md) | 性能优化总结 |

---

### 7️⃣ 规范与约定

| 规范类型 | 文档路径 | 内容 |
|---------|---------|------|
| 全局设计规范 | [全局设计规范.md](../全局设计规范.md) | UI/UX设计规范 |
| 开发约定 | [00_conventions.md](../00_conventions.md) | 代码风格、命名约定 |
| 提交检查清单 | [00_push_checklist.md](../00_push_checklist.md) | Git提交前检查 |

---

## 🔄 文档更新协议

### 必须更新索引的场景
1. **新增文档**：在对应分类下登记路径与摘要
2. **删除文档**：从索引中移除（归档文档移至 `/开发文档/archive/`）
3. **重命名文档**：更新所有相关索引的路径
4. **文档状态变更**：更新状态标记（✅ ⚠️ 🚧 ❌）

### 变更流程
1. 修改文档
2. 更新本索引（DOC_INDEX.md）
3. 如涉及代码，同步更新 [CODE_INDEX.md](./CODE_INDEX.md)
4. 如涉及进展，同步更新 [PROGRESS.md](../../PROGRESS.md)

---

## 📌 维护注意事项

- **禁止重复记录**：每个文档只在一个分类下登记，通过链接互联
- **保持简洁**：索引只记录"入口"，不复制内容
- **强制互链**：所有子索引必须链回本文档
- **状态同步**：功能状态必须与 KNOWLEDGE_INDEX.md 一致

---

**最后更新**: 2026-01-02
**维护者**: autowrKPI Governance Team
