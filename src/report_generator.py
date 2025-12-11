import pandas as pd
import json
import os
import re
import numpy as np
from datetime import date
from .data_loader import DataLoader
from .mapper import Mapper
from .kpi_calculator import KPICalculator

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)

class ReportGenerator:
    def __init__(self, csv_path, template_path, output_path, mapping_path, year_plans_path=None, thresholds_path=None, week=49, org_name="四川", year=None, report_date=None):
        self.csv_path = csv_path
        self.template_path = template_path
        self.output_path = output_path
        self.week = week
        self.org_name = org_name
        self.year = year
        self.report_date = report_date
        self.loader = DataLoader(csv_path)
        self.mapper = Mapper(mapping_path)
        self.calculator = None
        self.policy_start_year = None
        self.time_progress_enabled = True
        
        self.year_plans = {}
        if year_plans_path and os.path.exists(year_plans_path):
            with open(year_plans_path, 'r', encoding='utf-8') as f:
                self.year_plans = json.load(f).get("年度保费计划", {})
                
        self.thresholds = {}
        self.quadrant_baselines = {}
        if thresholds_path and os.path.exists(thresholds_path):
            with open(thresholds_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.thresholds = data.get("问题机构识别阈值", {})
                self.quadrant_baselines = data.get("四象限基准线", {})

    def generate(self):
        # 1. Load Data
        load_result = self.loader.load_data()
        if isinstance(load_result, tuple) and len(load_result) >= 2:
            df, raw_policy_start_year = load_result[0], load_result[1]
        else:
            df = load_result
            raw_policy_start_year = None

        if raw_policy_start_year is not None and not pd.isna(raw_policy_start_year):
            try:
                self.policy_start_year = int(raw_policy_start_year)
            except (TypeError, ValueError):
                self.policy_start_year = None
        else:
            self.policy_start_year = None
        
        # Determine week from data if not provided or default
        data_week = None
        if 'week_number' in df.columns and not pd.isna(df['week_number'].max()):
            data_week = int(df['week_number'].max())
            if self.week is None:
                self.week = data_week
            elif self.week == 49 and data_week != 49:
                self.week = data_week
                
        if self.week is None:
            self.week = 49
        
        self.is_single_org_mode = False

        # Detect organization from data
        if 'second_level_organization' in df.columns:
            # Check for third level organization first for single mode detection
            if 'third_level_organization' in df.columns:
                third_orgs = df['third_level_organization'].dropna().unique()
                if len(third_orgs) == 1:
                    self.is_single_org_mode = True
                    self.org_name = third_orgs[0]
                elif len(third_orgs) >= 12:
                    # 分公司模式 (Branch Mode) - explicitly identified as requested
                    self.is_single_org_mode = False
            
            # Fallback to second level if not single mode or org_name not set
            if not self.is_single_org_mode:
                orgs = df['second_level_organization'].dropna().unique()
                if len(orgs) > 0:
                    # Update org_name if it's currently the default "四川" or None
                    if self.org_name == "四川" or self.org_name is None:
                        self.org_name = orgs[0]
        
        # Future Expansion: Multi-week mode support
        # TODO: Add logic to handle date ranges and multiple weeks (e.g., self.week_start, self.week_end)
        
        # Set year
        if self.policy_start_year is not None:
            self.year = self.policy_start_year
        elif self.year is None:
            inferred_year = self._infer_year_from_path(self.csv_path)
            self.year = inferred_year if inferred_year else 2025

        # Refresh calculator with final week
        self.time_progress_enabled = (self.year == 2025)
        self.calculator = KPICalculator(week=self.week, enable_time_progress=self.time_progress_enabled)
        
        # Compute report date if not provided
        if not self.report_date:
            self.report_date = self._calc_report_date(self.year, self.week)
        
        # 2. Preprocess & Map
        # Add standardized columns
        df['ui_short_label'] = df['business_type_category'].apply(lambda x: self.mapper.map_business_type(x)['ui_short_label'])
        df['ui_category'] = df['business_type_category'].apply(lambda x: self.mapper.map_business_type(x)['category'])
        
        # 3. Calculate Global Totals (for Shares)
        # Use "四川分公司" as total plan if available
        # In single org mode, try to use that org's plan
        plan_map = self.year_plans if self.time_progress_enabled else {}
        total_plan_key = self.org_name if self.is_single_org_mode else "四川分公司"
        total_plan = plan_map.get(total_plan_key, None)
        
        # If total_plan is None and not in single mode, fallback to default logic or sum
        if total_plan is None and not self.is_single_org_mode:
            total_plan = plan_map.get("四川分公司", None)

        global_kpis = self.calculator.calculate_kpis(df, manual_plan=total_plan)
        total_premium = global_kpis['签单保费']
        total_claim = global_kpis['已报告赔款']

        # 4. Aggregate & Calculate per Dimension
        
        # 4.1 By Org (Third Level)
        # Pass year_plans for Org dimension
        data_by_org = self._process_dimension(df, 'third_level_organization', '机构', total_premium, total_claim, plan_map=plan_map)
        
        # 4.2 By Category (Customer Category 3)
        data_by_category = self._process_dimension(df, 'customer_category_3', '客户类别', total_premium, total_claim)
        
        # 4.3 By Business Type (UI Short Label)
        data_by_business_type = self._process_dimension(df, 'ui_short_label', '业务类型简称', total_premium, total_claim)

        # 5. Build Final JSON
        final_data = {
            "summary": {
                "签单保费": global_kpis['签单保费'],
                "满期赔付率": global_kpis['满期赔付率'],
                "费用率": global_kpis['费用率'],
                "变动成本率": global_kpis['变动成本率'],
                "已报告赔款": global_kpis['已报告赔款']
            },
            "problems": self._detect_problems(data_by_org),
            "dataByOrg": data_by_org,
            "dataByCategory": data_by_category,
            "dataByBusinessType": data_by_business_type,
            "thresholds": {
                "四象限基准线": self.quadrant_baselines,
                "问题机构识别阈值": self.thresholds
            },
            "week": self.week,
            "organization": self.org_name,
            "isSingleOrgMode": self.is_single_org_mode
        }

        # 6. Inject into Template
        self._write_report(final_data)

    def _process_dimension(self, df, group_col, output_name_col, total_premium, total_claim, plan_map=None):
        results = []
        # Filter out empty groups if any
        groups = df.groupby(group_col)
        
        for name, group_df in groups:
            # Determine plan for this group
            plan = None
            if plan_map and name in plan_map:
                plan = plan_map[name]
                
            kpis = self.calculator.calculate_kpis(group_df, manual_plan=plan)
            
            # Calculate Shares
            premium_share = (kpis['签单保费'] / total_premium * 100) if total_premium > 0 else 0
            claim_share = (kpis['已报告赔款'] / total_claim * 100) if total_claim > 0 else 0
            
            item = {
                output_name_col: name,
                "签单保费": kpis['签单保费'],
                "满期保费": kpis['满期保费'],
                "已报告赔款": kpis['已报告赔款'],
                "费用额": kpis['费用额'],
                "保单件数": kpis['保单件数'],
                "赔案件数": kpis['赔案件数'],
                "满期赔付率": kpis['满期赔付率'],
                "费用率": kpis['费用率'],
                "变动成本率": kpis['变动成本率'],
                "出险率": kpis['出险率'],
                "案均赔款": kpis['案均赔款'],
                "保费占比": premium_share,
                "已报告赔款占比": claim_share,
                "年计划达成率": kpis['年计划达成率']
            }
            results.append(item)
            
        # Sort by Premium Descending
        results.sort(key=lambda x: x['签单保费'], reverse=True)
        return results

    def _detect_problems(self, org_data):
        """
        基于阈值检测异常
        """
        problems = []
        # Defaults from thresholds.json if loaded
        th_cost = self.thresholds.get("变动成本率超标", 93)
        th_premium = self.thresholds.get("年保费未达标", 95)
        th_expense = self.thresholds.get("费用率超标", 18)
        
        for item in org_data:
            name = item['机构']
            # 规则1: 变动成本率 > threshold
            if item['变动成本率'] > th_cost:
                problems.append(f"{name}(成本超标)")
            # 规则2: 年计划达成率 < threshold (Assuming 'Not Reached' means below target)
            elif item['年计划达成率'] > 0 and item['年计划达成率'] < th_premium:
                problems.append(f"{name}(保费未达标)")
            # 规则3: 费用率 > threshold
            if item['费用率'] > th_expense:
                problems.append(f"{name}(费用率高)")
                
        return problems[:5] # 只返回前5个

    def _write_report(self, data):
        if not os.path.exists(self.template_path):
            raise FileNotFoundError(f"模板文件未找到: {self.template_path}")
            
        with open(self.template_path, 'r', encoding='utf-8') as f:
            template_content = f.read()
            
        # Inject Data
        json_str = json.dumps(data, ensure_ascii=False, indent=2, cls=NumpyEncoder)
        new_content = re.sub(r'const DATA = \{[\s\S]*?\};', f'const DATA = {json_str};', template_content)
        
        # Update Title and Header
        year_text = f"{self.year}" if self.year is not None else ""
        if self.is_single_org_mode:
            new_title = f"{self.org_name}车险{year_text}保单第{self.week}周经营分析"
        else:
            new_title = f"{self.org_name}分公司车险{year_text}保单第{self.week}周经营分析"
            
        new_content = re.sub(r'<title>.*?</title>', f'<title>{new_title}</title>', new_content)
        new_content = re.sub(r'<h1>.*?</h1>', f'<h1>{new_title}</h1>', new_content)
        
        # Update date line if present
        if self.report_date:
            new_content = re.sub(r'数据截止日期：[^<\n]*', f'数据截止日期：{self.report_date}', new_content)
        
        with open(self.output_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"报告已生成: {self.output_path}")

    def _calc_report_date(self, year, week):
        try:
            return date.fromisocalendar(int(year), int(week), 6).strftime("%Y年%m月%d日")
        except Exception:
            return None

    def _infer_year_from_path(self, path):
        match = re.search(r'(20\d{2})', os.path.basename(path))
        if match:
            return int(match.group(1))
        return None
