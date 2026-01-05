/**
 * Filter Panel Component
 * E-commerce style drill-down filters with dropdown support
 */
import EventBus from '../core/EventBus.js';
import { EVENTS, DIMENSION_CONFIG } from '../utils/constants.js';

class FilterPanel {
  constructor(workerService) {
    this.workerService = workerService;
    this.activeDropdown = null;
    this.currentFilters = {
      drill: { applied: [], draft: {} }
    };

    this.init();
  }

  /**
   * Initialize filter panel
   */
  init() {
    this.renderSelectors();
    this.setupEventListeners();
  }

  /**
   * Render dimension selector buttons
   */
  renderSelectors() {
    const container = document.getElementById('drill-selectors');
    if (!container) {
      console.warn('[FilterPanel] Drill selectors container not found');
      return;
    }

    container.innerHTML = '';

    DIMENSION_CONFIG.forEach(dimension => {
      const button = document.createElement('div');
      button.className = 'drill-selector';
      button.dataset.dimension = dimension.key;
      button.innerHTML = `
        <span class="btn-label">${dimension.label}</span>
        <span class="selector-count">全部</span>
        <span class="selector-arrow">▼</span>
      `;
      button.addEventListener('click', () => this.toggleDropdown(dimension.key));
      container.appendChild(button);
    });

    console.log('[FilterPanel] Selectors rendered');
  }

  /**
   * Toggle dropdown panel
   * @param {string} dimensionKey - Dimension key
   */
  toggleDropdown(dimensionKey) {
    const panel = document.getElementById('drill-dropdown-panel');
    const wasActive = this.activeDropdown === dimensionKey;

    // Close current dropdown
    if (this.activeDropdown) {
      this.closeDropdown();
      if (wasActive) return; // Just close, don't reopen
    }

    // Open new dropdown
    this.activeDropdown = dimensionKey;
    if (panel) {
      panel.style.display = 'block';
      this.loadDropdownValues(dimensionKey);
    }
  }

  /**
   * Close dropdown panel
   */
  closeDropdown() {
    const panel = document.getElementById('drill-dropdown-panel');
    if (panel) {
      panel.style.display = 'none';
    }
    this.activeDropdown = null;
  }

  /**
   * Load dropdown values from Worker
   * @param {string} dimensionKey - Dimension key
   */
  async loadDropdownValues(dimensionKey) {
    if (!this.workerService) {
      console.warn('[FilterPanel] WorkerService not available');
      return;
    }

    const listContainer = document.getElementById('drill-dropdown-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div style="padding: 20px; text-align: center;">加载中...</div>';

    try {
      const values = await this.workerService.getDimensionValues(
        dimensionKey,
        this.currentFilters
      );

      this.renderDropdownItems(dimensionKey, values);
    } catch (error) {
      console.error('[FilterPanel] Failed to load dimension values:', error);
      listContainer.innerHTML = '<div style="padding: 20px; color: red;">加载失败</div>';
    }
  }

  /**
   * Render dropdown items
   * @param {string} dimensionKey - Dimension key
   * @param {Array} values - Dimension values
   */
  renderDropdownItems(dimensionKey, values) {
    const listContainer = document.getElementById('drill-dropdown-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    const currentSelection = this.currentFilters.drill.draft[dimensionKey] || [];

    values.forEach(value => {
      const item = document.createElement('div');
      item.className = 'drill-dropdown-item';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = value;
      input.id = `drill-${dimensionKey}-${value}`;
      input.checked = currentSelection.includes(value);

      input.addEventListener('change', () => {
        this.handleValueSelection(dimensionKey, value, input.checked);
      });

      const label = document.createElement('label');
      label.htmlFor = input.id;
      label.textContent = value;

      item.appendChild(input);
      item.appendChild(label);
      listContainer.appendChild(item);
    });
  }

  /**
   * Handle value selection change
   * @param {string} dimensionKey - Dimension key
   * @param {string} value - Selected value
   * @param {boolean} checked - Whether checked
   */
  handleValueSelection(dimensionKey, value, checked) {
    if (!this.currentFilters.drill.draft[dimensionKey]) {
      this.currentFilters.drill.draft[dimensionKey] = [];
    }

    if (checked) {
      if (!this.currentFilters.drill.draft[dimensionKey].includes(value)) {
        this.currentFilters.drill.draft[dimensionKey].push(value);
      }
    } else {
      this.currentFilters.drill.draft[dimensionKey] =
        this.currentFilters.drill.draft[dimensionKey].filter(v => v !== value);
    }

    this.updateSelectorCount(dimensionKey);
  }

  /**
   * Update selector button count
   * @param {string} dimensionKey - Dimension key
   */
  updateSelectorCount(dimensionKey) {
    const selector = document.querySelector(`.drill-selector[data-dimension="${dimensionKey}"]`);
    if (!selector) return;

    const count = this.currentFilters.drill.draft[dimensionKey]?.length || 0;
    const countSpan = selector.querySelector('.selector-count');

    if (countSpan) {
      countSpan.textContent = count > 0 ? `已选${count}` : '全部';
    }
  }

  /**
   * Apply filters
   */
  applyFilters() {
    // Convert draft to applied
    this.currentFilters.drill.applied = Object.entries(this.currentFilters.drill.draft)
      .map(([dimension, values]) => ({ dimension, values }))
      .filter(item => item.values.length > 0);

    // Emit filter change event
    EventBus.emit(EVENTS.FILTER_CHANGED, this.currentFilters);

    // Close dropdown
    this.closeDropdown();

    console.log('[FilterPanel] Filters applied:', this.currentFilters.drill.applied);
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    this.currentFilters.drill = { applied: [], draft: {} };
    this.renderSelectors();
    this.closeDropdown();

    // Emit filter reset event
    EventBus.emit(EVENTS.FILTER_RESET);

    console.log('[FilterPanel] Filters reset');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Apply button
    const applyBtn = document.querySelector('.drill-action-btn.primary');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyFilters());
    }

    // Reset button
    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (this.activeDropdown && !e.target.closest('.drill-selector') && !e.target.closest('#drill-dropdown-panel')) {
        this.closeDropdown();
      }
    });
  }

  /**
   * Get current filter state
   * @returns {object} Current filter state
   */
  getFilterState() {
    return this.currentFilters;
  }

  /**
   * Set filter state
   * @param {object} filterState - Filter state to set
   */
  setFilterState(filterState) {
    this.currentFilters = filterState;
    this.renderSelectors();
  }

  /**
   * Update filters from external source
   * @param {object} newFilters - New filter state
   */
  updateFilters(newFilters) {
    if (newFilters.drill) {
      this.currentFilters.drill = newFilters.drill;
      this.renderSelectors();
    }
  }
}

export default FilterPanel;
