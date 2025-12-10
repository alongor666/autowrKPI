# UI 绑定说明

## 模板路径
- 终极模板：`template/四川分公司车险第49周经营分析模板.html`
- 数据插入点：`const DATA = {...};`（JS 中被替换）。

## 标题与日期
- `<title>` 与 `<h1>`：
  - **分公司模式**：`{机构}分公司车险第{week}周经营分析`
  - **单机构模式**：`{机构}车险第{week}周经营分析`
- 日期文本：`数据截止日期：YYYY年MM月DD日`（周六自动推算或外部指定）。

## 维度与标签页
- 顶部标签：`data-tab` = overview/premium/cost/loss/expense，对应容器 `#tab-*`。
- 维度按钮：org→`机构`，category→`客户类别`，businessType→`业务类型简称`。
- 子标签（损失暴露）：bubble/quadrant。

## 指标卡片 (overview/kpi)
- 切换按钮：默认显示“关键数据”（原“分公司KPI”）。
- 保费时间进度达成率 → `#metric-progress`
- 变动成本率 → `#metric-cost-rate`
- 满期赔付率 → `#metric-claim-rate`
- 费用率 → `#metric-expense-rate`
- 签单保费 → `#metric-premium`
- 边际贡献额 → `#metric-margin`
- 已报告赔款 → `#metric-claim`
- 费用金额 → `#metric-expense`
- 告警标题 → `#kpi-alert-title`（根据单/多机构模式动态适配文案）。

## 图表容器
- 概览：`#chart-overview`，标题 `#title-overview`，正文 `#body-overview`。
- 保费进度：`#chart-premium`，标题/正文 `#title-premium` / `#body-premium`。
  - **单机构模式**：标题展示0保费项目，正文Top3，图表仅展示>0项目。
  - **分公司模式**：标题展示达成率<90%，正文展示90-100%及>100%，图表展示达成率。
- 变动成本：`#chart-cost`，标题/正文 `#title-cost` / `#body-cost`。
- 损失暴露：`#chart-loss`，标题/正文 `#title-loss` / `#body-loss`。
- 费用支出：`#chart-expense`，标题/正文 `#title-expense` / `#body-expense`。

## 数据字段映射（核心）
- 模式字段：`DATA.isSingleOrgMode` (bool) 控制标题/逻辑分支。
- 维度字段：org→`DATA.dataByOrg[*].机构`；category→`DATA.dataByCategory[*].客户类别`；businessType→`DATA.dataByBusinessType[*].业务类型简称`。
- 指标字段：`签单保费`、`满期保费`、`已报告赔款`、`费用额`、`保单件数`、`赔案件数`、`满期赔付率`、`费用率`、`变动成本率`、`出险率`、`案均赔款`、`保费占比`、`已报告赔款占比`、`年计划达成率`。
- 阈值：`DATA.thresholds.四象限基准线`、`DATA.thresholds.问题机构识别阈值`。

## 交互依赖
- 标签切换：`.tab` 点击根据 `data-tab` 显示对应 `#tab-*` 并调用 `renderChart(tab)`。
- 维度切换：`.dimension-btn` 调用 `switchDimension(tab, dimension)` → 重渲染。
- 子标签：`.sub-tab`（损失暴露）调用 `switchSubTab('loss', view)`。
- 导入数据：`.float-btn` 点击跳转 `/upload` 页面。

## 保持不变的约束
- DOM ID/Class 与字段名需保持，以确保脚本和样式正常；新增元素请避免与现有 ID 冲突。
