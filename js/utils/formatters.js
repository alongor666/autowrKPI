/**
 * Number and data formatting utilities
 * Extracted from Dashboard.formatRate, formatWanYuanFromYuan, etc.
 */

/**
 * Format rate/percentage value
 * @param {number} value - Value to format
 * @param {number} digits - Decimal digits (default: 2)
 * @returns {string} Formatted percentage string
 */
export function formatRate(value, digits = 2) {
  if (value === undefined || value === null) return '--';
  const num = Number(value);
  if (Number.isNaN(num)) return '--';
  return num.toFixed(digits).replace(/\.00$/, '');
}

/**
 * Format value to fixed decimal places
 * @param {number} value - Value to format
 * @param {number} digits - Decimal digits (default: 2)
 * @returns {string} Formatted string
 */
export function formatFixed(value, digits = 2) {
  if (value === undefined || value === null) return '--';
  const num = Number(value);
  if (Number.isNaN(num)) return '--';
  return num.toFixed(digits);
}

/**
 * Format value as integer with locale separators
 * @param {number} value - Value to format
 * @returns {string} Formatted integer string
 */
export function formatInteger(value) {
  if (value === undefined || value === null) return '--';
  const num = Number(value);
  if (Number.isNaN(num)) return '--';
  return Math.round(num).toLocaleString();
}

/**
 * Convert Yuan (元) to Wan Yuan (万元) and format
 * @param {number} valueInYuan - Value in Yuan
 * @returns {string} Formatted value in Wan Yuan
 */
export function formatWanYuanFromYuan(valueInYuan) {
  if (valueInYuan === undefined || valueInYuan === null) return '--';
  const num = Number(valueInYuan);
  if (Number.isNaN(num)) return '--';
  return Math.round(num / 10000).toLocaleString();
}

/**
 * Calculate optimal label size based on data length
 * @param {Array} data - Data array
 * @param {number} containerWidth - Container width in pixels (optional)
 * @returns {number} Optimal font size
 */
export function calculateOptimalLabelSize(data, containerWidth = null) {
  const dataLength = data.length;

  // Base size on data length
  let fontSize;
  if (dataLength <= 5) {
    fontSize = 12;
  } else if (dataLength <= 10) {
    fontSize = 11;
  } else if (dataLength <= 20) {
    fontSize = 10;
  } else if (dataLength <= 30) {
    fontSize = 9;
  } else {
    fontSize = 8;
  }

  // Further adjust based on container width if provided
  if (containerWidth) {
    const avgLabelWidth = 80; // Estimated average label width in pixels
    const totalWidth = dataLength * avgLabelWidth;

    if (totalWidth > containerWidth) {
      const ratio = containerWidth / totalWidth;
      fontSize = Math.max(6, Math.floor(fontSize * ratio));
    }
  }

  return fontSize;
}

/**
 * Get KPI status color class based on value and thresholds
 * @param {string} type - KPI type (e.g., 'progress', 'variable_cost')
 * @param {number} value - KPI value
 * @returns {string} CSS class name ('status-good', 'status-warning', or 'status-danger')
 */
export function getKPIStatusColor(type, value) {
  // Thresholds from constants.js
  const thresholds = {
    progress: { good: 100, warning: 95, danger: 0, reverse: true },
    variable_cost: { good: 91, warning: 94, danger: 999, reverse: false },
    loss: { good: 70, warning: 75, danger: 999, reverse: false },
    expense: { good: 14, warning: 17, danger: 999, reverse: false }
  };

  const threshold = thresholds[type];
  if (!threshold) return 'status-good';

  if (threshold.reverse) {
    // For metrics where higher is better (e.g., progress rate)
    if (value < threshold.warning) return 'status-danger';
    if (value < threshold.good) return 'status-warning';
    return 'status-good';
  } else {
    // For metrics where lower is better (e.g., cost rates)
    if (value > threshold.danger) return 'status-danger';
    if (value > threshold.warning) return 'status-warning';
    return 'status-good';
  }
}

/**
 * Get status color for chart rendering
 * @param {number} value - Variable cost rate value
 * @returns {string} Color hex code
 */
export function getStatusColor(value) {
  if (value <= 91) return '#00b050';  // Green - good
  if (value <= 94) return '#ffc000';  // Yellow - warning
  return '#ff0000';                   // Red - danger
}

/**
 * Get display name for indicators
 * @param {string} originalName - Original indicator name
 * @returns {string} Display name
 */
export function getDisplayName(originalName) {
  const nameMap = {
    '已报告赔款占比': '赔款贡献度',
    '保费占比': '保费贡献度',
    '赔付率VS占比': '满期赔付率VS赔款贡献度'
  };
  return nameMap[originalName] || originalName;
}

/**
 * Format currency value with unit
 * @param {number} value - Currency value
 * @param {string} unit - Unit (e.g., '万元', '元')
 * @param {number} digits - Decimal digits (default: 2)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, unit = '万元', digits = 2) {
  if (value === undefined || value === null) return '--';
  const num = Number(value);
  if (Number.isNaN(num)) return '--';

  let formattedValue;
  if (unit === '万元') {
    formattedValue = formatWanYuanFromYuan(num * 10000); // Convert back from 万元 to 元 for the formatter
  } else {
    formattedValue = formatFixed(num, digits);
  }

  return `${formattedValue}${unit}`;
}

/**
 * Format percentage with unit
 * @param {number} value - Percentage value
 * @param {number} digits - Decimal digits (default: 2)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, digits = 2) {
  return `${formatRate(value, digits)}%`;
}
