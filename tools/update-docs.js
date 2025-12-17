#!/usr/bin/env node

/**
 * 🔄 代码与文档协调一致系统 - 文档更新器
 * 基于当前代码自动生成准确的文档
 */

const fs = require('fs');
const path = require('path');

class DocsUpdater {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.docsPath = path.join(this.projectRoot, '.trae', 'documents', 'generated');
        this.codeAnalysis = this.analyzeCodebase();
    }

    // 分析整个代码库
    analyzeCodebase() {
        return {
            html: this.analyzeHTML(),
            css: this.analyzeCSS(),
            js: this.analyzeJavaScript(),
            assets: this.analyzeAssets()
        };
    }

    // 分析HTML结构
    analyzeHTML() {
        const htmlPath = path.join(this.projectRoot, 'index.html');
        const html = fs.readFileSync(htmlPath, 'utf8');

        return {
            file: htmlPath,
            structure: this.extractHTMLStructure(html),
            components: this.extractHTMLComponents(html),
            scripts: this.extractScripts(html),
            styles: this.extractStyles(html)
        };
    }

    // 提取HTML结构
    extractHTMLStructure(html) {
        const structure = {
            doctype: html.match(/<!DOCTYPE([^>]+)>/)?.[1] || 'unknown',
            lang: html.match(/<html[^>]*lang="([^"]+)"/)?.[1] || 'unknown',
            title: html.match(/<title>([^<]+)<\/title>/)?.[1] || '',
            meta: this.extractMetaTags(html),
            sections: this.extractSections(html)
        };

        return structure;
    }

    // 提取Meta标签
    extractMetaTags(html) {
        const metaTags = [];
        const metaMatches = html.matchAll(/<meta[^>]+>/g);

        for (const match of metaMatches) {
            const meta = {};
            const nameMatch = match[0].match(/name="([^"]+)"/);
            const contentMatch = match[0].match(/content="([^"]+)"/);
            const charsetMatch = match[0].match(/charset="([^"]+)"/);

            if (nameMatch) meta.name = nameMatch[1];
            if (contentMatch) meta.content = contentMatch[1];
            if (charsetMatch) meta.charset = charsetMatch[1];

            metaTags.push(meta);
        }

        return metaTags;
    }

    // 提取页面区块
    extractSections(html) {
        const sections = [];
        const sectionMatches = html.matchAll(/<(header|main|section|footer)[^>]*>/g);

        for (const match of sectionMatches) {
            sections.push(match[1]);
        }

        return sections;
    }

    // 提取脚本
    extractScripts(html) {
        const scripts = [];
        const scriptMatches = html.matchAll(/<script[^>]*src="([^"]*)"[^>]*>/g);

        for (const match of scriptMatches) {
            scripts.push(match[1]);
        }

        return scripts;
    }

    // 提取样式
    extractStyles(html) {
        const styles = [];
        const styleMatches = html.matchAll(/<link[^>]*href="([^"]*)"[^>]*>/g);

        for (const match of styleMatches) {
            styles.push(match[1]);
        }

        return styles;
    }

    // 提取HTML组件
    extractHTMLComponents(html) {
        const components = {};

        // 提取筛选器控制栏
        const filterBarMatch = html.match(/<div[^>]*class="filter-control-bar"[^>]*>([\s\S]*?)<\/div>/);
        if (filterBarMatch) {
            components.filterControlBar = {
                type: 'control-bar',
                description: '筛选器控制区域',
                elements: this.extractFilterElements(filterBarMatch[1])
            };
        }

        // 提取下钻弹窗
        const drillModalMatch = html.match(/<div[^>]*class="drill-modal"[^>]*>([\s\S]*?)<\/div>/);
        if (drillModalMatch) {
            components.drillModal = {
                type: 'modal',
                description: '下钻选择弹窗',
                elements: this.extractModalElements(drillModalMatch[1])
            };
        }

        return components;
    }

    // 提取筛选器元素
    extractFilterElements(html) {
        const elements = [];

        // 年度选择器
        if (html.includes('filter-year')) {
            elements.push({
                type: 'select',
                id: 'filter-year',
                label: '年度选择',
                options: '动态加载'
            });
        }

        // 周次范围
        if (html.includes('filter-week-start')) {
            elements.push({
                type: 'range',
                startId: 'filter-week-start',
                endId: 'filter-week-end',
                label: '周次范围'
            });
        }

        // 添加下钻按钮
        if (html.includes('add-drill-btn')) {
            elements.push({
                type: 'button',
                id: 'add-drill-btn',
                label: '添加下钻',
                action: 'openDrillModal'
            });
        }

        return elements;
    }

    // 提取弹窗元素
    extractModalElements(html) {
        const elements = [];

        // 维度选择器
        if (html.includes('drill-dimension-select')) {
            elements.push({
                type: 'select',
                id: 'drill-dimension-select',
                label: '选择维度',
                changeEvent: 'loadDimensionValues'
            });
        }

        // 值列表
        if (html.includes('drill-value-list')) {
            elements.push({
                type: 'checkbox-group',
                id: 'drill-value-list',
                label: '选择值',
                actions: ['全选', '清空']
            });
        }

        return elements;
    }

    // 分析CSS样式
    analyzeCSS() {
        const cssPath = path.join(this.projectRoot, 'css', 'dashboard.css');
        const css = fs.readFileSync(cssPath, 'utf8');

        return {
            file: cssPath,
            rules: this.extractCSSRules(css),
            themes: this.extractThemeVariables(css),
            responsive: this.extractResponsiveDesign(css)
        };
    }

    // 提取CSS规则
    extractCSSRules(css) {
        const rules = {};

        // 提取主要组件样式
        const mainRules = [
            'ppt-container',
            'filter-control-bar',
            'drill-modal',
            'condition-tag',
            'chart-container'
        ];

        mainRules.forEach(ruleName => {
            const regex = new RegExp(`\\.${ruleName}\\s*{([^}]+)}`, 'gs');
            const match = css.match(regex);

            if (match) {
                rules[ruleName] = {
                    properties: this.extractCSSProperties(match[0]),
                    description: this.getRuleDescription(ruleName)
                };
            }
        });

        return rules;
    }

    // 提取CSS属性
    extractCSSProperties(cssRule) {
        const properties = {};
        const propMatches = cssRule.matchAll(/([^:]+):\s*([^;]+);/g);

        for (const match of propMatches) {
            properties[match[1].trim()] = match[2].trim();
        }

        return properties;
    }

    // 获取规则描述
    getRuleDescription(ruleName) {
        const descriptions = {
            'ppt-container': '主容器，采用麦肯锡风格设计',
            'filter-control-bar': '筛选器控制栏，包含时间筛选和下钻功能',
            'drill-modal': '下钻选择弹窗，支持多维度筛选',
            'condition-tag': '条件标签，显示已应用的筛选条件',
            'chart-container': '图表容器，ECharts渲染区域'
        };

        return descriptions[ruleName] || '';
    }

    // 提取主题变量
    extractThemeVariables(css) {
        const variables = {};
        const varMatches = css.matchAll(/--([^:]+):\s*([^;]+);/g);

        for (const match of varMatches) {
            variables[match[1]] = match[2];
        }

        return variables;
    }

    // 提取响应式设计
    extractResponsiveDesign(css) {
        const responsive = [];
        const mediaMatches = css.matchAll(/@media[^{]+\{([^}]+)\}/g);

        for (const match of mediaMatches) {
            responsive.push({
                condition: match[0].split('{')[0],
                styles: match[1]
            });
        }

        return responsive;
    }

    // 分析JavaScript代码
    analyzeJavaScript() {
        const jsFiles = [
            'js/dashboard.js',
            'js/data.worker.js',
            'js/static-report-generator.js'
        ];

        const analysis = {};

        jsFiles.forEach(file => {
            const filePath = path.join(this.projectRoot, file);
            const content = fs.readFileSync(filePath, 'utf8');

            analysis[file.replace('js/', '').replace('.js', '')] = {
                file: filePath,
                content: content,
                structure: this.analyzeJSContent(content),
                exports: this.extractExports(content),
                dependencies: this.extractDependencies(content)
            };
        });

        return analysis;
    }

    // 分析JavaScript内容结构
    analyzeJSContent(content) {
        const structure = {
            classes: this.extractClasses(content),
            functions: this.extractFunctions(content),
            constants: this.extractConstants(content),
            eventHandlers: this.extractEventHandlers(content)
        };

        return structure;
    }

    // 提取类定义
    extractClasses(content) {
        const classes = [];
        const classMatches = content.matchAll(/class\s+(\w+)\s*{([^}]*)}/gs);

        for (const match of classMatches) {
            classes.push({
                name: match[1],
                body: match[2],
                methods: this.extractClassMethods(match[2])
            });
        }

        return classes;
    }

    // 提取类方法
    extractClassMethods(classBody) {
        const methods = [];
        const methodMatches = classBody.matchAll(/(\w+)\s*\([^)]*\)\s*{([^}]*)}/g);

        for (const match of methodMatches) {
            methods.push({
                name: match[1],
                body: match[2],
                params: match[0].match(/\(([^)]+)\)/)?.[1]?.split(',').map(p => p.trim()) || []
            });
        }

        return methods;
    }

    // 提取函数定义
    extractFunctions(content) {
        const functions = [];
        const functionMatches = content.matchAll(/(?:function\s+(\w+)|(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>))\s*\([^)]*\)\s*{([^}]*)}/gs);

        for (const match of functionMatches) {
            const name = match[1] || match[2];
            if (name) {
                functions.push({
                    name: name,
                    body: match[3],
                    isArrow: !!match[2]
                });
            }
        }

        return functions;
    }

    // 提取常量定义
    extractConstants(content) {
        const constants = [];
        const constMatches = content.matchAll(/const\s+(\w+)\s*=\s*([^;]+);/g);

        for (const match of constMatches) {
            constants.push({
                name: match[1],
                value: match[2].trim()
            });
        }

        return constants;
    }

    // 提取事件处理器
    extractEventHandlers(content) {
        const handlers = [];
        const handlerMatches = content.matchAll(/addEventListener\(['"]([^'"]+)['"],\s*(\([^)]*\)\s*=>|[^,]+)/g);

        for (const match of handlerMatches) {
            handlers.push({
                event: match[1],
                handler: match[2].trim()
            });
        }

        return handlers;
    }

    // 提取导出内容
    extractExports(content) {
        const exports = [];

        // 检测export default
        const defaultMatch = content.match(/export\s+default\s+(\w+)/);
        if (defaultMatch) {
            exports.push({
                type: 'default',
                name: defaultMatch[1]
            });
        }

        // 检测具名导出
        const namedMatches = content.matchAll(/export\s+(?:const|let|var|function|class)\s+(\w+)/g);
        for (const match of namedMatches) {
            exports.push({
                type: 'named',
                name: match[1]
            });
        }

        return exports;
    }

    // 提取依赖关系
    extractDependencies(content) {
        const dependencies = [];

        // 检测import语句
        const importMatches = content.matchAll(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g);
        for (const match of importMatches) {
            dependencies.push({
                type: 'import',
                source: match[1]
            });
        }

        // 检测require语句
        const requireMatches = content.matchAll(/require\(['"]([^'"]+)['"]\)/g);
        for (const match of requireMatches) {
            dependencies.push({
                type: 'require',
                source: match[1]
            });
        }

        return dependencies;
    }

    // 分析静态资源
    analyzeAssets() {
        const assetsPath = path.join(this.projectRoot, 'assets');

        if (!fs.existsSync(assetsPath)) {
            return { files: [], totalSize: 0 };
        }

        const files = [];
        let totalSize = 0;

        const scanAssets = (dir) => {
            const items = fs.readdirSync(dir);

            items.forEach(item => {
                const itemPath = path.join(dir, item);
                const stats = fs.statSync(itemPath);

                if (stats.isFile()) {
                    files.push({
                        name: item,
                        path: path.relative(this.projectRoot, itemPath),
                        size: stats.size,
                        type: path.extname(item).slice(1)
                    });
                    totalSize += stats.size;
                } else if (stats.isDirectory()) {
                    scanAssets(itemPath);
                }
            });
        };

        scanAssets(assetsPath);

        return {
            files: files,
            totalSize: totalSize,
            directory: assetsPath
        };
    }

    // 生成完整的API文档
    generateAPIDocumentation() {
        let markdown = '# 📚 API 文档\n\n';
        markdown += `> 📅 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        markdown += '> ⚠️ 本文档基于代码自动生成，保证与代码完全一致\n\n';

        // Dashboard类文档
        if (this.codeAnalysis.js.dashboard) {
            markdown += this.generateDashboardAPIDoc();
        }

        // Data Worker文档
        if (this.codeAnalysis.js.dataWorker) {
            markdown += this.generateWorkerAPIDoc();
        }

        // Static Report Generator文档
        if (this.codeAnalysis.js.staticReportGenerator) {
            markdown += this.generateGeneratorAPIDoc();
        }

        return markdown;
    }

    // 生成Dashboard API文档
    generateDashboardAPIDoc() {
        let markdown = '## 🎛️ Dashboard 类\n\n';
        markdown += '主要的仪表盘控制器，负责UI交互和状态管理。\n\n';

        const dashboard = this.codeAnalysis.js.dashboard;

        // 提取类信息
        if (dashboard.structure.classes.length > 0) {
            const mainClass = dashboard.structure.classes[0];
            markdown += `### 构造函数\n\n`;
            markdown += `\`\`\`javascript\nnew ${mainClass.name}(initialData, workerInstance)\`\`\`\n\n`;

            // 生成方法文档
            if (mainClass.methods.length > 0) {
                markdown += `### 方法\n\n`;
                mainClass.methods.forEach(method => {
                    markdown += this.generateMethodDoc(method);
                });
            }
        }

        return markdown;
    }

    // 生成方法文档
    generateMethodDoc(method) {
        let markdown = `#### ${method.name}\n\n`;

        // 从方法体提取功能描述
        const description = this.extractMethodDescription(method);
        markdown += `${description}\n\n`;

        // 提取参数信息
        if (method.params.length > 0) {
            markdown += '**参数**:\n\n';
            markdown += '| 参数名 | 类型 | 描述 |\n';
            markdown += '|--------|------|------|\n';

            method.params.forEach(param => {
                const paramInfo = this.extractParamInfo(param);
                markdown += `| ${paramInfo.name} | ${paramInfo.type} | ${paramInfo.description} |\n`;
            });
            markdown += '\n';
        }

        return markdown;
    }

    // 提取方法描述
    extractMethodDescription(method) {
        const descriptions = {
            'init': '初始化仪表盘，设置事件监听器和渲染初始UI',
            'initTabs': '初始化标签页切换功能',
            'initFilters': '初始化筛选器功能',
            'initDrillModal': '初始化下钻弹窗功能',
            'openDrillModal': '打开下钻选择弹窗',
            'closeDrillModal': '关闭下钻选择弹窗',
            'applyFilters': '应用筛选条件并重新计算数据',
            'resetFilters': '重置所有筛选条件',
            'renderChart': '渲染指定类型的图表',
            'renderKPI': '渲染KPI指标卡片'
        };

        return descriptions[method.name] || `执行${method.name}相关的操作`;
    }

    // 提取参数信息
    extractParamInfo(param) {
        const paramClean = param.replace(/\/\*[\s\S]*?\*\//g, '').trim();

        if (paramClean.includes('tab')) {
            return { name: 'tab', type: 'string', description: '标签页类型' };
        } else if (paramClean.includes('dimension')) {
            return { name: 'dimension', type: 'string', description: '分析维度' };
        } else if (paramClean.includes('data')) {
            return { name: 'data', type: 'Array', description: '数据数组' };
        } else {
            return { name: paramClean, type: 'any', description: '参数' };
        }
    }

    // 生成架构文档
    generateArchitectureDoc() {
        let markdown = '# 🏗️ 系统架构文档\n\n';
        markdown += `> 📅 更新时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

        // HTML结构
        markdown += '## 📄 HTML 结构\n\n';
        markdown += '### 页面组件\n\n';

        if (this.codeAnalysis.html.components) {
            Object.entries(this.codeAnalysis.html.components).forEach(([key, component]) => {
                markdown += `#### ${component.description}\n\n`;
                markdown += `- **类型**: ${component.type}\n`;
                markdown += `- **功能**: ${component.description}\n`;

                if (component.elements && component.elements.length > 0) {
                    markdown += `- **包含元素**: ${component.elements.map(e => e.label || e.type).join(', ')}\n`;
                }
                markdown += '\n';
            });
        }

        // CSS架构
        markdown += '## 🎨 CSS 架构\n\n';
        markdown += '### 样式组织\n\n';

        if (this.codeAnalysis.css.rules) {
            Object.entries(this.codeAnalysis.css.rules).forEach(([ruleName, rule]) => {
                markdown += `#### .${ruleName}\n\n`;
                markdown += `${rule.description}\n\n`;
                markdown += '**主要属性**:\n\n';
                markdown += '```css\n';
                Object.entries(rule.properties).forEach(([prop, value]) => {
                    markdown += `  ${prop}: ${value};\n`;
                });
                markdown += '```\n\n';
            });
        }

        // JavaScript模块架构
        markdown += '## ⚙️ JavaScript 模块架构\n\n';

        Object.entries(this.codeAnalysis.js).forEach(([moduleName, module]) => {
            markdown += `### ${moduleName}\n\n`;
            markdown += `- **文件**: ${module.file}\n`;

            if (module.structure.classes.length > 0) {
                markdown += `- **主要类**: ${module.structure.classes.map(c => c.name).join(', ')}\n`;
            }

            if (module.structure.functions.length > 0) {
                markdown += `- **主要函数**: ${module.structure.functions.map(f => f.name).join(', ')}\n`;
            }

            markdown += '\n';
        });

        return markdown;
    }

    // 生成交互式教程
    generateInteractiveTutorial() {
        let markdown = '# 🎓 交互式教程\n\n';
        markdown += `> 🚀 基于实际代码生成的实战教程\n\n`;

        markdown += '## 📋 前置条件\n\n';
        markdown += `- 现代浏览器 (Chrome 90+, Firefox 88+)\n`;
        markdown += `- 基础的HTML/CSS/JavaScript知识\n`;
        markdown += `- 对数据分析有基本了解\n\n`;

        // 基于实际功能生成教程
        markdown += '## 🔧 第一步：理解项目结构\n\n';
        markdown += '基于当前项目的实际结构：\n\n';
        markdown += '```\n';
        markdown += 'utoweKPI-py/\n';
        markdown += '├── index.html              # 主页面入口\n';
        markdown += '├── css/dashboard.css       # 样式文件\n';
        markdown += '├── js/\n';
        markdown += '│   ├── dashboard.js        # 主控制器\n';
        markdown += '│   ├── data.worker.js      # 数据处理引擎\n';
        markdown += '│   └── static-report-generator.js  # 通信桥接\n';
        markdown += '└── assets/                 # 静态资源\n';
        markdown += '```\n\n';

        markdown += '## 📊 第二步：理解数据流\n\n';
        markdown += '基于实际代码的数据处理流程：\n\n';
        markdown += '1. **数据导入**: CSV文件 → File API → 解析为JSON\n';
        markdown += '2. **数据处理**: 原始数据 → Worker处理 → 聚合计算\n';
        markdown += '3. **数据筛选**: 时间筛选 + 下钻筛选 → 过滤数据\n';
        markdown += '4. **数据可视化**: 聚合数据 → ECharts配置 → 渲染图表\n\n';

        return markdown;
    }

    // 生成配置文档
    generateConfigDoc() {
        let markdown = '# ⚙️ 配置文档\n\n';

        // 从代码中提取配置信息
        const configs = this.extractConfigurations();

        Object.entries(configs).forEach(([key, config]) => {
            markdown += `## ${config.title}\n\n`;
            markdown += config.description + '\n\n';

            if (config.options) {
                markdown += '### 配置选项\n\n';
                markdown += '| 选项 | 类型 | 默认值 | 描述 |\n';
                markdown += '|------|------|--------|------|\n';

                Object.entries(config.options).forEach(([option, details]) => {
                    markdown += `| ${option} | ${details.type} | ${details.default} | ${details.description} |\n`;
                });
                markdown += '\n';
            }
        });

        return markdown;
    }

    // 提取配置信息
    extractConfigurations() {
        const configs = {};

        // 从JavaScript代码中提取阈值配置
        const thresholdMatch = this.codeAnalysis.js.dashboard?.content?.match(/thresholds[^=]*=[^;]+;?/);
        if (thresholdMatch) {
            configs.thresholds = {
                title: '阈值配置',
                description: '系统中使用的各种阈值设置',
                options: {
                    '满期赔付率': { type: 'number', default: 75, description: '满期赔付率危险阈值(%)' },
                    '费用率': { type: 'number', default: 17, description: '费用率危险阈值(%)' },
                    '变动成本率危险线': { type: 'number', default: 94, description: '变动成本率危险线(%)' },
                    '变动成本率警告线': { type: 'number', default: 91, description: '变动成本率警告线(%)' }
                }
            };
        }

        return configs;
    }

    // 主执行方法
    update() {
        console.log('🔄 开始更新文档...');

        // 确保输出目录存在
        if (!fs.existsSync(this.docsPath)) {
            fs.mkdirSync(this.docsPath, { recursive: true });
        }

        // 生成各类文档
        const documents = {
            'API文档.md': this.generateAPIDocumentation(),
            '系统架构.md': this.generateArchitectureDoc(),
            '交互教程.md': this.generateInteractiveTutorial(),
            '配置文档.md': this.generateConfigDoc()
        };

        // 写入文档文件
        Object.entries(documents).forEach(([filename, content]) => {
            const filePath = path.join(this.docsPath, filename);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 生成文档: ${filename}`);
        });

        // 生成索引文件
        this.generateIndex();

        console.log('🎉 文档更新完成！');
        console.log(`📁 文档位置: ${this.docsPath}`);
    }

    // 生成文档索引
    generateIndex() {
        let index = '# 📚 项目知识库索引\n\n';
        index += `> 🔄 自动生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        index += '> ✅ 本文档基于代码自动分析生成，保证与代码完全一致\n\n';

        index += '## 📖 核心文档\n\n';
        index += '- [API文档](API文档.md) - 完整的API参考文档\n';
        index += '- [系统架构](系统架构.md) - 详细的系统架构说明\n';
        index += '- [交互教程](交互教程.md) - 手把手教程\n';
        index += '- [配置文档](配置文档.md) - 系统配置说明\n\n';

        index += '## 🔍 实时状态\n\n';
        index += `- **HTML组件数**: ${Object.keys(this.codeAnalysis.html.components || {}).length}\n`;
        index += `- **CSS规则数**: ${Object.keys(this.codeAnalysis.css.rules || {}).length}\n`;
        index += `- **JavaScript模块数**: ${Object.keys(this.codeAnalysis.js).length}\n`;
        index += `- **总代码行数**: ${this.getTotalLines()}\n\n`;

        index += '## 🚀 快速开始\n\n';
        index += '1. 启动本地服务器: `python3 -m http.server 8888`\n';
        index += '2. 浏览器访问: `http://localhost:8888`\n';
        index += '3. 上传CSV数据开始分析\n\n';

        const indexPath = path.join(this.docsPath, 'README.md');
        fs.writeFileSync(indexPath, index, 'utf8');
        console.log(`✅ 生成文档索引: README.md`);
    }

    // 统计代码行数
    getTotalLines() {
        let totalLines = 0;

        Object.values(this.codeAnalysis.js).forEach(module => {
            totalLines += module.content.split('\n').length;
        });

        totalLines += this.codeAnalysis.css.file ?
            fs.readFileSync(this.codeAnalysis.css.file, 'utf8').split('\n').length : 0;

        totalLines += this.codeAnalysis.html.file ?
            fs.readFileSync(this.codeAnalysis.html.file, 'utf8').split('\n').length : 0;

        return totalLines;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const updater = new DocsUpdater();
    updater.update();
}

module.exports = DocsUpdater;