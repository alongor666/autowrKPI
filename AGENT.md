# AGENTS.md（autowrKPI：Agent 工作上下文入口）

## 1. 项目一句话
本仓库是“纯前端车险经营分析可视化系统”：导入 CSV/Excel 数据，做多维聚合并用 ECharts（可视化图表库）展示，支持下钻筛选，离线运行。

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