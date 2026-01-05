#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const errors = [];

function fileExists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function requireAny(label, relPaths) {
  const found = relPaths.find((relPath) => fileExists(relPath));
  if (!found) {
    errors.push(`[missing] ${label}: ${relPaths.join(' or ')}`);
  }
  return found;
}

function requireFile(relPath) {
  if (!fileExists(relPath)) {
    errors.push(`[missing] ${relPath}`);
    return false;
  }
  return true;
}

requireAny('CLAUDE.md', ['CLAUDE.md']);
requireAny('AGENTS.md', ['AGENTS.md', 'AGENT.md']);
requireAny('BACKLOG.md', ['BACKLOG.md']);
requireAny('PROGRESS.md', ['PROGRESS.md']);

requireFile('开发文档/00_index/DOC_INDEX.md');
requireFile('开发文档/00_index/CODE_INDEX.md');
requireFile('开发文档/00_index/PROGRESS_INDEX.md');

const coreDirs = [
  'js',
  'css',
  'reference',
  '开发文档/01_features',
  '开发文档/decisions',
  '开发文档/requirements',
  '开发文档/manuals',
  '开发文档/板块文档'
];

for (const dir of coreDirs) {
  const indexPath = path.join(dir, 'INDEX.md');
  if (!fileExists(indexPath)) {
    errors.push(`[missing] ${indexPath} (core directory index required)`);
  }
}

function parseBacklog(backlogPath) {
  if (!fileExists(backlogPath)) return;
  const content = fs.readFileSync(path.join(root, backlogPath), 'utf8');
  const lines = content.split(/\r?\n/);

  let headerIndex = -1;
  let headerCells = [];
  const parseRow = (line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null;
    return trimmed
      .slice(1, -1)
      .split('|')
      .map((cell) => cell.trim());
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.includes('|') && line.includes('ID') && line.includes('状态')) {
      const parsed = parseRow(line);
      if (!parsed) continue;
      headerIndex = i;
      headerCells = parsed;
      break;
    }
  }

  if (headerIndex === -1) {
    errors.push('[backlog] 未找到表头（需要包含 ID 与 状态 列）');
    return;
  }

  const separatorIndex = headerIndex + 1;
  const dataStart = separatorIndex + 1;
  const columnIndex = (name) => headerCells.indexOf(name);

  const idxId = columnIndex('ID');
  const idxStatus = columnIndex('状态');
  const idxDoc = columnIndex('关联文档');
  const idxCode = columnIndex('关联代码');
  const idxEvidence = columnIndex('验收/证据');

  const requiredColumns = [
    ['ID', idxId],
    ['状态', idxStatus],
    ['关联文档', idxDoc],
    ['关联代码', idxCode],
    ['验收/证据', idxEvidence]
  ];

  for (const [name, idx] of requiredColumns) {
    if (idx === -1) {
      errors.push(`[backlog] 缺少列：${name}`);
    }
  }

  if (errors.length > 0) return;

  for (let i = dataStart; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.includes('|')) continue;
    const cells = parseRow(line);
    if (!cells) continue;
    if (cells.length < headerCells.length) continue;

    const id = cells[idxId] || '(unknown)';
    const status = (cells[idxStatus] || '').toUpperCase();
    if (status !== 'DONE') continue;

    const doc = cells[idxDoc] || '';
    const code = cells[idxCode] || '';
    const evidence = cells[idxEvidence] || '';

    const isEmpty = (value) => value.trim().length === 0 || value.trim() === '-';
    const isNA = (value) => ['N/A', 'NA'].includes(value.trim().toUpperCase());

    if (isEmpty(doc) || isNA(doc)) {
      errors.push(`[backlog] ${backlogPath}:${i + 1} ${id} DONE 需填写关联文档`);
    }
    if (isEmpty(evidence) || isNA(evidence)) {
      errors.push(`[backlog] ${backlogPath}:${i + 1} ${id} DONE 需填写验收/证据`);
    }
    if (!isNA(code) && isEmpty(code)) {
      errors.push(`[backlog] ${backlogPath}:${i + 1} ${id} DONE 需填写关联代码或标记 N/A`);
    }
  }
}

parseBacklog('BACKLOG.md');

if (errors.length > 0) {
  for (const err of errors) {
    console.error(err);
  }
  console.error(`\n治理校验失败：${errors.length} 项问题`);
  process.exit(1);
}

console.log(`治理校验通过：核心文件与索引一致，核心目录 ${coreDirs.length} 项检查通过`);
