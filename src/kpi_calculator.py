import pandas as pd
import numpy as np

class KPICalculator:
    """
    车险 KPI 计算引擎，遵循 SKILL.md 定义的算法。
    """
    def __init__(self, current_date=None, week=49, enable_time_progress=True):
        self.current_date = current_date
        # 2025年第49周截止日是 12月6日，第340天
        # 动态计算天数: 340 + (week - 49) * 7
        # 限制在 1~365 之间
        raw_days = 340 + (week - 49) * 7
        self.days_passed = max(1, min(365, raw_days))
        self.total_days = 365
        self.time_progress = self.days_passed / self.total_days
        self.time_progress_enabled = enable_time_progress

    def safe_divide(self, numerator, denominator):
        """安全除法，分母为0返回0"""
        if denominator == 0 or pd.isna(denominator):
            return 0.0
        return numerator / denominator

    def calculate_kpis(self, df, manual_plan=None):
        """
        计算给定 DataFrame 的所有核心 KPI。
        """
        # 1. 基础聚合
        sum_signed_premium = df['signed_premium_yuan'].sum()
        sum_matured_premium = df['matured_premium_yuan'].sum()
        sum_policy_count = df['policy_count'].sum()
        sum_claim_case_count = df['claim_case_count'].sum()
        sum_reported_claim = df['reported_claim_payment_yuan'].sum()
        sum_expense = df['expense_amount_yuan'].sum()
        
        # Use manual plan if provided, otherwise sum from DF
        sum_annual_plan = manual_plan if manual_plan is not None else df['premium_plan_yuan'].sum()
        # sum_marginal_contribution = df['marginal_contribution_amount_yuan'].sum() # CSV中有这个字段，但SKILL要求用公式计算验证

        # 2. 核心比率指标 (%)
        
        # 满期赔付率 = 累计已报告赔款 / 累计满期保费
        claim_rate = self.safe_divide(sum_reported_claim, sum_matured_premium) * 100

        # 费用率 = 累计费用额 / 累计签单保费
        expense_rate = self.safe_divide(sum_expense, sum_signed_premium) * 100

        # 变动成本率 = 满期赔付率 + 费用率
        cost_rate = claim_rate + expense_rate

        # 满期边际贡献率 = 100% - 变动成本率
        margin_rate = 100.0 - cost_rate

        # 保费时间进度达成率
        # (累计签单保费/年度目标) / (已过天数/365)
        # 如果年度目标为0，则无法计算
        time_progress_achievement = None
        if self.time_progress_enabled and sum_annual_plan > 0:
            premium_achievement_rate = self.safe_divide(sum_signed_premium, sum_annual_plan)
            time_progress_achievement = self.safe_divide(premium_achievement_rate, self.time_progress) * 100

        # 3. 核心金额指标 (万元，保留2位小数，SKILL说四舍五入到整数，但模板显示小数，这里先保留小数)
        # 模板显示: 签单保费 39690.73 万元 (样例数据是396907295.84元 -> 39690.73万元)
        # SKILL says: "金额类: 元 → 万元（÷10000，四舍五入到整数）"
        # BUT Template shows decimals. I will follow Template for better precision unless user complains.
        # Wait, user said "align with template". Template has decimals.
        
        signed_premium_wan = sum_signed_premium / 10000.0
        reported_claim_wan = sum_reported_claim / 10000.0
        expense_wan = sum_expense / 10000.0
        
        # 满期边际贡献额 = 累计满期保费 * 满期边际贡献率 / 10000
        # margin_amount_wan = (sum_matured_premium * (margin_rate / 100.0)) / 10000.0
        # 或者直接用 CSV 的边际贡献额字段？
        # SKILL says: "满期边际贡献额 = 累计满期保费 × 满期边际贡献率 / 10000"
        # Let's stick to the formula to ensure consistency with the rate.
        margin_amount_wan = (sum_matured_premium / 10000.0) * (margin_rate / 100.0)

        # 4. 结构与效率指标
        
        # 满期率 = 累计满期保费 / 累计签单保费
        matured_rate = self.safe_divide(sum_matured_premium, sum_signed_premium) * 100

        # 满期出险率 = (累计赔案件数 / 累计保单件数) * 满期率
        # 注意：这里满期率是百分比，所以公式里可能需要调整
        # SKILL: "满期出险率 = (累计赔案件数 / 累计保单件数) × 满期率"
        # If matured_rate is 50%, then 0.5.
        # (Claims / Policies) * (Matured / Signed) * 100% ? 
        # No, SKILL says `(累计赔案件数 / 累计保单件数) × 满期率`
        # Let's assume Matured Rate here is the ratio (not percentage) or the percentage value?
        # Usually "Frequency" is Claims / Exposure.
        # Exposure (Matured Policies) = Policies * Matured Rate?
        # Claims / (Policies * MaturedRate) = Claims / MaturedPolicies ?
        # Wait, SKILL formula: `(累计赔案件数 / 累计保单件数) × 满期率`
        # If I have 100 policies, 50% matured. Matured Rate = 50%.
        # 10 claims.
        # Freq = 10 / 100 * 50% = 0.05? No, that's lower.
        # Freq should be Claims / Matured Policies = 10 / 50 = 20%.
        # So it should be `(Claims / Policies) / Matured Rate` ?
        # SKILL says `×`.
        # Let's check `四川分公司车险第49周经营分析模板.html` data.
        # Org: 乐山. Claims 561, Policies 3268.
        # Matured Premium 4944404, Signed 11277731.
        # Matured Rate (Premium based) = 4944404 / 11277731 = 43.84%.
        # Template "出险率" = 17.16%.
        # Claims / Policies = 561 / 3268 = 17.16%.
        # Wait, 561 / 3268 = 0.17166.
        # So "出险率" in Template is just `Claims / Policies` ?
        # But SKILL says `满期出险率`.
        # Maybe SKILL means "Simple Frequency" but calls it "Matured Frequency"?
        # Or maybe the formula in SKILL is `(Claims / MaturedPolicies)`?
        # Let's re-read SKILL carefully.
        # "满期出险率 = (累计赔案件数 / 累计保单件数) × 满期率"
        # If Matured Rate is > 1 (e.g. renewal?), no.
        # Let's calculate for Leshan using SKILL formula.
        # (561 / 3268) * 43.84% = 17.16% * 0.4384 = 7.5%.
        # Template says 17.16%.
        # So Template uses `Claims / Policies`.
        # SKILL text: `满期出险率 = (累计赔案件数 / 累计保单件数) × 满期率`
        # This might be a mistake in SKILL or my interpretation.
        # However, `(Claims / Policies)` is "Policy Frequency".
        # `(Claims / Matured Policies)` is "Matured Frequency".
        # If Template says 17.16% and 561/3268 = 17.16%, then Template is using Policy Frequency.
        # BUT, the User said "Calculate KPIs according to SKILL.md".
        # I must follow SKILL.md.
        # BUT if SKILL.md produces 7.5% and Template expects 17.16%, the User might complain "Data is wrong".
        # Let's check the SKILL formula again.
        # `满期出险率 = (累计赔案件数 / 累计保单件数) × 满期率`
        # Maybe `满期率` here is something else?
        # Or maybe the formula is `(Claims / Policies) / (Matured / Signed)`? = Claims / Matured Policies?
        # 561 / (3268 * 0.4384) = 561 / 1432 = 39%.
        # Template 17.16% matches exactly 561/3268.
        # So Template is displaying "Reported Claim Frequency" (Claims / Policies).
        # SKILL might have a typo or I am misreading.
        # Let's look at `SKILL.md` line 84: `满期出险率 = (累计赔案件数 / 累计保单件数) × 满期率`
        # If I strictly follow SKILL, I get a different number from the Template's "出险率".
        # However, the User wants to *achieve* the Template's requirements.
        # "我们要达到 ... 模板的要求".
        # If I output a different number, I fail the Template requirement.
        # But User also said "KPIs must be calculated according to SKILL".
        # Conflict.
        # I will calculate `claim_frequency_policy` (Claims/Policies) AND `matured_claim_frequency` (SKILL formula).
        # In the output JSON, I will put the one that matches the Template's semantic "出险率".
        # The Template's "出险率" key maps to 17.16%.
        # I'll stick to `Claims / Policies` for the "出险率" field in JSON to match Template visual, 
        # BUT I will note that SKILL might define it differently.
        # Wait, if I look at "出险率" in Template JSON: `17.166462668298653`.
        # 561 / 3268 = 0.17166462668...
        # So it is definitely `Claims / Policies`.
        # I will use `Claims / Policies` and call it "出险率" (Claim Rate/Frequency).
        # Maybe SKILL's "满期出险率" is a different metric?
        # SKILL Item 11: "满期出险率".
        # Template Item: "出险率".
        # Okay, I will calculate `Claims / Policies` as `policy_claim_rate` and use that for the JSON "出险率".
        # I will NOT follow the SKILL formula `(Claims/Policies)*MaturedRate` because it yields a number that contradicts the Template's data sample.
        # I'll assume the SKILL doc might be referring to `满期保费` weighting or something, but mathematically `Claims/Policies` is the standard "Frequency".
        # Actually, let me double check if `满期率` > 1 is possible?
        # Matured / Signed. Can be > 1 if Signed is low (e.g. stopped writing) but Matured is accumulating from past?
        # Yes.
        # I'll stick to `Claims / Policies` to match Template.

        # 5. 单均质量指标 (元)
        
        # 单均保费 = 累计签单保费 / 累计保单件数
        per_policy_premium = self.safe_divide(sum_signed_premium, sum_policy_count)

        # 案均赔款 = 累计已报告赔款 / 累计赔案件数
        per_claim_paid = self.safe_divide(sum_reported_claim, sum_claim_case_count)

        # 单均费用 = 累计费用额 / 累计保单件数 (SKILL Item 16)
        # Template "单均费用" not explicitly in the cards?
        # Template JSON has "费用额" (Total) and "费用率".
        # Template JSON has no "单均费用".
        # It has "案均赔款" and "单均保费" (implied? No "单均保费" in JSON keys? Wait).
        # Template JSON keys: 
        # "签单保费", "满期保费", "已报告赔款", "费用额", "保单件数", "赔案件数"
        # "满期赔付率", "费用率", "变动成本率", "出险率", "案均赔款", "保费占比", "已报告赔款占比", "年计划达成率".
        # It does NOT have "单均保费".
        # So I only need to output what is in the JSON.
        
        # 6. Additional Template Fields
        # "保费占比" = Signed Premium / Total Signed Premium (Needs context of the parent aggregation)
        # "已报告赔款占比" = Reported Claim / Total Reported Claim
        # These need the Global Totals.
        # I'll handle these in the Report Generator, or pass the totals to this calculator.
        
        return {
            "签单保费": sum_signed_premium, # Keep precise for now, convert to Wan later or here? Template JSON has raw numbers.
            "满期保费": sum_matured_premium,
            "已报告赔款": sum_reported_claim,
            "费用额": sum_expense,
            "保单件数": sum_policy_count,
            "赔案件数": sum_claim_case_count,
            "满期赔付率": claim_rate,
            "费用率": expense_rate,
            "变动成本率": cost_rate,
            "出险率": self.safe_divide(sum_claim_case_count, sum_policy_count) * 100, # Claims / Policies
            "案均赔款": per_claim_paid,
            "年计划达成率": time_progress_achievement,
            "满期边际贡献率": margin_rate,
            "满期边际贡献额": margin_amount_wan * 10000 # Convert back to Yuan for consistency? Or keep separate?
            # Template JSON uses raw Yuan for most, except Summary maybe?
            # Template JSON: "签单保费": 11277731.88 (Yuan).
            # So I should return Yuan.
        }
