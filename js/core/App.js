/**
 * Main Application Orchestrator
 * Coordinates all services and components
 */
import EventBus from './EventBus.js';
import { EVENTS, TAB_CONFIG } from '../utils/constants.js';
import WorkerService from '../services/WorkerService.js';
import ChartService from '../services/ChartService.js';
import TabNavigation from '../components/TabNavigation.js';
import MetricCard from '../components/MetricCard.js';
import FilterPanel from '../components/FilterPanel.js';

class App {
  constructor() {
    // Data storage
    this.data = null;
    this.aggregatedData = null;

    // Services
    this.workerService = null;
    this.chartService = ChartService;

    // Components
    this.tabNavigation = null;
    this.metricCard = null;
    this.filterPanel = null;

    // State management
    this.filterState = {
      time: {
        applied: { year: null, weekStart: 1, weekEnd: 52 }
      },
      drill: {
        applied: [],  // Applied filters [{dimension, values}]
        draft: {}     // Draft state {dimensionKey: [selectedValues]}
      }
    };

    this.currentDimensions = {
      overview: 'kpi',
      premium: 'category',
      cost: 'org',
      loss: 'org',
      expense: 'org',
      roi: 'org'
    };

    this.currentSubTab = {
      loss: 'bubble'
    };

    this.activeDropdown = null;

    // Organization mode
    this.organizationMode = 'branch';  // 'branch', 'local', 'remote', 'single', 'multi'
  }

  /**
   * Initialize application
   * @param {object} initialData - Initial data from Worker
   * @param {Worker} workerInstance - Web Worker instance
   */
  async init(initialData, workerInstance) {
    console.log('[App] Initializing application...');
    this.data = initialData;
    this.aggregatedData = initialData;

    // Initialize Worker Service
    this.workerService = new WorkerService(workerInstance);

    // Setup event listeners
    this.setupEventListeners();

    // Initialize UI components (to be implemented in Phase 2)
    this.initializeUI();

    // Emit initialization complete event
    EventBus.emit(EVENTS.APP_INITIALIZED, { data: this.data });

    console.log('[App] Application initialized successfully');
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Filter events
    EventBus.on(EVENTS.FILTER_CHANGED, this.handleFilterChange.bind(this));
    EventBus.on(EVENTS.FILTER_RESET, this.handleFilterReset.bind(this));

    // Tab events
    EventBus.on(EVENTS.TAB_CHANGED, this.handleTabChange.bind(this));

    // Dimension events
    EventBus.on(EVENTS.DIMENSION_CHANGED, this.handleDimensionChange.bind(this));

    // Data events
    EventBus.on(EVENTS.DATA_REFRESH, this.handleDataRefresh.bind(this));

    // Chart events
    EventBus.on(EVENTS.CHART_RENDER, this.handleChartRender.bind(this));
  }

  /**
   * Initialize UI components
   */
  initializeUI() {
    console.log('[App] Initializing UI components...');

    // Initialize Tab Navigation
    try {
      this.tabNavigation = new TabNavigation();
      console.log('[App] TabNavigation initialized');
    } catch (e) {
      console.error('[App] Failed to initialize TabNavigation:', e);
    }

    // Initialize Metric Card
    try {
      this.metricCard = new MetricCard();
      this.metricCard.init();
      this.metricCard.render(this.data.summary);
      console.log('[App] MetricCard initialized');
    } catch (e) {
      console.error('[App] Failed to initialize MetricCard:', e);
    }

    // Initialize Filter Panel
    try {
      this.filterPanel = new FilterPanel(this.workerService);
      console.log('[App] FilterPanel initialized');
    } catch (e) {
      console.error('[App] Failed to initialize FilterPanel:', e);
    }

    console.log('[App] UI components initialized');
  }

  /**
   * Handle filter change event
   * @param {object} data - Event data with filterState
   */
  handleFilterChange(data) {
    console.log('[App] Filter changed:', data);
    this.filterState = data.filterState || data;

    // Trigger data refresh
    this.refreshData();
  }

  /**
   * Handle filter reset event
   */
  handleFilterReset() {
    console.log('[App] Filters reset');

    // Reset filter state
    this.filterState = {
      time: {
        applied: { year: null, weekStart: 1, weekEnd: 52 }
      },
      drill: {
        applied: [],
        draft: {}
      }
    };

    // Refresh data
    this.refreshData();
  }

  /**
   * Handle tab change event
   * @param {string} tabName - Tab name
   */
  handleTabChange(tabName) {
    console.log('[App] Tab changed to:', tabName);

    // Trigger chart render for new tab
    EventBus.emit(EVENTS.CHART_RENDER, { tab: tabName });
  }

  /**
   * Handle dimension change event
   * @param {object} data - Event data with tab and dimension
   */
  handleDimensionChange(data) {
    console.log('[App] Dimension changed:', data);

    const { tab, dimension } = data;
    this.currentDimensions[tab] = dimension;

    // Re-render chart with new dimension
    EventBus.emit(EVENTS.CHART_RENDER, { tab, dimension });
  }

  /**
   * Handle data refresh event
   * @param {object} data - Event data
   */
  async handleDataRefresh(data) {
    console.log('[App] Refreshing data...');

    try {
      // Apply filters via Worker
      const filteredData = await this.workerService.applyFilters(this.filterState);

      // Update aggregated data
      this.aggregatedData = filteredData;

      // Update MetricCard with new summary
      if (this.metricCard && filteredData.summary) {
        this.metricCard.render(filteredData.summary);
      }

      // Emit data updated event
      EventBus.emit(EVENTS.DATA_UPDATED, {
        data: this.aggregatedData,
        filterState: this.filterState
      });

      // Re-render current tab
      const activeTab = document.querySelector('.tab.active')?.dataset?.tab || 'overview';
      EventBus.emit(EVENTS.CHART_RENDER, { tab: activeTab });

    } catch (error) {
      console.error('[App] Failed to refresh data:', error);
      EventBus.emit(EVENTS.ERROR_OCCURRED, { source: 'app', error });
    }
  }

  /**
   * Handle chart render event
   * @param {object} data - Event data with tab and dimension
   */
  handleChartRender(data) {
    console.log('[App] Render chart for:', data);

    const { tab, dimension } = data;
    const actualDimension = dimension || this.currentDimensions[tab];

    // This will be implemented in Phase 2 with ChartService
    // For now, delegate to existing Dashboard object
    if (window.Dashboard && typeof window.Dashboard.renderChart === 'function') {
      window.Dashboard.renderChart(tab);
    }
  }

  /**
   * Refresh data with current filters
   */
  async refreshData() {
    return this.handleDataRefresh();
  }

  /**
   * Get current filter state
   * @returns {object} Current filter state
   */
  getFilterState() {
    return this.filterState;
  }

  /**
   * Get current dimension for a tab
   * @param {string} tab - Tab name
   * @returns {string} Dimension key
   */
  getCurrentDimension(tab) {
    return this.currentDimensions[tab];
  }

  /**
   * Set current dimension for a tab
   * @param {string} tab - Tab name
   * @param {string} dimension - Dimension key
   */
  setCurrentDimension(tab, dimension) {
    this.currentDimensions[tab] = dimension;
  }

  /**
   * Get current data
   * @returns {object} Current aggregated data
   */
  getData() {
    return this.aggregatedData || this.data;
  }

  /**
   * Get raw data
   * @returns {object} Raw data
   */
  getRawData() {
    return this.data;
  }
}

// Export singleton instance
export default new App();
