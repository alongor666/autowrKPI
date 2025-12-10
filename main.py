import argparse
import os
import sys
from src.report_generator import ReportGenerator

def parse_args(base_dir):
    parser = argparse.ArgumentParser(description="生成经营分析周报")
    parser.add_argument('--csv', default=os.path.join(base_dir, 'data', '2025保单第49周变动成本明细表.csv'), help='输入数据 CSV 路径，默认使用示例周数据')
    parser.add_argument('--template', default=os.path.join(base_dir, 'template', '四川分公司车险第49周经营分析模板.html'), help='报告模板 HTML 路径')
    parser.add_argument('--output', default=os.path.join(base_dir, 'output', '经营分析周报.html'), help='输出报告 HTML 路径')
    parser.add_argument('--mapping', default=os.path.join(base_dir, 'reference', 'business_type_mapping.json'), help='业务类型映射文件')
    parser.add_argument('--year-plans', default=os.path.join(base_dir, 'reference', 'year-plans.json'), help='年度计划数据文件')
    parser.add_argument('--thresholds', default=os.path.join(base_dir, 'reference', 'thresholds.json'), help='阈值配置文件')
    parser.add_argument('--week', type=int, help='指定周次；不填则自动读取数据中的 week_number')
    parser.add_argument('--org', default='四川', help='机构名称（用于标题显示）')
    parser.add_argument('--year', type=int, help='报告年份；默认尝试从文件名推断，失败则回退至 2025')
    return parser.parse_args()

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    args = parse_args(base_dir)

    csv_path = os.path.abspath(args.csv)
    template_path = os.path.abspath(args.template)
    output_path = os.path.abspath(args.output)
    mapping_path = os.path.abspath(args.mapping)
    year_plans_path = os.path.abspath(args.year_plans)
    thresholds_path = os.path.abspath(args.thresholds)

    print("开始生成经营分析报告...")
    print(f"数据源: {csv_path}")
    
    try:
        generator = ReportGenerator(
            csv_path, 
            template_path, 
            output_path, 
            mapping_path,
            year_plans_path=year_plans_path,
            thresholds_path=thresholds_path,
            week=args.week,
            org_name=args.org,
            year=args.year
        )
        generator.generate()
        print("✅ 成功！报告已生成。")
    except Exception as e:
        print(f"❌ 失败: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
