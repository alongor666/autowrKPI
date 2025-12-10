# Repository Guidelines

## 项目结构
- 根目录脚本：
  - `main.py`: 命令行入口，负责批量生成周报。
  - `app.py`: Web 应用入口，提供文件上传和报告预览功能。
- 模板：`template/`（主要模板：`四川分公司车险第49周经营分析模板.html`）。
- 数据：`data/`（存放CSV源数据）。
- 产出：`output/`（生成的HTML报告）。
- 核心逻辑：`src/` (`data_loader`, `mapper`, `kpi_calculator`, `report_generator`)。
- 配置参考：`reference/` (`thresholds.json`, `year-plans.json`, `business_type_mapping.json`)。

## 构建与开发命令
- 创建虚拟环境：`python3 -m venv venv && source venv/bin/activate`。
- 安装依赖：`pip install -r requirements.txt`（缺依赖时补充后安装）。
- 生成报告（命令行）：`python main.py`。
- 启动 Web 服务：`python app.py`。

## 代码风格与命名
- Python 使用 4 空格缩进，变量/函数采用 snake_case，函数保持短小单一职责。
- HTML/CSS/JS 保持现有语义化命名，CSS 类用 kebab-case；仅在模板需要时使用内联脚本。
- 避免新增全局变量，数据尽量通过参数传递。

## 测试指南
- 新增逻辑优先补充 `tests/` 下的 `test_*.py`（使用 `pytest`）；函数名以 `test_*` 开头。
- 数据驱动脚本可在 `data/` 提供小型样例并手动验证关键路径。

## 提交与合并请求
- 提交信息使用祈使句，聚焦单一变更（如 “Add weekly report generator”）。
- PR 需说明改动范围、涉及数据源、验证步骤；UI/模板变更附截图并关联相关任务。

## Agent 提示
- 修改前先确认 `template/`、`data/` 是否有最新格式或字段。
- 编辑 HTML 模板时务必保留脚本依赖的 ID 和 class，避免破坏图表渲染。
