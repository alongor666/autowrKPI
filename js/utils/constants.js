/**
 * Application-wide constants
 * Centralized configuration for colors, thresholds, and dimensions
 */

/**
 * Color theme constants
 */
export const THEME_COLORS = {
  PRIMARY_RED: '#a02724',
  TESLA_BLUE: '#0070c0',
  SUCCESS_GREEN: '#00b050',
  WARNING_YELLOW: '#ffc000',
  DANGER_RED: '#c00000',
  GRAY_DARK: '#333333',
  GRAY_MEDIUM: '#666666',
  GRAY_LIGHT: '#cccccc'
};

/**
 * Chart colors for specific metrics
 */
export const CHART_COLORS = {
  保费贡献度: '#e0e0e0',
  赔款贡献度: '#a6a6a6',
  满期赔付率: '#0070c0'
};

/**
 * KPI threshold values for status determination
 */
export const KPI_THRESHOLDS = {
  变动成本率: { good: 91, warning: 94, danger: 999 },
  满期赔付率: { good: 70, warning: 75, danger: 999 },
  费用率: { good: 14, warning: 17, danger: 999 },
  保费时间进度达成率: { good: 100, warning: 95, danger: 0 }
};

/**
 * Drill-down dimension configuration
 * Defines all available filter dimensions with grouping and labels
 */
export const DIMENSION_CONFIG = [
  // Group 1: Core Organization (Rank 1) - 支持同城/异地分组
  {
    key: 'third_level_organization',
    label: '三级机构',
    group: 1,
    hasGrouping: true,
    groupOptions: [
      {
        value: 'local',
        label: '同城',
        children: ['天府', '新都', '高新', '武侯', '青羊']
      },
      {
        value: 'remote',
        label: '异地',
        children: ['宜宾', '泸州', '自贡', '乐山', '德阳', '资阳', '达州']
      }
    ]
  },

  // Group 2: Time Dimension
  { key: 'policy_start_year', label: '保单年度', group: 2 },
  { key: 'week_number', label: '周次', group: 2 },

  // Group 3: Business Core
  { key: 'insurance_type', label: '险种', group: 3 },
  { key: 'ui_short_label', label: '业务类型', group: 3 },
  { key: 'coverage_type', label: '险别组合', group: 3 },

  // Group 4: Vehicle Attributes
  { key: 'energy_type', label: '是否新能源', group: 4 },
  { key: 'is_transferred_vehicle', label: '是否过户', group: 4 },
  { key: 'renewal_status', label: '续保状态', group: 4 },
  { key: 'vehicle_insurance_grade', label: '车险分等级', group: 4 },
  { key: 'small_truck_score', label: '小货车评分', group: 4 },
  { key: 'large_truck_score', label: '大货车评分', group: 4 },

  // Group 5: Channel
  { key: 'terminal_source', label: '终端来源', group: 5 }
];

/**
 * Dimension to color mapping for tags and labels
 */
export const DIMENSION_COLOR_MAP = {
  third_level_organization: '#0070c0',  // 蓝色
  customer_category_3: '#00b050',        // 绿色
  ui_short_label: '#ff0000',             // 红色
  energy_type: '#5b9bd5',                // 浅蓝
  renewal_status: '#a9d18e',             // 浅绿
  terminal_source: '#ffd966'             // 黄色
};

/**
 * Organization mode configuration
 */
export const ORGANIZATION_MODES = {
  // 分公司模式：显示所有三级机构（默认）
  branch: {
    name: '分公司',
    titlePrefix: '四川分公司',
    description: '显示所有三级机构数据',
    defaultSelection: 'all'
  },

  // 同城模式：仅显示同城5个机构
  local: {
    name: '同城',
    titlePrefix: '四川同城机构',
    description: '仅显示同城机构数据',
    defaultSelection: ['天府', '高新', '新都', '青羊', '武侯']
  },

  // 异地模式：仅显示异地7个机构
  remote: {
    name: '异地',
    titlePrefix: '四川异地机构',
    description: '仅显示异地机构数据',
    defaultSelection: ['宜宾', '泸州', '德阳', '资阳', '乐山', '自贡', '达州']
  },

  // 单机构模式：仅显示单个机构
  single: {
    name: '单机构',
    titlePrefix: (selectedOrg) => `${selectedOrg}机构`,
    description: '仅显示单个机构数据',
    requiresUserSelection: true
  },

  // 多机构模式：自定义多机构选择
  multi: {
    name: '多机构',
    titlePrefix: '四川多机构',
    description: '用户自定义多机构选择',
    isDerived: true
  }
};

/**
 * Display name mappings (original name → display name)
 */
export const DISPLAY_NAME_MAP = {
  '已报告赔款占比': '赔款贡献度',
  '保费占比': '保费贡献度',
  '赔付率VS占比': '满期赔付率VS赔款贡献度'
};

/**
 * Tab definitions
 */
export const TAB_CONFIG = [
  { key: 'overview', label: '经营概览', defaultDimension: 'kpi' },
  { key: 'premium', label: '保费分析', defaultDimension: 'category' },
  { key: 'cost', label: '成本分析', defaultDimension: 'org' },
  { key: 'loss', label: '赔案分析', defaultDimension: 'org', subTabs: ['bubble', 'trend'] },
  { key: 'expense', label: '费用分析', defaultDimension: 'org' }
];

/**
 * Event names used throughout the application
 */
export const EVENTS = {
  // App lifecycle
  APP_INITIALIZED: 'app:initialized',

  // Data events
  DATA_UPDATED: 'data:updated',
  DATA_REFRESH: 'data:refresh',

  // Filter events
  FILTER_CHANGED: 'filter:changed',
  FILTER_RESET: 'filter:reset',

  // Tab events
  TAB_CHANGED: 'tab:changed',

  // Dimension events
  DIMENSION_CHANGED: 'dimension:changed',

  // Chart events
  CHART_RENDER: 'chart:render',
  CHART_RESIZE: 'chart:resize',

  // Error events
  ERROR_OCCURRED: 'error:occurred'
};
