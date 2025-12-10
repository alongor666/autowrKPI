# 数据契约

## CSV 必备列
- `third_level_organization` (str)：三级机构名称。
- `business_type_category` (str)：业务类型原始分类（用于映射）。
- `customer_category_3` (str)：客户类别。
- `signed_premium_yuan` (num)：签单保费（元）。
- `matured_premium_yuan` (num)：满期保费（元）。
- `policy_count` (int)：保单件数。
- `claim_case_count` (int)：赔案件数。
- `reported_claim_payment_yuan` (num)：已报告赔款（元）。
- `expense_amount_yuan` (num)：费用额（元）。
- `premium_plan_yuan` (num)：年度计划保费（元，可为 0）。
- `week_number` (int)：周次。

## 数据要求与缺省策略
- 数值列为空或异常字符时转为 0；分母为 0 时比率返回 0/None（按指标定义）。
- 周次未在参数中指定时从 `week_number` 推断；年份可从文件名中的四位年份提取，缺省 2025。
- 机构/类别/业务类型需非空以便分组；为空的行可预清洗或聚合到 "未知"（若映射未命中）。

## 外部配置
- 业务类型映射：`reference/business_type_mapping.json`（`business_types` + `compatibility_mappings`），输出 `ui_short_label`、`category`。
- 年度计划：`reference/year-plans.json`，键为机构名（含省分公司）对应年度目标。
- 阈值：`reference/thresholds.json`，含 `四象限基准线`、`问题机构识别阈值`。

## 示例行（简化）
```
third_level_organization,business_type_category,customer_category_3,signed_premium_yuan,matured_premium_yuan,policy_count,claim_case_count,reported_claim_payment_yuan,expense_amount_yuan,premium_plan_yuan,week_number
天府,非营客-旧,非营业个人客车,1000000,500000,300,30,350000,180000,1200000,4
```

## 输出 JSON 结构 (Data Injection)
注入到 HTML 模板中的 `DATA` 对象结构：
```json
{
  "summary": {
    "签单保费": 12345.67,
    "满期赔付率": 70.5,
    "费用率": 15.2,
    "变动成本率": 85.7,
    "已报告赔款": 8000.0
  },
  "problems": ["机构A(成本超标)", "机构B(保费未达标)"],
  "dataByOrg": [ ... ],
  "dataByCategory": [ ... ],
  "dataByBusinessType": [ ... ],
  "thresholds": { ... },
  "week": 49,
  "organization": "四川",
  "isSingleOrgMode": true  // 指示是否为单机构模式
}
```
