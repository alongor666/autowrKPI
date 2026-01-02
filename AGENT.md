# AGENT.md（autowrKPI：Agent 工作上下文入口）

> **更新时间**: 2026-01-02
> **用途**: 定义Agent的可读入口、必须回写位置、禁止触碰区域

---

## 🚨 治理规范（必读优先级最高）

### 可读入口（按优先级排序）

**Tier 1 - 必经入口（接到任务必须先查看）**:
1. [📚 DOC_INDEX.md](./开发文档/00_index/DOC_INDEX.md) - 所有文档导航枢纽
2. [💻 CODE_INDEX.md](./开发文档/00_index/CODE_INDEX.md) - 所有代码地图
3. [📈 PROGRESS_INDEX.md](./开发文档/00_index/PROGRESS_INDEX.md) - 进展追踪与状态机
4. [📋 BACKLOG.md](./BACKLOG.md) - 需求待办清单（唯一任务来源）
5. [📈 PROGRESS.md](./PROGRESS.md) - 里程碑与阻塞记录

**Tier 2 - 核心层索引（定位具体代码/配置）**:
- [/js/INDEX.md](./js/INDEX.md) - 前端核心代码层
- [/reference/INDEX.md](./reference/INDEX.md) - 配置与规则层（唯一事实来源）
- [/开发文档/01_features/INDEX.md](./开发文档/01_features/INDEX.md) - 功能特性文档
- [/开发文档/板块文档/INDEX.md](./开发文档/板块文档/INDEX.md) - 板块设计文档
- [/开发文档/decisions/INDEX.md](./开发文档/decisions/INDEX.md) - 技术决策记录

**Tier 3 - 细节文档（深入了解具体实现）**:
- 见各索引指向的README、板块文档、ADR等

### 必须回写位置（任务完成后必须更新）

**任何任务开始前**:
- 在 `BACKLOG.md` 登记需求，状态设为 `PROPOSED` → `TRIAGED` → `IN_PROGRESS`

**任务完成后**:
1. **更新BACKLOG**: 填写关联文档、关联代码、验收/证据，状态改为 `DONE`
2. **更新PROGRESS**: 在 `PROGRESS.md` 记录里程碑与下一步接力
3. **更新对应索引**:
   - 修改代码 → 更新 `CODE_INDEX.md` + 核心层 `INDEX.md`（如 `js/INDEX.md`）
   - 新增功能 → 更新 `开发文档/01_features/INDEX.md` + `DOC_INDEX.md`
   - 修改配置 → 创建ADR（`/开发文档/decisions/DXXX.md`）+ 更新 `reference/INDEX.md`
   - 新增板块 → 更新 `开发文档/板块文档/INDEX.md` + `DOC_INDEX.md`
4. **运行校验**: `node scripts/check-governance.mjs` 确保治理一致性

### 禁止触碰区域（必须遵守）

**🔒 唯一事实来源（禁止擅自修改，必须先创建ADR）**:
- `/reference/business_type_mapping.json` - 业务类型映射
- `/reference/thresholds.json` - KPI阈值配置
- `/reference/year-plans.json` - 年度保费计划
- `/开发文档/板块文档/01_指标体系.md` - 指标口径定义

**🚫 禁止操作**:
- 禁止在代码中硬编码阈值、映射、配置（必须从 `/reference/` 加载）
- 禁止跳过索引更新（修改代码必须同步更新 `CODE_INDEX.md`）
- 禁止在BACKLOG中标记DONE而不填写证据（会被校验脚本拦截）
- 禁止删除历史记录（PROGRESS.md的里程碑不可删除，只能追加）
- 禁止直接修改 `/src` 下业务实现（本项目无 `/src`，核心代码在 `/js`）

**⚠️ 灰色地带（需谨慎操作）**:
- 修改 `/js/` 核心代码：必须更新关联功能文档（`/开发文档/01_features/`）
- 添加新维度：必须同时更新 `dimensionConfigMap`（`js/data.worker.js:524-532`）+ 维度配置（`js/dashboard.js:1496-1507`）+ 维度颜色（`css/dashboard.css:1172-1179`）

---

## 1. 项目一句话
本仓库是"纯前端车险经营分析可视化系统"：导入 CSV/Excel 数据，做多维聚合并用 ECharts（可视化图表库）展示，支持下钻筛选，离线运行。

## 2. 目录结构地图（从哪里找代码/规则/文档）
- 入口与页面
  - /index.html：单页应用入口与页面骨架
- 样式层（只管展示）
  - /css/dashboard.css：核心样式
- 核心代码层（最重要）
  - /js/static-report-generator.js：数据处理核心引擎（聚合、指标计算等）
  - /js/dashboard.js：仪表盘交互逻辑（筛选器联动、图表刷新）
  - /js/data.worker.js：Web Worker（后台数据聚合）
- 业务规则与唯一事实来源（最高权威）
  - /reference/business_type_mapping.json：业务类型映射
  - /reference/thresholds.json：KPI 阈值配置（告警/目标依据）
  - /reference/year-plans.json：年度计划数据（对标基准）
- 工具与辅助
  - /tools：辅助脚本与工具（不得成为业务口径来源）
  - /skill-quality-validator：独立质量校验子工程（不得反向污染主应用）
- 文档与治理（“为什么这样做”的依据）
  - /开发文档/manuals：用户手册（怎么用）
  - /开发文档/requirements：需求定义（做什么）
  - /开发文档/01_features：功能说明（怎么实现）
  - /开发文档/decisions：决策记录（口径/阈值/架构变更的理由与取舍）
  - /开发文档/reports：开发与修复日志（问题→原因→改动→验证）
- 人类协作入口（如需）
  - /README.md：快速开始与结构概览
  - /CLAUDE.md：既有协作规则（如存在且相关，需遵循）

## 3. 权威层级（冲突时谁说了算）
1) /reference/*（阈值、映射、计划：最高权威）
2) /开发文档/decisions/*（明确决策记录）
3) /开发文档/requirements/*（需求定义）
4) 现有实现（/js/* 与 /index.html）
说明：禁止用“代码里现在就是这样”去否定 reference 与 decisions。

## 4. 硬约束（Non-negotiables）
- 不得擅自修改 KPI 口径/阈值/命名/单位；涉及变更必须先引用 reference/ 或 decisions/ 的依据。
- 禁止在 /js/ 中散落硬编码阈值与映射；必须集中在 /reference/。
- 不得新增依赖；如确需新增，先给出必要性、替代方案、影响面、回滚方案，并征求确认。
- 不得新增文档；除非出现“新增大板块无法放入现有体系”，并说明原因与落点。

## 5. Agent 标准工作路径（接到任务如何开展）
1) 读需求：优先查 /开发文档/requirements 与 /开发文档/decisions（是否已有约束）
2) 找事实：阈值/映射/计划 → /reference；计算 → static-report-generator.js；联动 → dashboard.js
3) 最小改动：不重构大模块、不复制规则、不扩散影响面
4) 验证闭环：导入数据→切换维度→KPI 与图表同步→（若涉及阈值）验证触发/不触发
5) 回写上下文：规则/口径变化→decisions；Bug 修复→reports（保持文档与代码一致）

## 6. 每次交付必须输出（便于你审阅）
- 做了什么 / 没做什么
- 修改文件清单（新增/修改/删除）
- 验证步骤（可复现）与通过标准
- 风险点与回滚方式