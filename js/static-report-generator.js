/**
 * 静态报告生成器 (主线程)
 * 负责 UI 交互、Worker 通信和 HTML 模板注入
 */
class StaticReportGenerator {
    constructor() {
        this.businessMapping = null;
        this.yearPlans = null;
        this.thresholds = null;
        this.template = null;
        this.worker = null;
        
        // 初始化 Worker
        this.initWorker();
        // 初始化配置
        this.initConfigs();
        // 建立 Iframe 通信监听
        this.setupMessageListener();
    }

    setupMessageListener() {
        window.addEventListener('message', (event) => {
            // 确保只处理来自我们生成的 Iframe 的消息
            // 这里我们假设所有同源消息都是安全的，或者检查 event.source
            if (!event.data || !event.data.type) return;

            const { type, payload, messageId } = event.data;
            
            // 必须保留 sourceWindow 以便回复
            const sourceWindow = event.source;

            switch (type) {
                case 'filter_request':
                    this.handleFilterRequest(payload, sourceWindow, messageId);
                    break;
                case 'dimension_values_request':
                    this.handleDimensionValuesRequest(payload, sourceWindow, messageId);
                    break;
                case 'metadata_request':
                    this.handleMetadataRequest(payload, sourceWindow, messageId);
                    break;
            }
        });
    }

    handleFilterRequest(filterState, sourceWindow, messageId) {
        if (!this.worker) return;

        // 创建一次性监听器处理 Worker 回复
        const workerHandler = (e) => {
            const { type, payload } = e.data;
            if (type === 'filter_complete') {
                sourceWindow.postMessage({
                    type: 'filter_response',
                    messageId: messageId,
                    payload: payload, // 这是 filteredData (summary, dataByOrg...)
                    success: true
                }, '*');
                this.worker.removeEventListener('message', workerHandler);
            } else if (type === 'error') {
                sourceWindow.postMessage({
                    type: 'filter_response',
                    messageId: messageId,
                    error: payload,
                    success: false
                }, '*');
                this.worker.removeEventListener('message', workerHandler);
            }
        };

        this.worker.addEventListener('message', workerHandler);
        this.worker.postMessage({ type: 'filter_data', payload: { filterState } });
    }

    handleDimensionValuesRequest(payload, sourceWindow, messageId) {
        if (!this.worker) return;
        const { dimension, currentFilters } = payload;

        const workerHandler = (e) => {
            const { type, payload } = e.data;
            if (type === 'dimension_values_response') {
                sourceWindow.postMessage({
                    type: 'dimension_values_response',
                    messageId: messageId,
                    payload: payload,
                    success: true
                }, '*');
                this.worker.removeEventListener('message', workerHandler);
            }
        };

        this.worker.addEventListener('message', workerHandler);
        this.worker.postMessage({ type: 'get_dimension_values', payload: { dimension, currentFilters } });
    }

    handleMetadataRequest(payload, sourceWindow, messageId) {
        // 元数据目前主要是可用年份，可以通过 get_dimension_values 获取
        // 或者我们可以在 init_complete 时存储一些元数据
        // 这里简单处理，复用 get_dimension_values 获取 policy_start_year
        if (!this.worker) return;
        
        const workerHandler = (e) => {
            const { type, payload } = e.data;
            if (type === 'dimension_values_response') {
                sourceWindow.postMessage({
                    type: 'metadata_response',
                    messageId: messageId,
                    payload: { years: payload },
                    success: true
                }, '*');
                this.worker.removeEventListener('message', workerHandler);
            }
        };

        this.worker.addEventListener('message', workerHandler);
        // 获取所有年份，不带任何筛选
        this.worker.postMessage({ type: 'get_dimension_values', payload: { dimension: 'policy_start_year', currentFilters: null } });
    }

    initWorker() {
        this.worker = new Worker('js/data.worker.js');
        this.worker.onmessage = (e) => {
            const { type, payload } = e.data;
            switch (type) {
                case 'init_complete':
                    console.log('Worker initialized');
                    break;
                case 'error':
                    console.error('Worker error:', payload);
                    // 可以在 UI 显示错误
                    if (window.showError) window.showError(payload);
                    break;
                // 其他消息由 Promise resolve 处理
            }
        };
    }

    async initConfigs() {
        try {
            console.log('开始加载配置数据...');
            const [mappingRes, plansRes, thresholdsRes] = await Promise.all([
                fetch('./reference/business_type_mapping.json'),
                fetch('./reference/year-plans.json'),
                fetch('./reference/thresholds.json')
            ]);

            this.businessMapping = await mappingRes.json();
            this.yearPlans = await plansRes.json();
            this.thresholds = await thresholdsRes.json();
            
            // 发送配置给 Worker
            this.worker.postMessage({
                type: 'init',
                payload: {
                    businessMapping: this.processBusinessMapping(this.businessMapping), // 发送处理后的映射
                    yearPlans: this.yearPlans,
                    thresholds: this.thresholds
                }
            });

        } catch (error) {
            console.error('配置加载失败:', error);
            // 这里可以保留默认配置逻辑，或者提示用户
        }
    }

    processBusinessMapping(complexMapping) {
        // 复用之前的逻辑，将复杂配置转为简单映射
        const mapping = {};
        if (complexMapping.business_types) {
            complexMapping.business_types.forEach(type => {
                mapping[type.csv_raw_value] = {
                    category: type.category,
                    ui_short_label: type.ui_short_label
                };
            });
        }
        if (complexMapping.compatibility_mappings) {
            complexMapping.compatibility_mappings.forEach(compatMapping => {
                const canonical = complexMapping.business_types.find(
                    t => t.ui_full_name === compatMapping.maps_to
                );
                mapping[compatMapping.csv_raw_value] = {
                    category: canonical?.category || "其他",
                    ui_short_label: canonical?.ui_short_label || compatMapping.csv_raw_value
                };
            });
        }
        return mapping;
    }

    /**
     * 加载并处理数据（SPA模式）
     * 1. 发送文件给 Worker 解析
     * 2. 发送处理指令
     * 3. 返回处理后的数据对象
     */
    async loadData(file, onProgress) {
        return new Promise((resolve, reject) => {
            const handleMessage = (e) => {
                const { type, payload } = e.data;
                
                if (type === 'parse_complete') {
                    if (onProgress) onProgress('数据解析完成，正在计算...');
                    this.worker.postMessage({ type: 'process_data' });
                }
                else if (type === 'process_complete') {
                    if (onProgress) onProgress('计算完成，正在初始化仪表盘...');
                    this.worker.removeEventListener('message', handleMessage);
                    resolve(payload);
                }
                else if (type === 'error') {
                    this.worker.removeEventListener('message', handleMessage);
                    reject(new Error(payload));
                }
            };

            this.worker.addEventListener('message', handleMessage);

            if (onProgress) onProgress('正在解析文件...');
            this.worker.postMessage({ type: 'parse_file', payload: { file: file } });
        });
    }

    /**
     * 生成报告流程 (已弃用，保留接口防止报错，实际不应被调用)
     */
    async generateReport(csvFile, onProgress) {
        console.warn('generateReport is deprecated. Use loadData instead.');
        return "";
    }
}
