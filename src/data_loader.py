import pandas as pd
import os

class DataLoader:
    """
    负责加载和预处理经营分析数据的类。
    """
    def __init__(self, file_path):
        self.file_path = file_path
        self.required_columns = [
            'third_level_organization',  # 三级机构
            'business_type_category',    # 业务类型分类
            'customer_category_3',       # 客户类别
            'signed_premium_yuan',       # 签单保费
            'matured_premium_yuan',      # 满期保费
            'policy_count',              # 保单件数
            'claim_case_count',          # 赔案件数
            'reported_claim_payment_yuan', # 已报告赔款
            'expense_amount_yuan',       # 费用额
            'premium_plan_yuan',         # 预算/计划保费 (用于计算达成率)
            'week_number'                # 周数
        ]

    def load_data(self):
        """
        加载 CSV 文件并进行基本的类型转换。
        """
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"数据文件未找到: {self.file_path}")

        try:
            df = pd.read_csv(self.file_path)
            
            # 验证必要列是否存在
            missing_cols = [col for col in self.required_columns if col not in df.columns]
            if missing_cols:
                raise ValueError(f"CSV 文件缺失必要列: {missing_cols}")

            # 填充数值型缺失值为 0
            numeric_cols = [
                'signed_premium_yuan', 'matured_premium_yuan', 'policy_count', 
                'claim_case_count', 'reported_claim_payment_yuan', 'expense_amount_yuan',
                'premium_plan_yuan'
            ]
            for col in numeric_cols:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

            return df
            
        except Exception as e:
            raise RuntimeError(f"读取数据失败: {str(e)}")
