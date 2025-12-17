// Web Worker for processing CSV data off the main thread

importScripts('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js');
importScripts('https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js');

let rawCSVData = null;
let businessMapping = null;
let yearPlans = null;
let thresholds = null;

// Handle messages from the main thread
self.onmessage = function(e) {
    const { type, payload } = e.data;

    try {
        switch (type) {
            case 'init':
                businessMapping = payload.businessMapping;
                yearPlans = payload.yearPlans;
                thresholds = payload.thresholds;
                self.postMessage({ type: 'init_complete' });
                break;

            case 'parse_csv':
            case 'parse_file':
                parseFile(payload.file);
                break;

            case 'process_data':
                if (!rawCSVData) throw new Error('No CSV data loaded');
                const processedData = processData(rawCSVData);
                self.postMessage({ type: 'process_complete', payload: processedData });
                break;

            case 'filter_data':
                if (!rawCSVData) throw new Error('No CSV data loaded');
                const filteredResult = applyFiltersAndRecalc(rawCSVData, payload.filterState);
                self.postMessage({ type: 'filter_complete', payload: filteredResult });
                break;

            case 'get_dimension_values':
                if (!rawCSVData) throw new Error('No CSV data loaded');
                const { dimension, currentFilters } = payload;
                const values = getDimensionValues(rawCSVData, dimension, currentFilters);
                self.postMessage({ type: 'dimension_values_response', payload: values });
                break;

            case 'get_raw_data_slice':
                // For performance, we might want to avoid sending huge data
                // But for now, we keep the original logic flow if possible
                // However, sending 200MB data back to main thread is bad.
                // We should only send what's needed.
                // If the main thread needs raw data for download/preview, we can send it.
                // But preferably we keep it here.
                break;
        }
    } catch (error) {
        self.postMessage({ type: 'error', payload: error.message });
    }
};

function parseFile(file) {
    if (file.name.toLowerCase().endsWith('.csv')) {
        parseCSV(file);
    } else if (file.name.toLowerCase().match(/\.xlsx?$/)) {
        parseExcel(file);
    } else if (file.name.toLowerCase().endsWith('.json')) {
        parseJSON(file);
    } else {
        self.postMessage({ type: 'error', payload: '不支持的文件格式: ' + file.name });
    }
}

function parseJSON(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            if (Array.isArray(json)) {
                rawCSVData = json;
                self.postMessage({ type: 'parse_complete', payload: { rowCount: rawCSVData.length } });
            } else {
                self.postMessage({ type: 'error', payload: 'JSON格式错误: 根对象必须是数组' });
            }
        } catch (err) {
            self.postMessage({ type: 'error', payload: 'JSON 解析失败: ' + err.message });
        }
    };
    reader.onerror = function(err) {
        self.postMessage({ type: 'error', payload: '文件读取失败: ' + err.message });
    };
    reader.readAsText(file);
}

function parseExcel(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            // defval: "" 确保空单元格为空字符串
            const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            
            // 过滤空行
            rawCSVData = json.filter(row => Object.keys(row).length > 0);
            self.postMessage({ type: 'parse_complete', payload: { rowCount: rawCSVData.length } });
        } catch (err) {
            self.postMessage({ type: 'error', payload: 'Excel 解析失败: ' + err.message });
        }
    };
    reader.onerror = function(err) {
        self.postMessage({ type: 'error', payload: '文件读取失败: ' + err.message });
    };
    reader.readAsArrayBuffer(file);
}

function parseCSV(file) {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: function(header) {
            // Remove BOM and clean up header names
            return header.replace(/^\uFEFF/, '').trim();
        },
        complete: function(results) {
            if (results.errors.length > 0) {
                self.postMessage({ type: 'error', payload: 'CSV Parsing Error: ' + results.errors[0].message });
            } else {
                // Filter empty rows and rows with empty first column
                rawCSVData = results.data.filter(row => {
                    const keys = Object.keys(row);
                    return keys.length > 0 && keys[0] !== '' && row[keys[0]];
                });
                console.log('CSV解析完成，数据行数:', rawCSVData.length);
                console.log('首行数据样例:', rawCSVData[0]);
                self.postMessage({ type: 'parse_complete', payload: { rowCount: rawCSVData.length } });
            }
        },
        error: function(error) {
            self.postMessage({ type: 'error', payload: 'CSV Parsing failed: ' + error.message });
        }
    });
}

// Reuse logic from StaticReportGenerator
// We need to copy the helper methods here or import them.
// Since we don't have modules setup easily without bundlers, we'll duplicate the logic for now
// or better, we can importScripts if we split the logic.
// For this task, I will include the core logic here.

function processData(csvData) {
    console.log('[Worker] 开始处理数据，行数:', csvData.length);

    // 1. Map business types
    const mappedData = mapBusinessTypes(csvData);
    console.log('[Worker] 业务类型映射完成');

    // 2. Global KPIs
    const globalKPIs = calculateKPIsForGroup(mappedData);
    console.log('[Worker] 全局KPI计算完成:', globalKPIs);
    const totalPremium = globalKPIs['签单保费'];
    const totalClaim = globalKPIs['已报告赔款'];
    
    // 3. Year Plans
    const planMap = loadYearPlans();
    
    // 4. Aggregations
    const dataByOrg = aggregateByDimension(mappedData, 'third_level_organization', '机构', planMap, totalPremium, totalClaim);
    const dataByCategory = aggregateByDimension(mappedData, 'customer_category_3', '客户类别', null, totalPremium, totalClaim);
    const dataByBusinessType = aggregateByDimension(mappedData, 'ui_short_label', '业务类型简称', null, totalPremium, totalClaim);
    
    // 5. Global Ratios
    const globalClaimRate = globalKPIs['满期赔付率'];
    const globalExpenseRate = globalKPIs['费用率'];
    const globalCostRate = globalKPIs['变动成本率'];
    
    // 6. Problem detection
    const problems = detectProblems(dataByOrg);
    
    // 7. Dynamic Info
    const dynamicInfo = extractDynamicInfo(csvData);

    return {
        original: {
            // We do NOT send back the full raw data to avoid memory cloning issues on large files
            // unless strictly requested. 
            // The template generation logic in main thread currently expects `data.original`.
            // We need to adjust this.
            // For now, we omit 'original' raw array and only send dynamic info.
            dynamicInfo: dynamicInfo
        },
        summary: {
            签单保费: totalPremium,
            满期赔付率: globalClaimRate,
            费用率: globalExpenseRate,
            变动成本率: globalCostRate,
            已报告赔款: totalClaim
        },
        problems: problems.slice(0, 5),
        dataByOrg: dataByOrg,
        dataByCategory: dataByCategory,
        dataByBusinessType: dataByBusinessType,
        thresholds: thresholds || {},
        dynamicInfo: dynamicInfo // Explicitly pass dynamic info
    };
}

function mapBusinessTypes(csvData) {
    return csvData.map(row => {
        // Optimization: Don't copy the whole row if not needed, but we need all fields for later.
        // For 200MB, we should be careful.
        // V8 engine handles string interning, so keys are fine.
        
        const businessType = row.business_type_category || row['业务类型分类'];
        let ui_short_label = businessType || '其他';
        let ui_category = '其他';

        if (businessType && businessMapping && businessMapping[businessType]) {
            ui_short_label = businessMapping[businessType].ui_short_label;
            ui_category = businessMapping[businessType].category;
        }

        // We modify the row in place to save memory, instead of creating a new object
        row.ui_short_label = ui_short_label;
        row.ui_category = ui_category;
        return row;
    });
}

function loadYearPlans() {
    if (!yearPlans || !yearPlans['年度保费计划']) {
        return new Map();
    }
    const planMap = new Map();
    const plans = yearPlans['年度保费计划'];
    for (const [orgName, premiumPlan] of Object.entries(plans)) {
        planMap.set(orgName, { premium: premiumPlan });
    }
    return planMap;
}

function calculateKPIsForGroup(groupData, plan = null) {
    const fieldMap = {
        premium: ['signed_premium_yuan', '签单保费'],
        maturedPremium: ['matured_premium_yuan', '满期保费'],
        claim: ['reported_claim_payment_yuan', '已报告赔款'],
        expense: ['expense_amount_yuan', '费用额'],
        policyCount: ['policy_count', '保单件数'],
        claimCount: ['claim_case_count', '赔案件数']
    };

    const getField = (row, fieldNames) => {
        for (const name of fieldNames) {
            const val = row[name];
            if (val !== undefined && val !== null && val !== '') {
                return parseFloat(val) || 0;
            }
        }
        return 0;
    };

    let sum_signed_premium = 0;
    let sum_matured_premium = 0;
    let sum_reported_claim = 0;
    let sum_expense = 0;
    let sum_policy_count = 0;
    let sum_claim_case_count = 0;

    // Use for loop for better performance than forEach
    for (let i = 0; i < groupData.length; i++) {
        const row = groupData[i];
        sum_signed_premium += getField(row, fieldMap.premium);
        sum_matured_premium += getField(row, fieldMap.maturedPremium);
        sum_reported_claim += getField(row, fieldMap.claim);
        sum_expense += getField(row, fieldMap.expense);
        sum_policy_count += getField(row, fieldMap.policyCount);
        sum_claim_case_count += getField(row, fieldMap.claimCount);
    }

    const safeDivide = (n, d) => (d === 0 || isNaN(d)) ? 0 : n / d;

    const claim_rate = safeDivide(sum_reported_claim, sum_matured_premium) * 100;
    const expense_rate = safeDivide(sum_expense, sum_signed_premium) * 100;
    const cost_rate = claim_rate + expense_rate;
    const claim_frequency = safeDivide(sum_claim_case_count, sum_policy_count) * 100;
    const average_claim = safeDivide(sum_reported_claim, sum_claim_case_count);

    let achievement_rate = null;
    if (plan && plan.premium && plan.premium > 0) {
        achievement_rate = safeDivide(sum_signed_premium, plan.premium) * 100;
    }

    return {
        签单保费: sum_signed_premium,
        满期保费: sum_matured_premium,
        已报告赔款: sum_reported_claim,
        费用额: sum_expense,
        保单件数: sum_policy_count,
        赔案件数: sum_claim_case_count,
        满期赔付率: claim_rate,
        费用率: expense_rate,
        变动成本率: cost_rate,
        出险率: claim_frequency,
        案均赔款: average_claim,
        年计划达成率: achievement_rate
    };
}

function aggregateByDimension(csvData, dimensionField, labelName, planMap, totalPremium, totalClaim) {
    const groups = {};
    for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        // Handle multiple possible field names for dimension
        let dimensionValue = row[dimensionField];
        
        // If dimensionField is actually an array of candidates (simple hack for now)
        // But here we pass specific key.
        // Exception: 'third_level_organization' might be '三级机构'
        if (!dimensionValue && dimensionField === 'third_level_organization') {
            dimensionValue = row['三级机构'] || row['机构'];
        }
        if (!dimensionValue && dimensionField === 'customer_category_3') {
            dimensionValue = row['客户类别'];
        }
        
        if (!dimensionValue) continue;

        if (!groups[dimensionValue]) {
            groups[dimensionValue] = [];
        }
        groups[dimensionValue].push(row);
    }

    const results = [];
    for (const [dimensionValue, groupData] of Object.entries(groups)) {
        const plan = planMap ? planMap.get(dimensionValue) : null;
        const kpis = calculateKPIsForGroup(groupData, plan);
        const premium_share = totalPremium > 0 ? (kpis['签单保费'] / totalPremium * 100) : 0;
        const claim_share = totalClaim > 0 ? (kpis['已报告赔款'] / totalClaim * 100) : 0;

        results.push({
            [labelName]: dimensionValue,
            ...kpis,
            保费占比: premium_share,
            已报告赔款占比: claim_share,
            年计划达成率: kpis['年计划达成率'] !== null ? kpis['年计划达成率'] : 100
        });
    }

    results.sort((a, b) => b.签单保费 - a.签单保费);
    return results;
}

function detectProblems(dataByOrg) {
    const th_cost = (thresholds?.['问题机构识别阈值']?.['变动成本率超标']) || 93;
    const th_premium = (thresholds?.['问题机构识别阈值']?.['年保费未达标']) || 95;
    const th_expense = (thresholds?.['问题机构识别阈值']?.['费用率超标']) || 18;

    const problems = [];
    dataByOrg.forEach(org => {
        if (org.变动成本率 > th_cost) {
            problems.push(`${org.机构}(成本超标)`);
        } else if (org.年计划达成率 > 0 && org.年计划达成率 < th_premium) {
            problems.push(`${org.机构}(保费未达标)`);
        }
        if (org.费用率 > th_expense) {
            problems.push(`${org.机构}(费用率高)`);
        }
    });
    return problems;
}

function extractDynamicInfo(csvData) {
    if (!csvData || csvData.length === 0) return {};
    const firstRow = csvData[0];
    
    // Simple extraction logic
    const findVal = (keys) => {
        for (const k of keys) {
            if (firstRow[k]) return firstRow[k];
        }
        return null;
    };

    let year = findVal(['保单年度', 'policy_start_year', '年度']) || '2025';
    let week = findVal(['周次', 'week_number']) || '未知';
    week = String(week).replace(/第|周/g, '').trim();

    // Org count
    const orgs = new Set();
    const orgKeys = ['机构', '三级机构', 'third_level_organization'];
    let orgKey = orgKeys.find(k => firstRow[k]);
    
    if (orgKey) {
        for (let i = 0; i < csvData.length; i++) {
            if (csvData[i][orgKey]) orgs.add(csvData[i][orgKey]);
        }
    }
    
    const orgList = Array.from(orgs);
    const mode = orgList.length > 1 ? 'multi' : 'single';
    let company = '四川分公司';
    if (mode === 'single' && orgList.length > 0) company = orgList[0];

    return {
        year, week, 
        organizationCount: orgList.length,
        organizations: orgList,
        analysisMode: mode,
        title: `${company}车险经营分析（保单年度${year}·第${week}周）`,
        company,
        // Extract dimension values for UI filters
        dimensionValues: extractDimensionValues(csvData)
    };
}

function extractDimensionValues(csvData) {
    const dimensions = [
        { key: 'third_level_organization', fields: ['third_level_organization', '三级机构', '机构'] },
        { key: 'customer_category_3', fields: ['customer_category_3', '客户类别'] },
        { key: 'ui_short_label', fields: ['ui_short_label', '业务类型简称', 'business_type_category'] },
        { key: 'policy_start_year', fields: ['policy_start_year', '保单年度', '年度'] },
        { key: 'week_number', fields: ['week_number', '周次'] }
    ];

    const values = {};
    dimensions.forEach(dim => {
        const set = new Set();
        csvData.forEach(row => {
            for (const field of dim.fields) {
                if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
                    set.add(String(row[field]).trim());
                    break;
                }
            }
        });
        values[dim.key] = Array.from(set).sort();
    });
    return values;
}

function getDimensionValues(data, dimensionKey, currentFilters) {
    let filtered = data;
    
    // Apply filters if provided (except for the current dimension itself, usually)
    // But for hierarchical filtering, we might want to apply all other filters.
    // For now, let's just apply time filters if present.
    if (currentFilters && currentFilters.time) {
        const { year, weekStart, weekEnd } = currentFilters.time;
        filtered = filtered.filter(row => {
            if (year) {
                const rowYear = row['policy_start_year'] || row['保单年度'] || row['年度'];
                if (String(rowYear) !== String(year)) return false;
            }
            const rowWeek = parseInt(row['week_number'] || row['周次'] || 0);
            if (rowWeek < weekStart || rowWeek > weekEnd) return false;
            return true;
        });
    }

    const dimensionConfigMap = {
        'third_level_organization': ['third_level_organization', '三级机构', '机构'],
        'customer_category_3': ['customer_category_3', '客户类别'],
        'ui_short_label': ['ui_short_label', '业务类型简称', 'business_type_category'],
        'policy_start_year': ['policy_start_year', '保单年度', '年度'],
        'week_number': ['week_number', '周次']
    };

    const fields = dimensionConfigMap[dimensionKey];
    if (!fields) return [];

    const values = new Set();
    for (let i = 0; i < filtered.length; i++) {
        const row = filtered[i];
        for (const field of fields) {
            if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
                values.add(String(row[field]).trim());
                break;
            }
        }
    }

    return Array.from(values).sort();
}

function applyFiltersAndRecalc(data, filterState) {
    let filtered = data;

    // 1. Time Filter
    if (filterState.time && filterState.time.applied) {
        const { year, weekStart, weekEnd } = filterState.time.applied;
        
        filtered = filtered.filter(row => {
            // Year check
            if (year) {
                const rowYear = row['policy_start_year'] || row['保单年度'] || row['年度'];
                if (String(rowYear) !== String(year)) return false;
            }
            // Week range check
            const rowWeek = parseInt(row['week_number'] || row['周次'] || 0);
            if (rowWeek < weekStart || rowWeek > weekEnd) return false;
            return true;
        });
    }

    // 2. Drill Filter
    if (filterState.drill && filterState.drill.applied && filterState.drill.applied.length > 0) {
        const dimensionConfigMap = {
            'third_level_organization': ['third_level_organization', '三级机构', '机构'],
            'customer_category_3': ['customer_category_3', '客户类别'],
            'ui_short_label': ['ui_short_label', '业务类型简称', 'business_type_category'],
            'policy_start_year': ['policy_start_year', '保单年度', '年度'],
            'week_number': ['week_number', '周次']
        };

        filtered = filtered.filter(row => {
            for (const condition of filterState.drill.applied) {
                const fields = dimensionConfigMap[condition.dimension];
                if (!fields) continue;

                let matched = false;
                for (const field of fields) {
                    const rowValue = String(row[field] || '').trim();
                    if (condition.values.includes(rowValue)) {
                        matched = true;
                        break;
                    }
                }
                if (!matched) return false;
            }
            return true;
        });
    }

    // 3. Recalculate Template Data
    // We reuse processData logic but we don't need to re-map business types if they are already mapped in rawCSVData
    // Actually, rawCSVData in memory is already mapped by `processData` -> `mapBusinessTypes`.
    // Wait, `processData` calls `mapBusinessTypes` which modifies rows in place (added ui_short_label).
    // So `rawCSVData` has these fields.
    // We can call `processData` again, but `mapBusinessTypes` is idempotent-ish (it overwrites).
    // But `processData` does `mapBusinessTypes(csvData)`.
    // Let's optimize: `processData` assumes raw input.
    // We should split `processData` into `prepareData` (once) and `aggregateData` (on filter).
    // But for now, calling `processData` on filtered subset is fine, just slightly redundant on mapping.
    
    return processData(filtered);
}
