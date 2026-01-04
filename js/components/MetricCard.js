/**
 * Metric Card Component
 * Renders KPI metric cards with status indicators
 */
import { formatRate, formatWanYuanFromYuan, getKPIStatusColor } from '../utils/formatters.js';

class MetricCard {
  constructor() {
    this.container = null;
  }

  /**
   * Initialize metric card component
   * @param {string} containerId - Container element ID
   */
  init(containerId = 'metric-cards-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`[MetricCard] Container not found: ${containerId}`);
    }
  }

  /**
   * Render KPI metrics from summary data
   * @param {object} summary - Summary data object
   */
  render(summary) {
    if (!summary) {
      console.warn('[MetricCard] No summary data provided');
      return;
    }

    // Set individual metric values with status
    this.setMetricValue('metric-cost-rate', summary.变动成本率, 94, 91, true);
    this.setMetricValue('metric-claim-rate', summary.满期赔付率, 75, 70, true);
    this.setMetricValue('metric-expense-rate', summary.费用率, 17, 14, true);

    // Set progress rate (special handling)
    this.setProgressRate(summary.保费时间进度达成率);

    // Set monetary values
    this.setMonetaryMetric('metric-premium', summary.签单保费);
    this.setMonetaryMetric('metric-claim', summary.已报告赔款);
    this.setCalculatedMetric('metric-expense', summary.签单保费, summary.费用率, 100);
    this.setCalculatedMetric('metric-margin', summary.签单保费, 100 - summary.变动成本率, 100);

    // Generate KPI alert
    this.generateKPIAlert(summary);
  }

  /**
   * Set metric value with status color
   * @param {string} elementId - Element ID
   * @param {number} value - Metric value
   * @param {number} dangerThreshold - Danger threshold
   * @param {number} warningThreshold - Warning threshold
   * @param {boolean} isHighBad - Whether high value is bad (default: true)
   */
  setMetricValue(elementId, value, dangerThreshold, warningThreshold, isHighBad = true) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = `${formatRate(value)}<span class="metric-unit">%</span>`;

    let statusClass = 'status-good';
    if (isHighBad) {
      if (value > dangerThreshold) statusClass = 'status-danger';
      else if (value > warningThreshold) statusClass = 'status-warning';
    } else {
      if (value < dangerThreshold) statusClass = 'status-danger';
      else if (value < warningThreshold) statusClass = 'status-warning';
    }

    element.className = `metric-value ${statusClass}`;
  }

  /**
   * Set progress rate with special status logic
   * @param {number} value - Progress rate value
   */
  setProgressRate(value) {
    if (value === undefined) return;

    const element = document.getElementById('metric-progress');
    if (!element) return;

    element.innerHTML = `${formatRate(value)}<span class="metric-unit">%</span>`;

    // Special logic: <95% danger, 95-100% warning, >=100% good
    const statusClass = getKPIStatusColor('progress', value);
    element.className = `metric-value ${statusClass}`;
  }

  /**
   * Set monetary metric value
   * @param {string} elementId - Element ID
   * @param {number} value - Value in Yuan
   */
  setMonetaryMetric(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element || value === undefined) return;

    element.innerHTML = `${formatWanYuanFromYuan(value)}<span class="metric-unit">万元</span>`;
  }

  /**
   * Set calculated monetary metric
   * @param {string} elementId - Element ID
   * @param {number} baseValue - Base value
   * @param {number} rate - Rate/percentage
   * @param {number} divisor - Divisor for rate
   */
  setCalculatedMetric(elementId, baseValue, rate, divisor = 100) {
    const element = document.getElementById(elementId);
    if (!element || baseValue === undefined || rate === undefined) return;

    const calculatedValue = baseValue * (rate / divisor);
    element.innerHTML = `${formatWanYuanFromYuan(calculatedValue)}<span class="metric-unit">万元</span>`;
  }

  /**
   * Generate KPI alert title
   * @param {object} summary - Summary data
   */
  generateKPIAlert(summary) {
    const alerts = [];

    // Check various KPI thresholds
    if (summary.保费时间进度达成率 !== undefined && summary.保费时间进度达成率 < 95) {
      alerts.push('保费达成进度落后');
    }

    if (summary.变动成本率 !== undefined && summary.变动成本率 > 94) {
      alerts.push('变动成本率异常');
    }

    if (summary.满期赔付率 !== undefined && summary.满期赔付率 > 75) {
      alerts.push('赔付率偏高');
    }

    if (summary.费用率 !== undefined && summary.费用率 > 17) {
      alerts.push('费用率超标');
    }

    // Display alert
    const alertElement = document.getElementById('kpi-alert-title');
    if (alertElement) {
      if (alerts.length > 0) {
        alertElement.textContent = alerts.join('、');
        alertElement.style.display = 'block';
      } else {
        alertElement.style.display = 'none';
      }
    }
  }

  /**
   * Update specific metric
   * @param {string} metricKey - Metric key
   * @param {number} value - New value
   */
  updateMetric(metricKey, value) {
    const elementId = `metric-${metricKey}`;
    const element = document.getElementById(elementId);

    if (!element) {
      console.warn(`[MetricCard] Metric element not found: ${elementId}`);
      return;
    }

    // Update based on metric type
    switch (metricKey) {
      case 'cost-rate':
        this.setMetricValue(elementId, value, 94, 91, true);
        break;
      case 'claim-rate':
        this.setMetricValue(elementId, value, 75, 70, true);
        break;
      case 'expense-rate':
        this.setMetricValue(elementId, value, 17, 14, true);
        break;
      case 'progress':
        this.setProgressRate(value);
        break;
      case 'premium':
      case 'claim':
        this.setMonetaryMetric(elementId, value);
        break;
      default:
        console.warn(`[MetricCard] Unknown metric key: ${metricKey}`);
    }
  }

  /**
   * Clear all metrics
   */
  clear() {
    const metrics = [
      'metric-cost-rate', 'metric-claim-rate', 'metric-expense-rate',
      'metric-progress', 'metric-premium', 'metric-claim',
      'metric-expense', 'metric-margin'
    ];

    metrics.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = '--<span class="metric-unit"></span>';
      }
    });

    // Hide alert
    const alertElement = document.getElementById('kpi-alert-title');
    if (alertElement) {
      alertElement.style.display = 'none';
    }
  }
}

export default MetricCard;
