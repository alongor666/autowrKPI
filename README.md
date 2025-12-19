# 车险经营分析可视化系统

## 📋 项目简介

这是一个基于纯前端技术的车险经营数据分析可视化系统,支持 CSV/Excel 数据导入,提供多维度数据分析和图表展示。

**核心功能:**
- ✅ CSV/Excel 数据导入与解析（Web Worker 多线程处理）
- ✅ 多维度数据聚合(客户类别、业务类型、三级机构)
- ✅ 交互式数据可视化仪表盘 (ECharts)
- ✅ 下钻筛选和动态数据过滤（电商式筛选体验）
- ✅ 完全离线运行,数据本地处理，安全可靠

---

## 🚀 快速开始

### 方式一: 本地快速启动 (推荐)

**1. 启动本地服务器**
```bash
# 在项目根目录执行
python3 -m http.server 8000
```

**2. 访问应用**
```bash
# 在浏览器中打开
http://localhost:8000
```

**3. 导入数据**
- 将 CSV 或 Excel 文件拖拽到上传区域
- 或点击上传区域选择文件
- 系统将自动解析并生成可视化仪表盘

### 方式二: GitHub Pages 在线使用

访问项目的 GitHub Pages 地址（如果已部署）：
`https://[username].github.io/utoweKPI-py`

---

## 📁 项目结构

```
.
├── index.html                      # 主应用入口页面 (SPA)
├── css/
│   └── dashboard.css               # 样式文件
├── js/
│   ├── static-report-generator.js  # 数据处理核心引擎
│   ├── dashboard.js                # 仪表盘交互逻辑
│   └── data.worker.js              # Web Worker 数据处理
├── assets/                         # 静态资源
├── reference/                      # 业务配置文件
│   ├── business_type_mapping.json  # 业务类型映射表
│   ├── thresholds.json             # KPI阈值配置
│   └── year-plans.json             # 年度计划数据
├── 开发文档/                       # 技术文档和特性说明
│   ├── manuals/                    # 用户手册
│   ├── requirements/               # 需求文档
│   ├── reports/                    # 开发与修复日志
│   ├── decisions/                  # 技术决策记录
│   └── 01_features/                # 功能详细说明
└── README.md                       # 本文件
```

## 🛠️ 技术栈

- **前端框架**: 原生 JavaScript (无框架依赖)
- **图表库**: ECharts 5.4.3 (CDN 加载)
- **数据处理**:
  - PapaParse 5.4.1 (CSV 解析)
  - SheetJS (Excel 解析)
  - Web Worker (后台数据聚合)
- **部署**: 静态托管 (GitHub Pages / 任意 Web 服务器)

## 🔧 配置文件说明

### 业务映射配置
**文件**: `reference/business_type_mapping.json`

定义客户类别到业务类型的映射关系,例如:
```json
{
  "新能源": "新车",
  "新能源营运": "新车",
  "传统能源": "续保"
}
```

### KPI阈值配置
**文件**: `reference/thresholds.json`

设置各项指标的目标阈值:
```json
{
  "变动成本率": 35.0,
  "满期赔付率": 60.0,
  "费用率": 8.0
}
```

## 📚 开发文档

本项目遵循 **MANIFESTO** 文档架构原则。

- **开发日志**: [开发文档/reports/DEVLOG.md](开发文档/reports/DEVLOG.md)
- **用户手册**: [开发文档/manuals/](开发文档/manuals/)
- **功能特性**: [开发文档/01_features/](开发文档/01_features/)

## 🔄 最近更新

- **2025-12-19**: 修复筛选器 Bug，支持新能源等新维度筛选。
- **2025-12-17**: 图表 UI 全面升级，优化下钻体验。
- **2025-12-15**: 完成纯前端数据聚合重构，移除对 Python 后端的依赖。

---
> 技术支持：查看 [开发文档](./开发文档/) 了解详细技术实现
