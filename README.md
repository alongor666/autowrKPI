# 车险经营分析可视化系统

## 📋 项目简介

这是一个基于纯前端技术的车险经营数据分析可视化系统,支持 CSV/Excel 数据导入,提供多维度数据分析和图表展示。

**核心功能:**
- ✅ CSV/Excel 数据导入与解析
- ✅ 多维度数据聚合(客户类别、业务类型、三级机构)
- ✅ 交互式数据可视化仪表盘
- ✅ 下钻筛选和动态数据过滤
- ✅ 完全离线运行,数据本地处理

---

## 🚀 快速开始

### 方式一:本地快速启动(推荐)

**1. 启动本地服务器**
```bash
# 在项目根目录执行
python3 -m http.server 8000
```

**2. 访问应用**
```bash
# 在浏览器中打开
open http://localhost:8000
# 或直接访问: http://localhost:8000
```

**3. 导入数据**
- 将 CSV 或 Excel 文件拖拽到上传区域
- 或点击上传区域选择文件
- 系统将自动解析并生成可视化仪表盘

### 方式二:使用其他 Web 服务器

```bash
# 使用 Node.js http-server
npx http-server -p 8000

# 使用 PHP 内置服务器
php -S localhost:8000

# 使用 Live Server (VS Code 插件)
# 在 VS Code 中右键 index.html → Open with Live Server
```

### GitHub Pages部署

1. **推送代码到GitHub**
```bash
git add .
git commit -m "升级为静态部署"
git push origin main
```

2. **启用GitHub Pages**
- 进入仓库设置 → Pages
- Source: Deploy from a branch
- Branch: main / (root)
- 保存设置

3. **自动部署**
- GitHub Actions会自动构建和部署
- 部署完成后可通过 `https://[username].github.io/utoweKPI-py` 访问

## 📁 项目结构

```
utoweKPI-py/
├── index.html                      # 主应用入口页面
├── css/
│   └── dashboard.css               # 样式文件
├── js/
│   ├── static-report-generator.js  # 数据处理核心引擎
│   └── dashboard.js                # 仪表盘交互逻辑
├── assets/                         # 静态资源
├── reference/                      # 业务配置文件
│   ├── business_type_mapping.json  # 业务类型映射表
│   ├── thresholds.json             # KPI阈值配置
│   └── year-plans.json             # 年度计划数据
├── 开发文档/                       # 技术文档和特性说明
└── README.md                       # 本文件
```

## 🛠️ 技术栈

**前端框架**: 原生 JavaScript (无框架依赖)
**图表库**: ECharts 5.4.3
**数据处理**:
  - PapaParse 5.4.1 (CSV 解析)
  - SheetJS (Excel 解析)
**部署**: 静态托管 (GitHub Pages / 任意 Web 服务器)

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

### 年度计划数据
**文件**: `reference/year-plans.json`

存储各年度各周次的保费计划数据,用于计算进度达成率。

## 📊 功能特性

### ✅ 已实现功能
- [x] CSV文件上传和解析
- [x] 业务类型映射
- [x] KPI计算引擎
- [x] 数据聚合统计
- [x] HTML报告生成
- [x] 静态部署支持
- [x] 响应式设计
- [x] 拖拽上传

### 🎯 核心优势
1. **零服务器成本**: 完全静态化部署
2. **全球加速**: GitHub Pages CDN
3. **自动部署**: Git推送自动更新
4. **数据安全**: 数据仅在本地处理
5. **版本控制**: 所有变更可追溯

## 🔄 工作流程

### 开发流程
1. 修改代码或配置
2. 本地测试功能
3. 提交到Git仓库
4. 自动部署到GitHub Pages

### 维护流程
1. 更新配置文件
2. 修改业务逻辑
3. 更新文档索引
4. 推送更新

## 🛠️ 故障排除

### 常见问题

**Q: CSV文件无法解析？**
A: 检查文件编码格式，支持UTF-8和GBK

**Q: 图表不显示？**
A: 检查网络连接，确保ECharts库加载成功

**Q: 部署失败？**
A: 检查GitHub Actions权限设置

**Q: 数据计算错误？**
A: 检查配置文件格式和数据完整性

### 调试方法
1. 打开浏览器开发者工具
2. 查看Console错误信息
3. 检查Network请求状态
4. 验证数据格式正确性

## 📈 性能优化

### 前端优化
- 资源压缩和缓存
- 按需加载图表组件
- 优化大数据量处理

### 部署优化
- GitHub Pages缓存策略
- CDN加速
- 压缩传输

## 🔒 安全考虑

- 数据仅在本地处理，不上传到服务器
- 输入数据验证和过滤
- HTTPS强制访问
- XSS攻击防护

---

> 技术支持：查看 [开发文档](./docs/) 了解详细技术实现