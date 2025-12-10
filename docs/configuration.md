# 配置指南

## 命令行参数
- `--csv`：输入 CSV 路径（默认示例数据）。
- `--template`：HTML 模板路径。
- `--output`：输出 HTML。
- `--mapping`：业务类型映射 JSON。
- `--year-plans`：年度计划 JSON。
- `--thresholds`：阈值 JSON。
- `--week`：周次（可选，优先级高于 CSV）。
- `--year`：年份（可选，默认从文件名提取，失败回退 2025）。
- `--org`：机构名称（用于标题/头部显示）。

## 配置文件格式
- `business_type_mapping.json`：
  - `business_types`: [{`csv_raw_value`, `ui_full_name`, `ui_short_label`, `category`}]
  - `compatibility_mappings`: [{`csv_raw_value`, `maps_to`}]
- `year-plans.json`：
  - `{"年度保费计划": {"四川分公司": <number>, "乐山": <number>, ...}}`
- `thresholds.json`：
  - `四象限基准线`：{`保费达成率`,`变动成本率`,`满期赔付率`,`费用率`,`出险率`,`案均赔款`}
  - `问题机构识别阈值`：{`年保费未达标`,`变动成本率超标`,`满期赔付率超标`,`费用率超标`}

## 多地区/多年份切换
- 按地区/年份存放独立的映射、计划、阈值文件，例如 `reference/2025-sichuan-thresholds.json`，运行时通过参数指定。
- 模板可复制一份保持 ID/class 不变，仅修改文案/样式。

## 默认值与回退
- 周次：优先 `--week`，否则 CSV `week_number`，仍无则 49。
- 年份：优先 `--year`，否则文件名中的四位年份，仍无则 2025。
- 计划：若机构未命中计划，年计划达成率为 None。
