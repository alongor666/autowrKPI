import unittest
import pandas as pd
import os
import sys
import shutil
import tempfile

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.report_generator import ReportGenerator

class TestBranchMode(unittest.TestCase):
    def setUp(self):
        # Create temporary directory
        self.test_dir = tempfile.mkdtemp()
        self.csv_path = os.path.join(self.test_dir, 'test_data.csv')
        self.template_path = os.path.join(self.test_dir, 'template.html')
        self.output_path = os.path.join(self.test_dir, 'output.html')
        self.mapping_path = os.path.join(self.test_dir, 'mapping.json')
        
        # Create dummy template
        with open(self.template_path, 'w', encoding='utf-8') as f:
            f.write("<html><body><script>const DATA = {};</script><title>Title</title><h1>Header</h1></body></html>")
            
        # Create dummy mapping
        with open(self.mapping_path, 'w', encoding='utf-8') as f:
            f.write('{"business_types": [], "compatibility_mappings": {}}')

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def create_mock_data(self, num_orgs):
        data = {
            'second_level_organization': ['四川'] * num_orgs,
            'third_level_organization': [f'Org_{i}' for i in range(num_orgs)],
            'business_type_category': ['TypeA'] * num_orgs,
            'customer_category_3': ['CatA'] * num_orgs,
            'signed_premium_yuan': [1000] * num_orgs,
            'matured_premium_yuan': [500] * num_orgs,
            'policy_count': [10] * num_orgs,
            'claim_case_count': [1] * num_orgs,
            'reported_claim_payment_yuan': [200] * num_orgs,
            'expense_amount_yuan': [100] * num_orgs,
            'premium_plan_yuan': [2000] * num_orgs,
            'week_number': [49] * num_orgs
        }
        return pd.DataFrame(data)

    def test_single_org_detection(self):
        # Case 1: Single Org (1 organization)
        df = self.create_mock_data(1)
        df.to_csv(self.csv_path, index=False)
        
        generator = ReportGenerator(
            csv_path=self.csv_path,
            template_path=self.template_path,
            output_path=self.output_path,
            mapping_path=self.mapping_path
        )
        generator.generate()
        
        self.assertTrue(generator.is_single_org_mode, "Should be Single Org Mode for 1 org")
        self.assertEqual(generator.org_name, "Org_0")

    def test_branch_mode_detection(self):
        # Case 2: Branch Mode (12 organizations)
        df = self.create_mock_data(12)
        df.to_csv(self.csv_path, index=False)
        
        generator = ReportGenerator(
            csv_path=self.csv_path,
            template_path=self.template_path,
            output_path=self.output_path,
            mapping_path=self.mapping_path
        )
        generator.generate()
        
        self.assertFalse(generator.is_single_org_mode, "Should NOT be Single Org Mode for 12 orgs (Branch Mode)")
        self.assertEqual(generator.org_name, "四川", "Should fallback to second level org name")

    def test_multi_org_small_detection(self):
        # Case 3: Small Multi Org (e.g., 5 organizations)
        # This currently falls into "False" for is_single_org_mode, but logic might vary.
        # Based on current code:
        # if len == 1 -> True
        # elif len >= 12 -> False
        # else -> False (implicitly, as initialized to False)
        
        df = self.create_mock_data(5)
        df.to_csv(self.csv_path, index=False)
        
        generator = ReportGenerator(
            csv_path=self.csv_path,
            template_path=self.template_path,
            output_path=self.output_path,
            mapping_path=self.mapping_path
        )
        generator.generate()
        
        self.assertFalse(generator.is_single_org_mode, "Should NOT be Single Org Mode for 5 orgs")

if __name__ == '__main__':
    unittest.main()
