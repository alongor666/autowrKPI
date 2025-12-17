# F001 多源数据摄入与解析

## 功能概述
负责前端高性能数据文件（CSV/Excel/JSON）的上传、解析、清洗和标准化处理。

## 业务背景
系统需要处理高达 200MB 的业务数据文件。为了避免阻塞主线程导致 UI 卡顿，必须采用异步处理机制，并支持多种常见数据格式。

## 核心逻辑
1. **Web Worker 架构**: 所有繁重的数据解析和清洗工作均在 Worker 线程中执行。
2. **多格式支持**:
   - **CSV**: 使用 PapaParse 进行流式/分块解析。
   - **Excel**: 使用 SheetJS (xlsx) 将工作表转换为 JSON 对象。
   - **JSON**: 原生解析，支持标准数组格式。
3. **数据标准化**: 将不同格式的输入统一转换为系统内部标准 JSON 格式。

## 技术选型
- **PapaParse**: 业界标准的 CSV 解析库，性能优异。
- **SheetJS (xlsx)**: 强大的 Excel 文件处理库。
- **Web Worker**: 浏览器多线程技术。

## 使用示例
```javascript
// 主线程调用
worker.postMessage({ 
    type: 'parse_file', 
    payload: { file: fileObject } 
});

// 监听结果
worker.onmessage = (e) => {
    if (e.data.type === 'parse_complete') {
        console.log('Rows parsed:', e.data.payload.rowCount);
    }
};
```
