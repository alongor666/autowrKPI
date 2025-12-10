import json
import os

class Mapper:
    """
    负责处理业务类型映射和标准化的类。
    """
    def __init__(self, mapping_file_path):
        self.mapping_file_path = mapping_file_path
        self.mapping_data = self._load_mapping()
        self.canonical_map = self._build_canonical_map()
        self.compatibility_map = self._build_compatibility_map()

    def _load_mapping(self):
        if not os.path.exists(self.mapping_file_path):
            raise FileNotFoundError(f"映射文件未找到: {self.mapping_file_path}")
        try:
            with open(self.mapping_file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            raise RuntimeError(f"读取映射文件失败: {str(e)}")

    def _build_canonical_map(self):
        """构建标准名称到详细信息的映射"""
        mapping = {}
        for item in self.mapping_data.get('business_types', []):
            # 使用 csv_raw_value 作为键，但也支持通过 ui_full_name 查找
            mapping[item['csv_raw_value']] = item
            mapping[item['ui_full_name']] = item
        return mapping

    def _build_compatibility_map(self):
        """构建兼容性映射"""
        mapping = {}
        for item in self.mapping_data.get('compatibility_mappings', []):
            mapping[item['csv_raw_value']] = item['maps_to']
        return mapping

    def map_business_type(self, raw_value):
        """
        根据原始值返回标准化的业务类型信息。
        返回字典: {'ui_full_name', 'ui_short_label', 'category', ...}
        """
        if not raw_value:
            return None

        # 1. 检查兼容性映射
        if raw_value in self.compatibility_map:
            target_name = self.compatibility_map[raw_value]
            if target_name in self.canonical_map:
                return self.canonical_map[target_name]
        
        # 2. 检查标准映射
        if raw_value in self.canonical_map:
            return self.canonical_map[raw_value]
            
        # 3. 未找到匹配，返回 None 或默认值
        # 这里为了鲁棒性，可以返回一个带有 raw_value 的临时对象，或者记录日志
        return {
            'ui_full_name': raw_value,
            'ui_short_label': raw_value,
            'category': '未知',
            'business_type_category': raw_value
        }
