# 🎯 功能特性文档层 (01_features/)

> **职责**: 记录所有功能模块的实施细节、技术方案、验证报告
> **更新时间**: 2026-01-02
> **维护规则**: 新增功能必须创建对应目录；功能废弃必须标记状态

---

## 📖 目录职责

本目录按功能模块组织，每个功能一个子目录（命名格式：`FXXX_功能名称`），包含README.md（功能说明）、meta.json（元数据）及相关验证报告。

---

## 🔑 功能清单（按ID排序）

| 功能ID | 功能名称 | 状态 | 目录 | 核心文件 | 关联决策 |
|--------|----------|------|------|---------|---------|
| **F001** | 多源数据摄入与解析 | ✅ implemented | [F001_csv_parsing](./F001_csv_parsing/) | `js/data.worker.js` | - |
| **F002** | 业务类型映射与转换 | ✅ implemented | [F002_business_mapping](./F002_business_mapping/) | `reference/business_type_mapping.json` | - |
| **F003** | KPI计算引擎 | ✅ implemented | [F003_kpi_calculation](./F003_kpi_calculation/) | `js/data.worker.js:244-309`, `reference/thresholds.json` | - |
| **F004** | 数据聚合与统计 | ✅ implemented | [F004_data_aggregation](./F004_data_aggregation/) | `js/data.worker.js:477-600` | [D002](../decisions/D002_JavaScript数据聚合逻辑对等实现.md) |
| **F005** | HTML报告生成器 | ⚠️ deprecated | [F005_report_generation](./F005_report_generation/) | - | 已由F006静态部署系统取代 |
| **F006** | 静态部署系统 | ✅ implemented | [F006_static_deployment](./F006_static_deployment/) | `index.html`, `js/static-report-generator.js` | [D001](../decisions/D001_ECharts-CDN加载优化.md) |
| **F007** | 智能元数据提取与分析模式识别 | ✅ fully_implemented | [F007_metadata_extraction](./F007_metadata_extraction/) | `js/data.worker.js:524-532`, `js/dashboard.js:1496-1507` | - |
| **F008** | 交互式数据可视化仪表盘 | ✅ implemented | [F008_dashboard_visualization](./F008_dashboard_visualization/) | `js/dashboard.js`, `css/dashboard.css` | [D003](../decisions/D003_图表优化与损失暴露分析.md) |
| **F009** | UI优化 - 麦肯锡式仪表盘体验提升 | 🚧 implementing | [F009_ui_optimization](./F009_ui_optimization/) | - | - |

---

## 📂 按状态分类

### ✅ 已实施（Implemented）
- **F001**: 多源数据摄入与解析
- **F002**: 业务类型映射与转换
- **F003**: KPI计算引擎
- **F004**: 数据聚合与统计
- **F006**: 静态部署系统
- **F007**: 智能元数据提取（fully_implemented）
- **F008**: 交互式数据可视化仪表盘

### 🚧 进行中（Implementing）
- **F009**: UI优化 - 麦肯锡式仪表盘体验提升

### ⚠️ 已废弃（Deprecated）
- **F005**: HTML报告生成器
  - 废弃原因：已由F006静态部署系统取代
  - 废弃时间：2025-12
  - 迁移路径：使用F006的SPA架构

---

## 🏷️ 按标签分类

### 数据处理类
- **F001**: CSV解析、Excel解析、JSON解析
- **F002**: 数据映射、业务逻辑
- **F004**: 数据聚合、统计分析

### 计算与分析类
- **F003**: KPI计算、业务指标、算法
- **F007**: 元数据提取、智能识别、字段映射

### 可视化类
- **F008**: ECharts、交互设计、图表样式规范
- **F009**: UI优化、UX设计

### 部署与架构类
- **F006**: 静态部署、GitHub Pages、SPA
- **F001**: WebWorker、性能优化

---

## 📖 功能目录结构规范

每个功能目录必须包含以下文件：

```
FXXX_功能名称/
├── README.md          # 功能说明（必须）
├── meta.json          # 元数据（必须，供自动化工具使用）
├── VERIFICATION_*.md  # 验证报告（可选）
└── FIX_*.md          # 修复记录（可选）
```

### README.md 必须包含的章节

1. **功能概述**：1-2段简短描述
2. **核心能力**：列表说明主要功能点
3. **关键代码位置**：文件路径与行号范围
4. **关联文档**：链接到板块文档、决策记录等
5. **使用示例**：（如适用）代码示例或操作步骤
6. **变更历史**：重大更新记录

### meta.json 必须包含的字段

```json
{
  "id": "F001",
  "name": "功能名称",
  "status": "implemented",
  "tags": ["标签1", "标签2"],
  "core_files": ["文件路径1", "文件路径2"],
  "related_docs": ["文档路径1"],
  "last_updated": "2025-12-22"
}
```

---

## 🔗 与其他层的关联

### 代码关联（/js, /reference）
- 每个功能必须关联至少一个核心代码文件
- 路径映射参见 [CODE_INDEX.md](../00_index/CODE_INDEX.md)

### 板块文档关联（/开发文档/板块文档）
- **F003** ↔ [01_指标体系.md](../板块文档/01_指标体系.md)
- **F008** ↔ [02_经营概览板块.md](../板块文档/02_经营概览板块.md), [07_筛选器系统.md](../板块文档/07_筛选器系统.md)

### 决策记录关联（/开发文档/decisions）
- **F004** ↔ [D002](../decisions/D002_JavaScript数据聚合逻辑对等实现.md)
- **F006** ↔ [D001](../decisions/D001_ECharts-CDN加载优化.md)
- **F008** ↔ [D003](../decisions/D003_图表优化与损失暴露分析.md)

---

## 🔄 变更协议

### 必须更新索引的场景

1. **新增功能**
   - 创建 `FXXX_功能名称/` 目录（X为下一个可用编号）
   - 创建 `README.md` 和 `meta.json`
   - 在本INDEX.md的"功能清单"表格中新增一行
   - 更新 [DOC_INDEX.md](../00_index/DOC_INDEX.md)
   - 运行 `npm run update-docs` 自动更新KNOWLEDGE_INDEX.md

2. **功能状态变更**
   - 更新功能目录的 `meta.json` 中的 `status` 字段
   - 更新本INDEX.md的"功能清单"表格
   - 如状态为 `deprecated`，必须说明废弃原因与迁移路径
   - 运行 `npm run update-docs`

3. **功能重构**
   - 更新 `README.md` 的"关键代码位置"
   - 更新 `meta.json` 的 `core_files` 字段
   - 同步更新 [CODE_INDEX.md](../00_index/CODE_INDEX.md)

4. **关联变更**
   - 新增关联决策：更新本INDEX.md的"关联决策"列
   - 新增关联板块：更新"与其他层的关联"章节

---

## 📌 维护注意事项

- **ID连续性**：功能ID必须连续递增，不得跳号（废弃功能保留ID）
- **禁止孤儿功能**：每个功能目录必须在本索引中登记
- **强制元数据**：所有功能目录必须包含 `meta.json`
- **自动化优先**：修改 `meta.json` 后必须运行 `npm run update-docs` 同步KNOWLEDGE_INDEX.md

---

**全局功能索引**: [KNOWLEDGE_INDEX.md](../KNOWLEDGE_INDEX.md)（自动生成）
**全局文档索引**: [DOC_INDEX.md](../00_index/DOC_INDEX.md)
**最后更新**: 2026-01-02
**维护者**: autowrKPI Governance Team
