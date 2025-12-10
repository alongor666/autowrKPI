# UI 样式与布局规范

## 全局
- 字体：`-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif`，正文字重 600。
- 颜色变量：主红 `#a02724`，成功绿 `#00b050`，预警黄 `#ffc000`，危险红 `#c00000`，深/中/浅灰 `#333/#666/#ccc`，背景渐变 `linear-gradient(135deg, #f5f7fa 0%, #e8ebef 100%)`。
- 阴影/圆角：基础阴影 `0 2px 12px rgba(0,0,0,0.08)`，hover 阴影 `0 4px 20px rgba(0,0,0,0.12)`；主圆角 12px，按钮 8-10px。
- 过渡：`all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`。

## 头部与标签
- 头部：白底 0.85，顶部粘性，标题 28px 主红，副标题 13px 中灰。
- Tabs：行内，hover 淡红，激活主红下边线且加粗。
- 子标签（损失暴露）：背景淡红容器，激活白底主红，常态中灰。

## 内容与卡片
- 容器：`max-width: 1400px`，左右 padding 40px（移动端 20px）。
- KPI 卡片：4 列，gap 16px，padding 28x24，白底 0.95，边框 1px rgba(0,0,0,0.04)，圆角 12px，hover 上移 2px+深阴影。
- 文本：label 13px/灰/600，value 48px/600/字距 -1.5，单位 18px/灰/600。
- 状态色：`status-good` 绿，`status-warning` 黄，`status-danger` 红。

## 按钮
- 维度切换容器：背景 rgba(160,39,36,0.08)，圆角 10px，padding 3px。
- 维度按钮：10x24，14px，字重500，hover 背景 rgba(160,39,36,0.12)，激活白底+主红+阴影 0 2px 6px。
- 子标签容器：背景 rgba(160,39,36,0.06)，圆角 9px，padding 3px；子标签 8x20，13px，hover rgba(160,39,36,0.1)，激活白底+主红+阴影。

## 图表容器
- `.chart-container`：白底 0.95，padding 32px，圆角 12px，阴影同卡片，hover 深阴影。
- `.chart`：宽 100%，高 500px（PPT 模式中自适应 flex，height auto）。
- 标题 18px/700/主红；正文 14px/700 左对齐。
- PPT 模式：外层 16:9 白底，padding 40px；内层 chart-container 透明无边框。
- 配色：主红为柱/线默认；阈值超标用红/黄/绿（>75%红，>60%黄，否则绿）。
- 轴标签：动态计算字号，范围 10-14px，字重加粗。

## 排版与间距
- 卡片间 16px，内容块下 20-30px；按钮间 4px。

## 响应式
- 768px 以下：KPI 卡片单列，tabs 可横向滚动，padding 20px。

## 状态与错误
- 错误横幅：浅红背景，深红文字，圆角 4px，默认隐藏；全局 `window.onerror` 显示。

## 结构顺序（默认）
1. 头部（标题+日期）
2. 主 tabs：overview → premium → cost → loss → expense
3. tab 内：维度按钮 → 子标签（如有） → 图表/卡片内容

## 不可变约束
- 保持现有类名/ID 与结构，以确保 JS 渲染和样式应用；调整样式时复用上述变量/尺寸，避免破坏布局与交互。
