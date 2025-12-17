**大文件支持与性能优化方案 (Web Worker)**

1.  **架构变更**
    *   **后端清理**：彻底移除了 Flask 后端 (`app.py`, `src/` 等)，项目现在是纯静态的。
    *   **Web Worker 引入**：新建 `js/data.worker.js`，承载 CSV 解析、数据清洗、KPI 计算、多维聚合等 CPU 密集型任务。
    *   **主线程减负**：`js/static-report-generator.js` 重构为 Worker 客户端，只负责 UI 更新和 HTML 模板拼接。

2.  **大文件 (200MB+) 优化策略**
    *   **非阻塞解析**：利用 PapaParse 在 Worker 中解析 CSV，主线程 UI 不卡顿。
    *   **内存保护**：生成的 HTML 报告中**不再注入全量原始数据** (`window.rawCSVData` 为空数组)。这是为了防止 200MB CSV 导致生成的 HTML 文件过大（可能超过 500MB）从而崩溃。
    *   **权衡**：离线报告（下载后的 HTML）将无法使用基于原始数据的下钻功能，但仍保留所有预计算的 KPI 和图表。

3.  **文档更新**
    *   更新了 `F001` (CSV解析) 的 `meta.json` 和 `README.md`。
    *   重新生成了知识库索引 `KNOWLEDGE_INDEX.md`。

4.  **使用说明**
    *   直接在浏览器打开 `index.html` 即可使用。
    *   上传大文件时，控制台会显示解析和计算进度。

**验证**：
*   请尝试上传大 CSV 文件，观察页面是否流畅。
*   检查生成的报告是否包含正确的汇总数据。