# 开发指南（结构化）

## 项目总览
- 目标：读取任意周次的车险变动成本数据，生成符合终极模板的经营分析周报 HTML。
- 核心组件：数据加载 `src/data_loader.py`、字段映射 `src/mapper.py`、KPI 计算 `src/kpi_calculator.py`、报告生成 `src/report_generator.py`、入口脚本 `main.py`。
- 关键模板：`template/四川分公司车险第49周经营分析模板.html`，输出默认至 `output/经营分析周报.html`。

## 目录结构与职责
- `data/`：输入 CSV（字段见下），可放入多周数据，如 `2025保单第4周变动成本明细表.csv`。
- `template/`：终极展示模板（含 ECharts 与 UI ID）。
- `reference/`：业务类型映射、年度计划、阈值配置。
- `src/`：业务逻辑。`tests/`（可建）存放 pytest 用例。
- `output/`：生成的报告 HTML。

## 数据契约（CSV 必备列）
- 组织/分类：`third_level_organization`、`business_type_category`、`customer_category_3`。
- 金额/计数：`signed_premium_yuan`、`matured_premium_yuan`、`policy_count`、`claim_case_count`、`reported_claim_payment_yuan`、`expense_amount_yuan`。
- 计划/时间：`premium_plan_yuan`、`week_number`。

## 处理流程
1) 入口：`main.py` 解析命令行参数（数据/模板/输出/映射/计划/阈值/周次/年份/机构）。
2) 加载：`DataLoader` 校验必备列并数值化缺失值为 0。
3) 映射：`Mapper` 将 `business_type_category` 标准化为 `ui_short_label`、`ui_category`，兼容老值。
4) 计算：`KPICalculator` 按周次推算时间进度，输出签单保费、满期赔付率、费用率、变动成本率、出险率、案均赔款、年计划达成率等。
5) 聚合：`ReportGenerator._process_dimension` 分维度（机构/客户类别/业务类型）计算并补充保费占比、赔款占比。
6) 问题识别：基于阈值（`reference/thresholds.json`）输出问题机构列表。
7) 模板注入：用正则替换模板中的 `const DATA = {...};`、标题、日期行（按年份+周次推算周六日期）。

## 运行与参数示例
- 默认示例：`python main.py`
- 指定第4周数据：
  ```bash
  python main.py \
    --csv data/2025保单第4周变动成本明细表.csv \
    --week 4 --year 2025 --org 四川 \
    --template template/四川分公司车险第49周经营分析模板.html \
    --output output/经营分析周报.html
  ```
- 若不传 `--week`/`--year`，周次取 CSV 的 `week_number`，年份从文件名中的四位数字推断（默认 2025）。

## 扩展与优化建议
- **测试**：为 `ReportGenerator`、`KPICalculator` 添加 `pytest` 用例（构造小型 CSV fixture），验证不同周次、缺计划数据、映射缺失的回退逻辑。
- **配置**：将阈值、年度计划与映射按年份/省份分文件存放，通过命令行或环境变量切换。
- **校验**：增加数据质量校验（必填字段非空、金额/件数非负）并输出告警。
- **性能**：对大文件使用 `chunksize` 流式读取或预聚合；必要时引入并行分组。
- **可视化复用**：保持模板 ID/class 不变，可复制模板并替换标题/色彩实现多地区共用。

## 故障排查
- “CSV 缺失列”→ 检查数据是否包含“数据契约”中的必备字段。
- “报告标题/日期未更新”→ 确认 `--week`/`--year` 是否传入或文件名中包含年份；检查模板是否保留原有 `<title>`、`<h1>`、“数据截止日期：”文本。
- “映射异常”→ 核对 `reference/business_type_mapping.json` 是否含对应 `csv_raw_value`，或补充 `compatibility_mappings`。
