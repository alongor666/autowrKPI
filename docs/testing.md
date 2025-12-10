# 测试计划

## 测试框架
- 建议使用 `pytest`，测试数据放 `tests/fixtures/`，测试文件命名 `test_*.py`。

## 用例矩阵
- 正常路径：示例 CSV 生成报告，检查输出文件存在且包含 `const DATA =`。
- 周次/年份推断：未传 `--week/--year`，从 CSV/文件名推断成功。
- 缺计划数据：`premium_plan_yuan` 为 0；年计划达成率应为 None，不触发“未达标”告警。
- 映射缺失：业务类型未命中映射，`ui_short_label` 回退为原值，类别为“未知”。
- 阈值检测：构造超标数据，验证问题机构列表包含期望标签。
- 大数据：构造 5-10 万行，验证性能和无异常退出。

## 自动化命令示例
- 基础生成：`python main.py --csv data/sample.csv --output output/report.html`
- Pytest（示例）：`pytest -q`

## 断言要点
- 输出文件存在；标题包含机构名与周次；日期更新正确。
- `const DATA` JSON 中的关键字段（summary、dataByOrg 等）存在且数值合理。
- 当分母为 0 时比率为 0 或 None，不抛异常。
