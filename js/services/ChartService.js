/**
 * ECharts Service - Chart lifecycle and rendering management
 * Provides centralized chart operations with pooling support
 */
import { THEME_COLORS, CHART_COLORS, KPI_THRESHOLDS } from '../utils/constants.js';
import { formatRate, formatWanYuanFromYuan, formatInteger, calculateOptimalLabelSize } from '../utils/formatters.js';

class ChartService {
  constructor() {
    this.chartPool = new Map(); // Chart instance pooling
    this.maxPoolSize = 10;
    this.resizeObserver = null;
    this.initResizeObserver();
  }

  /**
   * Initialize ResizeObserver for responsive charts
   */
  initResizeObserver() {
    if (typeof ResizeObserver === 'undefined') {
      console.warn('[ChartService] ResizeObserver not supported');
      return;
    }

    this.resizeObserver = new ResizeObserver(
      this.debounce((entries) => {
        entries.forEach(entry => {
          const chartId = entry.target.id;
          if (this.chartPool.has(chartId)) {
            const { chart } = this.chartPool.get(chartId);
            if (chart) {
              chart.resize();
            }
          }
        });
      }, 200)
    );
  }

  /**
   * Debounce helper function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Get or create chart instance with pooling
   * @param {string} containerId - Container element ID
   * @returns {object} ECharts instance
   */
  getChart(containerId) {
    // Check if already in pool
    if (this.chartPool.has(containerId)) {
      // Move to end (most recently used)
      const entry = this.chartPool.get(containerId);
      this.chartPool.delete(containerId);
      this.chartPool.set(containerId, { ...entry, lastUsed: Date.now() });

      // Start observing container
      const container = document.getElementById(containerId);
      if (container && this.resizeObserver) {
        this.resizeObserver.observe(container);
      }

      return entry.chart;
    }

    // Pool full - evict least recently used
    if (this.chartPool.size >= this.maxPoolSize) {
      const lruKey = this.chartPool.keys().next().value;
      this.disposeChart(lruKey);
    }

    // Create new chart instance
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Chart container not found: ${containerId}`);
    }

    // Dispose existing instance if any
    const existingChart = window.echarts.getInstanceByDom(container);
    if (existingChart) {
      window.echarts.dispose(existingChart);
    }

    const chart = window.echarts.init(container);

    // Store in pool
    this.chartPool.set(containerId, {
      chart,
      lastUsed: Date.now(),
      container
    });

    // Start observing for resize
    if (this.resizeObserver) {
      this.resizeObserver.observe(container);
    }

    return chart;
  }

  /**
   * Render chart with configuration
   * @param {string} containerId - Container element ID
   * @param {object} config - ECharts configuration
   * @returns {object} ECharts instance
   */
  renderChart(containerId, config) {
    const chart = this.getChart(containerId);
    chart.setOption(config, { notMerge: true });
    return chart;
  }

  /**
   * Dispose specific chart
   * @param {string} containerId - Container element ID
   */
  disposeChart(containerId) {
    if (this.chartPool.has(containerId)) {
      const { chart, container } = this.chartPool.get(containerId);

      if (chart) {
        chart.dispose();
      }

      // Stop observing
      if (container && this.resizeObserver) {
        this.resizeObserver.unobserve(container);
      }

      this.chartPool.delete(containerId);
    }
  }

  /**
   * Dispose all charts
   */
  disposeAll() {
    this.chartPool.forEach(({ chart, container }) => {
      if (chart) {
        chart.dispose();
      }
      if (container && this.resizeObserver) {
        this.resizeObserver.unobserve(container);
      }
    });
    this.chartPool.clear();
  }

  /**
   * Get common chart style configuration
   * @returns {object} Common style config
   */
  getCommonStyle() {
    return {
      grid: {
        left: '12%',
        right: '6%',
        bottom: '18%',
        top: '15%',
        containLabel: true
      },
      textStyle: {
        fontWeight: 'bold'
      }
    };
  }

  /**
   * Get common axis configuration
   * @param {string} axisType - Axis type ('category' or 'value')
   * @param {string} name - Axis name
   * @param {Array} data - Category data (optional)
   * @param {boolean} isXAxis - Is X axis (default: true)
   * @returns {object} Axis configuration
   */
  getAxisConfig(axisType = 'category', name = '', data = null, isXAxis = true) {
    const config = {
      name: name,
      nameTextStyle: {
        fontWeight: 'bold',
        fontSize: 14,
        padding: isXAxis ? [10, 0, 0, 0] : [0, 0, 0, 10]
      },
      nameGap: isXAxis ? 30 : 35,
      nameLocation: isXAxis ? 'center' : 'middle',
      axisLabel: {
        fontWeight: 'bold',
        fontSize: 10,
        interval: 0,
        rotate: 45,
        overflow: 'truncate',
        hideOverlap: false,
        formatter: function(value) {
          if (value && value.length > 8) {
            return value.substr(0, 8) + '...';
          }
          return value;
        }
      },
      axisLine: {
        lineStyle: {
          width: 1
        }
      },
      axisTick: {
        show: true
      },
      splitLine: {
        show: false
      }
    };

    if (axisType === 'category' && data) {
      config.type = 'category';
      config.data = data;
      const labelCount = data.length;
      const maxLabelWidth = Math.max(60, Math.floor(800 / labelCount) - 10);
      config.axisLabel.width = maxLabelWidth;
    } else if (axisType === 'value') {
      config.type = 'value';
    }

    return config;
  }

  /**
   * Get common mark line style
   * @returns {object} Mark line configuration
   */
  getCommonMarkLineStyle() {
    return {
      silent: true,
      symbol: 'none',
      lineStyle: {
        type: 'solid',
        width: 3
      },
      label: {
        show: true,
        position: 'end',
        fontWeight: 'bold',
        fontSize: 13
      }
    };
  }

  /**
   * Get indicator color based on value
   * @param {string} indicatorName - Indicator name
   * @param {number} value - Indicator value
   * @param {Array} allValues - All indicator values
   * @returns {string} Color hex code
   */
  getIndicatorColor(indicatorName, value, allValues) {
    if (indicatorName === '变动成本率') {
      return this.getStatusColor(value);
    }

    const positiveIndicators = ['边际贡献率', '年计划达成率'];
    const isPositive = positiveIndicators.includes(indicatorName);

    if (!allValues || allValues.length === 0) return '#333';

    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);

    if (maxValue === minValue) return '#0070c0';

    let normalizedPosition = (value - minValue) / (maxValue - minValue);
    if (!isPositive) normalizedPosition = 1 - normalizedPosition;

    if (normalizedPosition < 0.2) return '#c00000';
    else if (normalizedPosition < 0.4) return '#ffc000';
    else if (normalizedPosition < 0.6) return '#0070c0';
    else if (normalizedPosition < 0.8) return '#92d050';
    else return '#00b050';
  }

  /**
   * Get status color for values
   * @param {number} value - Value to check
   * @returns {string} Color hex code
   */
  getStatusColor(value) {
    if (value <= 91) return '#00b050';  // Good - green
    if (value <= 94) return '#ffc000';  // Warning - yellow
    return '#ff0000';                   // Danger - red
  }

  /**
   * Get display name for indicator
   * @param {string} originalName - Original name
   * @returns {string} Display name
   */
  getDisplayName(originalName) {
    const nameMap = {
      '已报告赔款占比': '赔款贡献度',
      '保费占比': '保费贡献度',
      '赔付率VS占比': '满期赔付率VS赔款贡献度'
    };
    return nameMap[originalName] || originalName;
  }

  /**
   * Calculate optimal label size
   * @param {Array} data - Data array
   * @param {number} containerWidth - Container width (optional)
   * @returns {number} Optimal font size
   */
  calculateOptimalLabelSize(data, containerWidth = null) {
    return calculateOptimalLabelSize(data, containerWidth);
  }

  /**
   * Generate indicator table HTML
   * @param {Array} data - Data array
   * @param {string} dimField - Dimension field name
   * @param {Array} indicators - Indicators to display
   * @returns {string} HTML string
   */
  generateIndicatorTable(data, dimField, indicators) {
    if (!data || data.length === 0) return '';

    let html = '<div class="indicator-table-container" style="margin-top: 20px; overflow-x: auto;">';
    html += '<table class="indicator-table" style="width: 100%; border-collapse: collapse; font-size: 12px;">';
    html += '<thead><tr style="background-color: #f5f5f5;">';
    html += `<th style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${dimField}</th>`;

    indicators.forEach(indicator => {
      let label = this.getDisplayName(indicator);
      if (indicator === '签单保费') label = '签单保费(万元)';
      html += `<th style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${label}</th>`;
    });

    html += '</tr></thead><tbody>';

    data.forEach(d => {
      html += '<tr>';
      html += `<td style="padding: 8px; border: 1px solid #ddd;">${d[dimField]}</td>`;

      indicators.forEach(indicator => {
        const value = d[indicator];
        const allValues = data.map(item => item[indicator]);
        const color = this.getIndicatorColor(indicator, value, allValues);

        const isPercentage = [
          '变动成本率', '费用率', '满期赔付率', '出险率',
          '年计划达成率', '边际贡献率', '保费占比', '已报告赔款占比'
        ].includes(indicator);

        let displayValue;
        if (isPercentage) {
          displayValue = `${formatRate(value)}%`;
        } else if (indicator === '签单保费') {
          displayValue = formatWanYuanFromYuan(value);
        } else {
          displayValue = formatInteger(value);
        }

        html += `<td style="padding: 8px; border: 1px solid #ddd; color: ${color}; font-weight: bold;">${displayValue}</td>`;
      });

      html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
  }
}

// Export singleton instance
export default new ChartService();
