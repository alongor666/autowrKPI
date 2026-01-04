/**
 * Worker Service - Web Worker wrapper with Promise-based API
 * Provides clean interface for Worker communication
 */
import EventBus from '../core/EventBus.js';

class WorkerService {
  constructor(workerInstance = null) {
    this.worker = workerInstance || new Worker('js/workers/data.worker.js');
    this.messageQueue = new Map();
    this.messageId = 0;
    this.init();
  }

  init() {
    this.worker.onmessage = (e) => {
      const { type, payload, messageId } = e.data;

      switch (type) {
        case 'init_complete':
          console.log('[WorkerService] Worker initialized');
          break;

        case 'parse_complete':
          console.log('[WorkerService] File parsing complete');
          break;

        case 'process_complete':
          console.log('[WorkerService] Data processing complete');
          break;

        case 'error':
          console.error('[WorkerService] Worker error:', payload);
          EventBus.emit(EVENTS.ERROR_OCCURRED, { source: 'worker', error: payload });
          break;

        default:
          // Handle message responses
          if (messageId !== undefined && this.messageQueue.has(messageId)) {
            const { resolve, reject } = this.messageQueue.get(messageId);
            this.messageQueue.delete(messageId);

            if (type === 'error_response') {
              reject(new Error(payload));
            } else {
              resolve(payload);
            }
          }
      }
    };
  }

  /**
   * Send message to Worker and wait for response
   * @param {string} type - Message type
   * @param {object} payload - Message payload
   * @returns {Promise} Promise that resolves with Worker response
   */
  async sendMessage(type, payload = {}) {
    return new Promise((resolve, reject) => {
      const messageId = this.messageId++;

      this.messageQueue.set(messageId, { resolve, reject });

      // Set timeout for Worker response (30 seconds)
      const timeout = setTimeout(() => {
        this.messageQueue.delete(messageId);
        reject(new Error(`Worker timeout for message type: ${type}`));
      }, 30000);

      // Store timeout to clear it when response arrives
      this.messageQueue.set(messageId, {
        resolve: (data) => {
          clearTimeout(timeout);
          resolve(data);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      });

      this.worker.postMessage({ type, payload, messageId });
    });
  }

  /**
   * Initialize Worker with configuration
   * @param {object} config - Configuration object
   */
  async initialize(config) {
    return this.sendMessage('init', config);
  }

  /**
   * Parse CSV/Excel file
   * @param {File} file - File to parse
   * @returns {Promise<object>} Parse result
   */
  async parseFile(file) {
    return this.sendMessage('parse_file', { file });
  }

  /**
   * Process parsed data
   * @returns {Promise<object>} Processed data
   */
  async processData() {
    return this.sendMessage('process_data');
  }

  /**
   * Apply filters to data
   * @param {object} filterState - Filter state
   * @returns {Promise<object>} Filtered data
   */
  async applyFilters(filterState) {
    return this.sendMessage('filter_data', { filterState });
  }

  /**
   * Get dimension values
   * @param {string} dimension - Dimension key
   * @param {object} currentFilters - Current filter state
   * @returns {Promise<Array>} Dimension values
   */
  async getDimensionValues(dimension, currentFilters = null) {
    return this.sendMessage('get_dimension_values', { dimension, currentFilters });
  }

  /**
   * Get metadata
   * @returns {Promise<object>} Metadata object
   */
  async getMetadata() {
    // Get available years as metadata
    return this.getDimensionValues('policy_start_year', null);
  }

  /**
   * Load and process file (complete workflow)
   * @param {File} file - File to load
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<object>} Processed data
   */
  async loadData(file, onProgress = null) {
    return new Promise((resolve, reject) => {
      const handleMessage = (e) => {
        const { type, payload } = e.data;

        if (type === 'parse_complete') {
          if (onProgress) onProgress('数据解析完成，正在计算...');
          this.worker.postMessage({ type: 'process_data' });
        } else if (type === 'process_complete') {
          if (onProgress) onProgress('计算完成，正在初始化仪表盘...');
          this.worker.removeEventListener('message', handleMessage);
          resolve(payload);
        } else if (type === 'error') {
          this.worker.removeEventListener('message', handleMessage);
          reject(new Error(payload));
        }
      };

      this.worker.addEventListener('message', handleMessage);

      if (onProgress) onProgress('正在解析文件...');
      this.worker.postMessage({ type: 'parse_file', payload: { file } });
    });
  }

  /**
   * Terminate worker
   */
  terminate() {
    this.worker.terminate();
    this.messageQueue.clear();
  }
}

export default WorkerService;
