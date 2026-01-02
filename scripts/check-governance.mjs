#!/usr/bin/env node

/**
 * 治理一致性校验脚本 (Governance Consistency Checker)
 *
 * 用途: 检查项目治理文件的完整性与一致性
 *
 * 校验规则:
 * 1. 根目录必须存在: CLAUDE.md, AGENT.md, BACKLOG.md, PROGRESS.md
 * 2. 三大索引必须存在: DOC_INDEX.md, CODE_INDEX.md, PROGRESS_INDEX.md
 * 3. 核心层目录必须有INDEX.md（或在上级索引登记）
 * 4. BACKLOG.md中DONE状态的任务必须有完整证据
 *
 * 运行: node scripts/check-governance.mjs
 * 退出码: 0=通过, 1=失败
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 校验规则配置
const GOVERNANCE_FILES = [
  'CLAUDE.md',
  'AGENT.md',
  'BACKLOG.md',
  'PROGRESS.md'
];

const INDEX_FILES = [
  '开发文档/00_index/DOC_INDEX.md',
  '开发文档/00_index/CODE_INDEX.md',
  '开发文档/00_index/PROGRESS_INDEX.md'
];

const CORE_LAYER_DIRS = [
  { path: 'js', name: '前端核心代码层' },
  { path: 'reference', name: '配置与规则层' },
  { path: '开发文档/01_features', name: '功能特性文档层' },
  { path: '开发文档/板块文档', name: '板块设计文档层' },
  { path: '开发文档/decisions', name: '技术决策记录层' }
];

// 错误收集器
const errors = [];
const warnings = [];

/**
 * 规则1: 检查根目录治理文件存在性
 */
function checkRootGovernanceFiles() {
  logInfo('规则1: 检查根目录治理文件...');

  let passed = true;
  for (const file of GOVERNANCE_FILES) {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      logSuccess(`  ${file} 存在`);
    } else {
      logError(`  ${file} 不存在`);
      errors.push(`缺少根目录治理文件: ${file}`);
      passed = false;
    }
  }

  return passed;
}

/**
 * 规则2: 检查三大索引存在性
 */
function checkIndexFiles() {
  logInfo('规则2: 检查三大索引文件...');

  let passed = true;
  for (const file of INDEX_FILES) {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      logSuccess(`  ${file} 存在`);
    } else {
      logError(`  ${file} 不存在`);
      errors.push(`缺少索引文件: ${file}`);
      passed = false;
    }
  }

  return passed;
}

/**
 * 规则3: 检查核心层目录INDEX.md
 */
function checkCoreLayerIndexes() {
  logInfo('规则3: 检查核心层目录索引...');

  let passed = true;
  for (const dir of CORE_LAYER_DIRS) {
    const dirPath = path.join(ROOT_DIR, dir.path);
    const indexPath = path.join(dirPath, 'INDEX.md');

    if (!fs.existsSync(dirPath)) {
      logWarning(`  ${dir.name} (${dir.path}) 目录不存在，跳过检查`);
      warnings.push(`核心层目录不存在: ${dir.path}`);
      continue;
    }

    if (fs.existsSync(indexPath)) {
      logSuccess(`  ${dir.name} INDEX.md 存在`);
    } else {
      logError(`  ${dir.name} (${dir.path}/INDEX.md) 不存在`);
      errors.push(`缺少核心层索引: ${dir.path}/INDEX.md`);
      passed = false;
    }
  }

  return passed;
}

/**
 * 规则4: 检查BACKLOG.md中DONE任务的证据完整性
 */
function checkBacklogDoneEvidence() {
  logInfo('规则4: 检查BACKLOG.md中DONE任务的证据...');

  const backlogPath = path.join(ROOT_DIR, 'BACKLOG.md');
  if (!fs.existsSync(backlogPath)) {
    logError('  BACKLOG.md 不存在，无法检查DONE证据');
    return false;
  }

  const content = fs.readFileSync(backlogPath, 'utf-8');
  const lines = content.split('\n');

  let passed = true;
  let lineNumber = 0;
  let inTable = false;
  let headerFound = false;

  for (const line of lines) {
    lineNumber++;

    // 检测表格开始（包含 | ID | 的行）
    if (line.includes('| ID |') && line.includes('| 状态 |')) {
      headerFound = true;
      inTable = true;
      continue;
    }

    // 跳过表格分隔线（|---|---|）
    if (headerFound && line.match(/^\|\s*-+\s*\|/)) {
      continue;
    }

    // 检测表格结束（空行或非表格行）
    if (inTable && (!line.trim() || !line.startsWith('|'))) {
      inTable = false;
      continue;
    }

    // 解析表格行
    if (inTable && line.startsWith('|')) {
      const columns = line.split('|').map(col => col.trim()).filter(col => col);

      // 表格结构：ID | 提出时间 | 板块 | 归属对象 | 需求描述 | 优先级 | 状态 | 关联文档 | 关联代码 | 验收/证据
      if (columns.length >= 10) {
        const [id, , , , , , status, relatedDoc, relatedCode, evidence] = columns;

        // 跳过示例行
        if (id.startsWith('EXAMPLE-') || id === 'ID') {
          continue;
        }

        // 检查DONE状态的任务
        if (status === 'DONE') {
          const issues = [];

          // 检查关联文档
          if (!relatedDoc || relatedDoc === '-' || relatedDoc.trim() === '') {
            issues.push('关联文档为空');
          }

          // 检查关联代码（允许N/A）
          if (!relatedCode || relatedCode === '-') {
            if (relatedCode !== 'N/A') {
              issues.push('关联代码为空（若为纯文档任务，应标记为"N/A"）');
            }
          }

          // 检查验收/证据
          if (!evidence || evidence === '-' || evidence.trim() === '') {
            issues.push('验收/证据为空');
          }

          if (issues.length > 0) {
            logError(`  第${lineNumber}行 [${id}] 证据不完整: ${issues.join(', ')}`);
            errors.push(`BACKLOG.md:${lineNumber} - 任务${id}的DONE证据不完整`);
            passed = false;
          } else {
            log(`  ✓ 第${lineNumber}行 [${id}] 证据完整`, 'gray');
          }
        }
      }
    }
  }

  if (passed && headerFound) {
    logSuccess('  所有DONE任务的证据完整');
  } else if (!headerFound) {
    logWarning('  未找到待办清单表格，可能格式不正确');
  }

  return passed;
}

/**
 * 主函数
 */
function main() {
  log('\n═══════════════════════════════════════════', 'blue');
  log('  治理一致性校验 (Governance Check)', 'blue');
  log('═══════════════════════════════════════════\n', 'blue');

  const results = [
    checkRootGovernanceFiles(),
    checkIndexFiles(),
    checkCoreLayerIndexes(),
    checkBacklogDoneEvidence()
  ];

  const allPassed = results.every(r => r);

  // 输出总结
  log('\n═══════════════════════════════════════════', 'blue');
  log('  校验总结 (Summary)', 'blue');
  log('═══════════════════════════════════════════\n', 'blue');

  if (errors.length > 0) {
    logError(`发现 ${errors.length} 个错误:`);
    errors.forEach((err, idx) => {
      log(`  ${idx + 1}. ${err}`, 'red');
    });
  }

  if (warnings.length > 0) {
    logWarning(`\n发现 ${warnings.length} 个警告:`);
    warnings.forEach((warn, idx) => {
      log(`  ${idx + 1}. ${warn}`, 'yellow');
    });
  }

  if (allPassed && errors.length === 0) {
    log('\n');
    logSuccess('🎉 所有治理规则校验通过！');
    log('');
    process.exit(0);
  } else {
    log('\n');
    logError('❌ 治理规则校验失败，请修复上述错误。');
    log('');
    process.exit(1);
  }
}

// 运行主函数
main();
