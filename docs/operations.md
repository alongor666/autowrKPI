# 运维与交付

## 环境准备
- Python 3.10+；推荐虚拟环境：`python3 -m venv venv && source venv/bin/activate`
- 安装依赖：`pip install -r requirements.txt`（如缺失，根据项目需要补充）。

## 运行命令
- 默认示例：`python main.py`
- 自定义数据：
  ```bash
  python main.py \
    --csv data/你的数据.csv \
    --output output/经营分析周报.html \
    --template template/四川分公司车险第49周经营分析模板.html \
    --org 四川 --week 4 --year 2025
  ```
- 配置覆盖：如需指定映射/计划/阈值，追加 `--mapping ... --year-plans ... --thresholds ...`。

## 日志与排障
- 运行输出包含数据源与生成结果；异常会直接打印错误消息。
- 常见问题：
  - 缺列：确保 CSV 符合数据契约；检查字段名大小写。
  - 标题/日期未更新：确认 `--week/--year` 或 CSV `week_number`、文件名含年份；模板中保留 `<title>`、`<h1>`、“数据截止日期：” 文本。
  - 映射缺失：补充 `reference/business_type_mapping.json` 中的 `compatibility_mappings`。

## 产出物
- 报告 HTML：默认 `output/经营分析周报.html`，可通过 `--output` 调整。

## 发布建议
- 将 `docs/` 文档随代码发布；保持 `reference/` 配置与数据契约同步更新。
- 对模板的修改需确保 ID/class 不变，先本地验证再分发。
