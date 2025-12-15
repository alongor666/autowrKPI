/**
 * 静态报告生成器 - 将原Flask后端逻辑转换为前端JavaScript处理
 * 保持所有业务逻辑和计算规则完全一致
 */
class StaticReportGenerator {
    constructor() {
        // 业务配置数据
        this.businessMapping = null;
        this.yearPlans = null;
        this.thresholds = null;
        this.template = null;
        
        // 初始化配置数据
        this.initConfigs();
    }

    /**
     * 初始化配置数据
     */
    async initConfigs() {
        try {
            console.log('开始加载配置数据...');
            
            // 加载业务类型映射
            const mappingResponse = await fetch('./reference/business_type_mapping.json');
            if (!mappingResponse.ok) {
                throw new Error(`业务映射文件加载失败: ${mappingResponse.status}`);
            }
            const complexMapping = await mappingResponse.json();
            this.businessMapping = this.processBusinessMapping(complexMapping);
            console.log('业务映射加载成功:', this.businessMapping);
            
            // 加载年度计划
            const plansResponse = await fetch('./reference/year-plans.json');
            if (!plansResponse.ok) {
                throw new Error(`年度计划文件加载失败: ${plansResponse.status}`);
            }
            this.yearPlans = await plansResponse.json();
            console.log('年度计划加载成功:', this.yearPlans);
            
            // 加载阈值配置
            const thresholdsResponse = await fetch('./reference/thresholds.json');
            if (!thresholdsResponse.ok) {
                throw new Error(`阈值配置文件加载失败: ${thresholdsResponse.status}`);
            }
            this.thresholds = await thresholdsResponse.json();
            console.log('阈值配置加载成功:', this.thresholds);
            
            // 加载HTML模板
            const templateResponse = await fetch('./templates/四川分公司车险第49周经营分析模板.html');
            if (!templateResponse.ok) {
                throw new Error(`HTML模板文件加载失败: ${templateResponse.status}`);
            }
            this.template = await templateResponse.text();
            console.log('HTML模板加载成功');
            
        } catch (error) {
            console.error('配置数据加载失败:', error);
            // 不抛出错误，而是使用默认配置
            this.initDefaultConfigs();
        }
    }

    /**
     * 处理复杂的业务类型映射配置
     * @param {Object} complexMapping - 复杂的映射配置
     * @returns {Object} 简化的映射对象
     */
    processBusinessMapping(complexMapping) {
        const simpleMapping = {};
        
        // 处理主要业务类型
        if (complexMapping.business_types) {
            complexMapping.business_types.forEach(type => {
                simpleMapping[type.csv_raw_value] = type.category;
            });
        }
        
        // 处理兼容性映射
        if (complexMapping.compatibility_mappings) {
            complexMapping.compatibility_mappings.forEach(mapping => {
                simpleMapping[mapping.csv_raw_value] = 
                    complexMapping.business_types.find(t => t.ui_full_name === mapping.maps_to)?.category || "其他";
            });
        }
        
        console.log('业务映射处理完成:', simpleMapping);
        return simpleMapping;
    }

    /**
     * 初始化默认配置（当配置文件加载失败时使用）
     */
    initDefaultConfigs() {
        console.log('使用默认配置...');
        this.businessMapping = {
            "非营业客车新车": "非营业客车",
            "非营业客车旧车非过户": "非营业客车", 
            "非营业客车旧车过户": "非营业客车",
            "1吨以下非营业货车": "非营业货车",
            "1–2吨非营业货车": "非营业货车",
            "2吨以下营业货车": "营业货车",
            "2–9吨营业货车": "营业货车",
            "9–10吨营业货车": "营业货车",
            "10吨以上营业货车（普货）": "营业货车",
            "10吨以上营业货车（牵引）": "营业货车",
            "自卸车": "营业货车",
            "特种车": "营业货车",
            "其他营业货车": "营业货车",
            "摩托车": "其他",
            "出租车": "营业客车",
            "网约车": "营业客车"
        };
        
        this.yearPlans = {
            "2025": {
                "target_premium": 10000000,
                "target_growth": 0.1
            }
        };
        
        this.thresholds = {
            "成本率": {"warning": 0.15, "critical": 0.20},
            "赔付率": {"warning": 0.60, "critical": 0.70},
            "综合成本率": {"warning": 0.75, "critical": 0.85}
        };
        
        // 使用简单的默认模板
        this.template = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>经营分析报告</title>
            <script src="https://lib.baomitu.com/echarts/5.4.3/echarts.min.js" onerror="this.remove()"></script>
            <script src="https://cdn.bootcdn.net/ajax/libs/echarts/5.4.3/echarts.min.js" onerror="this.remove()"></script>
            <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
        </head>
        <body>
            <h1>经营分析报告</h1>
            <div id="main-content">
                <p>报告生成中...</p>
            </div>
            <script>
                window.reportData = {};
                console.log('报告数据已加载');
            </script>
        </body>
        </html>`;
    }

    /**
     * 生成报告主函数
     * @param {File} csvFile - 上传的CSV文件
     * @returns {Promise<string>} 生成的HTML报告
     */
    async generateReport(csvFile) {
        // 等待配置数据加载完成
        while (!this.businessMapping || !this.yearPlans || !this.thresholds || !this.template) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 解析CSV数据
        const csvData = await this.parseCSV(csvFile);
        
        // 处理数据（映射、计算、聚合）
        const processedData = this.processData(csvData);
        
        // 生成HTML报告
        const reportHtml = this.generateHTML(processedData);
        
        return reportHtml;
    }

    /**
     * 解析CSV文件
     * @param {File} file - CSV文件
     * @returns {Promise<Array>} 解析后的数据数组
     */
    parseCSV(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                skipEmptyLines: true,  // 跳过空行，避免解析错误
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error('CSV解析错误: ' + results.errors[0].message));
                    } else {
                        resolve(results.data.filter(row => Object.keys(row).length > 0));
                    }
                },
                error: (error) => {
                    reject(new Error('CSV文件读取失败: ' + error.message));
                }
            });
        });
    }

    /**
     * 处理数据 - 核心业务逻辑
     * @param {Array} csvData - 原始CSV数据
     * @returns {Object} 处理后的数据对象
     */
    processData(csvData) {
        console.log('开始处理CSV数据，数据行数:', csvData.length);

        // 将CSV数据转换为模板期望的DATA结构
        const dataStructure = this.transformToTemplateData(csvData);

        console.log('数据转换完成:', dataStructure);
        return dataStructure;
    }

    /**
     * 将CSV原始数据转换为模板期望的DATA结构
     * @param {Array} csvData - 原始CSV数据
     * @returns {Object} 模板期望的数据结构
     */
    transformToTemplateData(csvData) {
        // 字段映射（支持中英文字段名）
        const fieldMap = {
            org: ['third_level_organization', '三级机构'],
            premium: ['signed_premium_yuan', '签单保费'],
            maturedPremium: ['matured_premium_yuan', '满期保费'],
            claim: ['reported_claim_payment_yuan', '已报告赔款'],
            expense: ['expense_amount_yuan', '费用额'],
            policyCount: ['policy_count', '保单件数'],
            claimCount: ['claim_case_count', '赔案件数']
        };

        // 获取字段值的辅助函数
        const getField = (row, fieldNames) => {
            for (const name of fieldNames) {
                if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                    return parseFloat(row[name]) || 0;
                }
            }
            return 0;
        };

        // 按三级机构聚合数据
        const orgData = {};
        csvData.forEach(row => {
            let orgName = null;
            for (const field of fieldMap.org) {
                if (row[field]) {
                    orgName = row[field];
                    break;
                }
            }

            if (!orgName) return;

            if (!orgData[orgName]) {
                orgData[orgName] = {
                    签单保费: 0,
                    满期保费: 0,
                    已报告赔款: 0,
                    费用额: 0,
                    保单件数: 0,
                    赔案件数: 0
                };
            }

            orgData[orgName].签单保费 += getField(row, fieldMap.premium);
            orgData[orgName].满期保费 += getField(row, fieldMap.maturedPremium);
            orgData[orgName].已报告赔款 += getField(row, fieldMap.claim);
            orgData[orgName].费用额 += getField(row, fieldMap.expense);
            orgData[orgName].保单件数 += getField(row, fieldMap.policyCount);
            orgData[orgName].赔案件数 += getField(row, fieldMap.claimCount);
        });

        // 计算全局汇总
        let totalPremium = 0;
        let totalClaim = 0;
        Object.values(orgData).forEach(org => {
            totalPremium += org.签单保费;
            totalClaim += org.已报告赔款;
        });

        // 转换为数组并计算KPI
        const dataByOrg = Object.entries(orgData).map(([orgName, data]) => {
            const 满期赔付率 = data.满期保费 > 0 ? (data.已报告赔款 / data.满期保费) * 100 : 0;
            const 费用率 = data.签单保费 > 0 ? (data.费用额 / data.签单保费) * 100 : 0;
            const 变动成本率 = 满期赔付率 + 费用率;
            const 出险率 = data.保单件数 > 0 ? (data.赔案件数 / data.保单件数) * 100 : 0;
            const 案均赔款 = data.赔案件数 > 0 ? data.已报告赔款 / data.赔案件数 : 0;
            const 保费占比 = totalPremium > 0 ? (data.签单保费 / totalPremium) * 100 : 0;
            const 已报告赔款占比 = totalClaim > 0 ? (data.已报告赔款 / totalClaim) * 100 : 0;

            return {
                机构: orgName,
                签单保费: data.签单保费,
                满期保费: data.满期保费,
                已报告赔款: data.已报告赔款,
                费用额: data.费用额,
                保单件数: data.保单件数,
                赔案件数: data.赔案件数,
                满期赔付率: 满期赔付率,
                费用率: 费用率,
                变动成本率: 变动成本率,
                出险率: 出险率,
                案均赔款: 案均赔款,
                保费占比: 保费占比,
                已报告赔款占比: 已报告赔款占比,
                年计划达成率: 100  // 临时值，需要与年度计划数据关联
            };
        });

        // 按签单保费降序排序
        dataByOrg.sort((a, b) => b.签单保费 - a.签单保费);

        // 计算全局KPI
        const globalMaturedPremium = dataByOrg.reduce((sum, org) => sum + org.满期保费, 0);
        const global满期赔付率 = globalMaturedPremium > 0 ? (totalClaim / globalMaturedPremium) * 100 : 0;
        const totalExpense = dataByOrg.reduce((sum, org) => sum + org.费用额, 0);
        const global费用率 = totalPremium > 0 ? (totalExpense / totalPremium) * 100 : 0;
        const global变动成本率 = global满期赔付率 + global费用率;

        // 检测问题机构
        const problems = [];
        dataByOrg.forEach(org => {
            if (org.变动成本率 > 93) {
                problems.push(`${org.机构}(成本超标)`);
            }
            if (org.年计划达成率 < 95) {
                problems.push(`${org.机构}(保费未达标)`);
            }
            if (org.费用率 > 18) {
                problems.push(`${org.机构}(费用率高)`);
            }
        });

        // 返回模板期望的数据结构
        return {
            summary: {
                签单保费: totalPremium,
                满期赔付率: global满期赔付率,
                费用率: global费用率,
                变动成本率: global变动成本率,
                已报告赔款: totalClaim
            },
            problems: problems.slice(0, 5),  // 只显示前5个问题
            dataByOrg: dataByOrg,
            // 临时使用相同的数据填充其他维度
            dataByCategory: dataByOrg,
            dataByBusinessType: dataByOrg
        };
    }

    /**
     * 业务类型映射
     * @param {Array} data - 原始数据
     * @returns {Array} 映射后的数据
     */
    mapBusinessTypes(data) {
        return data.map(row => {
            const mappedRow = { ...row };
            
            // 根据业务类型映射表进行映射
            if (row.业务类型 && this.businessMapping[row.业务类型]) {
                mappedRow.业务类型映射 = this.businessMapping[row.业务类型];
            }
            
            return mappedRow;
        });
    }

    /**
     * KPI计算
     * @param {Array} data - 映射后的数据
     * @returns {Array} 计算KPI后的数据
     */
    calculateKPIs(data) {
        return data.map(row => {
            const kpiRow = { ...row };
            
            // 计算基础KPI
            const premium = parseFloat(row.保费收入 || 0);
            const cost = parseFloat(row.变动成本 || 0);
            const claims = parseFloat(row.赔款支出 || 0);
            
            kpiRow.成本率 = cost / premium || 0;
            kpiRow.赔付率 = claims / premium || 0;
            kpiRow.综合成本率 = (cost + claims) / premium || 0;
            
            // 计算时间进度相关KPI
            const weekNum = parseInt(row.周次 || 1);
            kpiRow.时间进度 = weekNum / 52; // 假设52周一年
            
            return kpiRow;
        });
    }

    /**
     * 数据聚合
     * @param {Array} data - KPI数据
     * @returns {Object} 聚合结果
     */
    aggregateData(data) {
        const aggregated = {
            total: {
                保费收入: 0,
                变动成本: 0,
                赔款支出: 0,
                保单件数: 0
            },
            byBusinessType: {},
            byWeek: {}
        };

        data.forEach(row => {
            // 总量聚合
            aggregated.total.保费收入 += parseFloat(row.保费收入 || 0);
            aggregated.total.变动成本 += parseFloat(row.变动成本 || 0);
            aggregated.total.赔款支出 += parseFloat(row.赔款支出 || 0);
            aggregated.total.保单件数 += parseInt(row.保单件数 || 0);

            // 按业务类型聚合
            const businessType = row.业务类型映射 || row.业务类型 || '未知';
            if (!aggregated.byBusinessType[businessType]) {
                aggregated.byBusinessType[businessType] = {
                    保费收入: 0,
                    变动成本: 0,
                    赔款支出: 0,
                    保单件数: 0
                };
            }
            aggregated.byBusinessType[businessType].保费收入 += parseFloat(row.保费收入 || 0);
            aggregated.byBusinessType[businessType].变动成本 += parseFloat(row.变动成本 || 0);
            aggregated.byBusinessType[businessType].赔款支出 += parseFloat(row.赔款支出 || 0);
            aggregated.byBusinessType[businessType].保单件数 += parseInt(row.保单件数 || 0);

            // 按周聚合
            const week = row.周次 || '未知';
            if (!aggregated.byWeek[week]) {
                aggregated.byWeek[week] = {
                    保费收入: 0,
                    变动成本: 0,
                    赔款支出: 0,
                    保单件数: 0
                };
            }
            aggregated.byWeek[week].保费收入 += parseFloat(row.保费收入 || 0);
            aggregated.byWeek[week].变动成本 += parseFloat(row.变动成本 || 0);
            aggregated.byWeek[week].赔款支出 += parseFloat(row.赔款支出 || 0);
            aggregated.byWeek[week].保单件数 += parseInt(row.保单件数 || 0);
        });

        return aggregated;
    }

    /**
     * 生成汇总数据
     * @param {Object} aggregated - 聚合数据
     * @returns {Object} 汇总结果
     */
    generateSummary(aggregated) {
        const total = aggregated.total;
        
        return {
            总保费: total.保费收入,
            总成本: total.变动成本 + total.赔款支出,
            成本率: (total.变动成本 + total.赔款支出) / total.保费收入 || 0,
            保单件数: total.保单件数,
            平均保费: total.保费收入 / total.保单件数 || 0
        };
    }

    /**
     * 从CSV数据中智能提取动态信息（支持中英文字段）
     * @param {Array} csvData - 原始CSV数据
     * @returns {Object} 提取的信息
     */
    extractDynamicInfo(csvData) {
        if (!csvData || csvData.length === 0) {
            return {
                year: '2025',
                week: '未知',
                updateDate: null,
                company: '四川分公司',
                analysisMode: 'single',
                organizationCount: 0,
                organizations: [],
                title: '经营分析报告'
            };
        }

        const firstRow = csvData[0];

        // 字段映射表（中英文）
        const fieldMapping = {
            year: ['保单年度', 'policy_start_year', '年度', '年份'],
            week: ['周次', 'week_number', '周'],
            date: ['snapshot_date', '快照日期', '更新日期', '统计日期'],
            organization: ['机构', '三级机构', 'third_level_organization', '分公司', '机构名称'],
            secondOrg: ['二级机构', 'second_level_organization']
        };

        // 智能字段查找函数
        const findFieldValue = (possibleFields) => {
            for (const field of possibleFields) {
                if (firstRow[field] !== undefined && firstRow[field] !== null && firstRow[field] !== '') {
                    return firstRow[field];
                }
            }
            return null;
        };

        // 提取保单年度
        let year = '2025';
        const yearValue = findFieldValue(fieldMapping.year);
        if (yearValue) {
            year = String(yearValue).trim();
        }

        // 提取周次
        let week = '未知';
        const weekValue = findFieldValue(fieldMapping.week);
        if (weekValue) {
            week = String(weekValue).replace('第', '').replace('周', '').trim();
        }

        // 提取更新日期
        let updateDate = null;
        const dateValue = findFieldValue(fieldMapping.date);
        if (dateValue) {
            updateDate = String(dateValue).trim();
            // 格式化日期为 YYYY-MM-DD
            if (updateDate.includes('T')) {
                updateDate = updateDate.split('T')[0];
            }
        }

        // 提取并分析三级机构
        const orgField = fieldMapping.organization.find(f => firstRow[f] !== undefined);
        const organizations = new Set();

        csvData.forEach(row => {
            const org = row[orgField];
            if (org && org !== '' && org !== null && org !== undefined) {
                organizations.add(String(org).trim());
            }
        });

        const organizationList = Array.from(organizations);
        const organizationCount = organizationList.length;

        // 判断分析模式
        let analysisMode = 'single';  // single: 单机构分析, multi: 多机构对比
        let company = '四川分公司';

        if (organizationCount === 1) {
            analysisMode = 'single';
            company = organizationList[0];
        } else if (organizationCount > 1) {
            analysisMode = 'multi';
            // 多机构时，尝试使用二级机构名称
            const secondOrgValue = findFieldValue(fieldMapping.secondOrg);
            company = secondOrgValue ? String(secondOrgValue).trim() + '分公司' : '四川分公司';
        }

        // 生成标题
        const modeText = analysisMode === 'single' ? '' : '（多机构对比）';
        const title = `${company}车险第${week}周经营分析${modeText}`;

        return {
            year: year,
            week: week,
            updateDate: updateDate,
            company: company,
            analysisMode: analysisMode,
            organizationCount: organizationCount,
            organizations: organizationList,
            title: title,
            // 添加详细信息用于调试
            detectedFields: {
                yearField: fieldMapping.year.find(f => firstRow[f] !== undefined),
                weekField: fieldMapping.week.find(f => firstRow[f] !== undefined),
                dateField: fieldMapping.date.find(f => firstRow[f] !== undefined),
                orgField: orgField
            }
        };
    }

    /**
     * 生成HTML报告
     * @param {Object} data - 处理后的数据
     * @returns {string} HTML报告
     */
    generateHTML(data) {
        // 提取动态信息
        const dynamicInfo = this.extractDynamicInfo(data.original);

        // 输出元数据到控制台，方便调试
        console.log('📊 提取的元数据:', dynamicInfo);
        console.log(`分析模式: ${dynamicInfo.analysisMode === 'single' ? '单机构分析' : '多机构对比'}`);
        console.log(`机构数量: ${dynamicInfo.organizationCount}`);
        console.log(`机构列表:`, dynamicInfo.organizations);

        let html = this.template;
        
        // 替换动态标题信息
        html = html.replace(/华安保险车险第49周经营分析 - 四川/g, dynamicInfo.title);
        html = html.replace(/第49周/g, `第${dynamicInfo.week}周`);
        html = html.replace(/2025/g, dynamicInfo.year);
        html = html.replace(/四川分公司/g, dynamicInfo.company);
        
        // 替换数据占位符
        html = html.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const keys = key.trim().split('.');
            let value = data;
            
            for (const k of keys) {
                value = value && value[k] !== undefined ? value[k] : match;
            }
            
            // 格式化数值
            if (typeof value === 'number') {
                return value.toLocaleString('zh-CN', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                });
            }
            
            return value || match;
        });
        
        // 注入数据到JavaScript变量
        // 替换模板中的占位DATA对象，确保使用CSV上传的实际数据
        const dataScript = `
        <script>
            // 从CSV上传生成的实际数据，替换模板中的占位符
            const DATA = ${JSON.stringify(data, null, 2)};
            window.reportData = DATA;  // 兼容性保留
            window.dynamicInfo = ${JSON.stringify(dynamicInfo, null, 2)};
            console.log('✅ DATA对象已从CSV数据注入，数据来源：用户上传');
            console.log('📊 数据预览:', DATA);
            // 触发图表渲染
            if (typeof renderCharts === 'function') {
                setTimeout(renderCharts, 100);
            }
        </script>`;

        // 替换模板中的占位DATA声明
        html = html.replace(/let DATA = \{\}; \/\/ 占位符.*?\n/, '');
        html = html.replace('</body>', dataScript + '</body>');
        
        return html;
    }
}