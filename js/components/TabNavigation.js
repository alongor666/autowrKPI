/**
 * Tab Navigation Component
 * Handles tab switching and keyboard navigation
 */
import EventBus from '../core/EventBus.js';
import { EVENTS } from '../utils/constants.js';

class TabNavigation {
  constructor() {
    this.activeTab = null;
    this.tabs = [];
    this.init();
  }

  /**
   * Initialize tab navigation
   */
  init() {
    this.setupTabs();
    this.setupKeyboardNavigation();
  }

  /**
   * Setup tab click handlers
   */
  setupTabs() {
    const tabElements = document.querySelectorAll('.tab');
    this.tabs = Array.from(tabElements);

    tabElements.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Set initial active tab
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
      this.activeTab = activeTab.dataset.tab;
    }
  }

  /**
   * Switch to specific tab
   * @param {string} tabName - Tab name
   */
  switchTab(tabName) {
    if (this.activeTab === tabName) return;

    // Update tab active states
    this.tabs.forEach(tab => {
      const isActive = tab.dataset.tab === tabName;
      tab.classList.toggle('active', isActive);
    });

    // Update tab content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
      const isActive = content.id === `tab-${tabName}`;
      content.classList.toggle('active', isActive);
    });

    // Update internal state
    this.activeTab = tabName;

    // Emit tab change event
    EventBus.emit(EVENTS.TAB_CHANGED, tabName);

    console.log(`[TabNavigation] Switched to tab: ${tabName}`);
  }

  /**
   * Switch tab by index
   * @param {number} index - Tab index
   */
  switchTabByIndex(index) {
    if (index < 0 || index >= this.tabs.length) return;

    const targetTab = this.tabs[index];
    const tabName = targetTab.dataset.tab;
    this.switchTab(tabName);
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Don't handle if user is interacting with dropdown or input
      if (e.target.closest('.drill-dropdown-panel') || e.target.closest('input')) {
        return;
      }

      const activeTab = document.querySelector('.tab.active');
      const currentIndex = this.tabs.indexOf(activeTab);

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.switchTabByIndex(Math.max(0, currentIndex - 1));
          break;

        case 'ArrowRight':
          e.preventDefault();
          this.switchTabByIndex(Math.min(this.tabs.length - 1, currentIndex + 1));
          break;

        case ' ':
        case 'Enter':
          e.preventDefault();
          // Refresh current tab
          if (this.activeTab) {
            EventBus.emit(EVENTS.CHART_RENDER, { tab: this.activeTab });
          }
          break;
      }
    });
  }

  /**
   * Get current active tab
   * @returns {string} Active tab name
   */
  getActiveTab() {
    return this.activeTab;
  }

  /**
   * Get all tabs
   * @returns {Array} Tab elements
   */
  getAllTabs() {
    return this.tabs;
  }
}

export default TabNavigation;
