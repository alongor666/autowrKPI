# 文档索引与结构

docs 作为顶级知识库，按主题分组：

## 需求与目标
- `requirements.md`：业务目标、用户场景、功能/非功能需求、验收标准。

## 数据与契约
- `data-contract.md`：CSV 字段清单、类型/缺省策略、外部配置（映射/计划/阈值）格式与示例行。

## 前端绑定与样式
- `ui-binding.md`：`DATA` JSON 字段 ↔ 模板 ID/Class 对照，交互依赖（tab/维度/子标签）。
- `ui-style.md`：颜色、字体、字号、圆角、阴影、布局、间距、响应式与默认顺序约束。

## 算法与规则
- `algorithms.md`：KPI 公式、时间进度、阈值/告警、排序与边界处理。

## 架构与流程
- `architecture.md`：分层（Loader/Mapper/KPI/Generator/模板）、端到端流程（清洗→映射→计算→聚合→注入）、可插拔点与扩展思路。

## 配置与运行
- `configuration.md`：命令行参数、配置文件格式、多地区/多年份切换、回退逻辑。
- `operations.md`：环境、运行命令、排障清单、静态发布（含 GitHub Pages）。

## 质量保障
- `testing.md`：测试矩阵、夹具建议、断言要点与性能检查。

## 推荐阅读顺序
1. `requirements.md` 理解目标与验收。
2. `data-contract.md` 准备数据/配置。
3. `ui-binding.md` 与 `ui-style.md` 确认模板约束与视觉。
4. `algorithms.md` 核实计算规则。
5. `architecture.md` 理解执行流程与可插拔点。
6. `configuration.md` + `operations.md` 运行/部署。
7. `testing.md` 设计并执行验证。
