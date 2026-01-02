# 🎯 治理框架交付物清单

> **交付时间**: 2026-01-02
> **治理目标**: 建立索引一致性 + 需求/进展账本 + DONE证据链 + 最小校验机制

---

## ✅ 已交付文件清单（按类别）

### 📚 A) 三大入口索引（已创建）

| 文件路径 | 用途 | 状态 |
|---------|------|------|
| `/开发文档/00_index/DOC_INDEX.md` | 所有开发文档的导航枢纽 | ✅ 已创建 |
| `/开发文档/00_index/CODE_INDEX.md` | 所有源代码文件的导航地图 | ✅ 已创建 |
| `/开发文档/00_index/PROGRESS_INDEX.md` | 项目进展追踪与协作状态地图 | ✅ 已创建 |

**特点**: 短、清晰、指向唯一事实来源；避免长篇说明书。

---

### 📋 B) 两本账（已创建）

| 文件路径 | 用途 | 状态 |
|---------|------|------|
| `/BACKLOG.md` | 需求与任务待办清单（完整生命周期） | ✅ 已创建 |
| `/PROGRESS.md` | 里程碑与阻塞记录（状态机思维） | ✅ 已创建 |

**BACKLOG.md 字段**:
- ID、提出时间、板块、归属对象、需求描述、优先级、状态、关联文档、关联代码、验收/证据

**PROGRESS.md 记录原则**:
- 只记录关键节点（启动、里程碑、阻塞、完成）
- 避免叙事散文，状态机思维
- 每个里程碑必须说明"下一步做什么"

**状态机定义**:
```
PROPOSED → TRIAGED → IN_PROGRESS → BLOCKED → DONE / DEPRECATED
```

**DONE判定规则（缺一不可）**:
1. ✅ 关联文档路径：必填
2. ✅ 关联代码路径：涉及代码则必填，纯文档任务可标记 `N/A`
3. ✅ 验收/证据：PR链接 / commit哈希 / 对比报告路径 至少一种

---

### 📂 C) 核心层目录索引（已创建）

| 目录 | 索引文件路径 | 职责 | 状态 |
|------|-------------|------|------|
| `/js` | `/js/INDEX.md` | 前端核心代码层 | ✅ 已创建 |
| `/reference` | `/reference/INDEX.md` | 配置与规则层（唯一事实来源） | ✅ 已创建 |
| `/开发文档/01_features` | `/开发文档/01_features/INDEX.md` | 功能特性文档层 | ✅ 已创建 |
| `/开发文档/板块文档` | `/开发文档/板块文档/INDEX.md` | 板块设计文档层 | ✅ 已创建 |
| `/开发文档/decisions` | `/开发文档/decisions/INDEX.md` | 技术决策记录层（ADR） | ✅ 已创建 |

**核心层索引内容**:
1. 该目录职责（1-3行）
2. 关键入口文件/子模块链接
3. 与 DOC_INDEX/CODE_INDEX 的互链

---

### 🔧 D) CLAUDE.md 与 AGENT.md 加固（已完成）

| 文件路径 | 变更内容 | 状态 |
|---------|---------|------|
| `/CLAUDE.md` | 顶部新增"治理协作协议"：必经入口、护栏、交付协议 | ✅ 已加固 |
| `/AGENT.md` | 顶部新增"治理规范"：可读入口、必须回写位置、禁止触碰区域 | ✅ 已加固 |

**CLAUDE.md 结构**（已优化）:
- 🚨 **治理协作协议**（新增，优先级最高）
  - 必经入口：三大索引 + 两本账
  - 护栏：唯一事实来源 + 禁止操作
  - 交付协议：BACKLOG进账、DONE证据、索引更新、治理校验
- 📚 **项目概览**（保留原有内容）
- 🎯 **开发原则**（保留原有内容）
- ...（其余章节保持不变）

**AGENT.md 结构**（已优化）:
- 🚨 **治理规范**（新增，优先级最高）
  - 可读入口：Tier 1-3 分层入口
  - 必须回写位置：BACKLOG/PROGRESS/索引
  - 禁止触碰区域：唯一事实来源 + 禁止操作
- 1. **项目一句话**（保留原有内容）
- 2. **目录结构地图**（保留原有内容）
- ...（其余章节保持不变）

---

### 🔍 E) 最小一致性校验机制（已实现）

| 文件路径 | 类型 | 状态 |
|---------|------|------|
| `/scripts/check-governance.mjs` | Node.js ESM脚本 | ✅ 已创建 |
| `/.github/workflows/governance-check.yml` | GitHub Actions工作流 | ✅ 已创建（可选） |

**校验脚本实现的规则**:
1. ✅ 根目录存在: `CLAUDE.md`, `AGENT.md`, `BACKLOG.md`, `PROGRESS.md`
2. ✅ 三大索引存在: `DOC_INDEX.md`, `CODE_INDEX.md`, `PROGRESS_INDEX.md`
3. ✅ 核心层目录必须有 `INDEX.md`（或在上级索引登记）
4. ✅ BACKLOG.md中DONE任务必须有完整证据（关联文档、关联代码、验收/证据）

**运行方式**:
```bash
# 本地运行
node scripts/check-governance.mjs

# 退出码
# 0 = 通过
# 1 = 失败
```

**GitHub Actions集成**（可选）:
- 触发时机: PR/Push 到 main/master/develop 分支
- 检查路径: BACKLOG.md、PROGRESS.md、开发文档/**、js/**、reference/**
- 失败处理: 自动拦截PR合并

---

## 📊 交付物统计

| 类别 | 新增文件数 | 修改文件数 | 总计 |
|------|-----------|-----------|------|
| 索引系统 | 8 | 0 | 8 |
| 账本系统 | 2 | 0 | 2 |
| 协作协议 | 0 | 2 | 2 |
| 校验机制 | 2 | 0 | 2 |
| **总计** | **12** | **2** | **14** |

---

## 🔄 变更清单（详细）

### 新增文件（12个）

#### 索引系统（8个）
1. `/开发文档/00_index/DOC_INDEX.md` - 文档索引
2. `/开发文档/00_index/CODE_INDEX.md` - 代码索引
3. `/开发文档/00_index/PROGRESS_INDEX.md` - 进展索引
4. `/js/INDEX.md` - 前端核心代码层索引
5. `/reference/INDEX.md` - 配置与规则层索引
6. `/开发文档/01_features/INDEX.md` - 功能特性文档层索引
7. `/开发文档/板块文档/INDEX.md` - 板块设计文档层索引
8. `/开发文档/decisions/INDEX.md` - 技术决策记录层索引

#### 账本系统（2个）
9. `/BACKLOG.md` - 需求与任务待办清单
10. `/PROGRESS.md` - 项目进展日志

#### 校验机制（2个）
11. `/scripts/check-governance.mjs` - 治理一致性校验脚本
12. `/.github/workflows/governance-check.yml` - GitHub Actions工作流

### 修改文件（2个）

13. `/CLAUDE.md` - 顶部新增"治理协作协议"章节（原有内容保留）
14. `/AGENT.md` - 顶部新增"治理规范"章节（原有内容保留）

---

## ✅ 验收清单（如何确认交付物正常工作）

### 步骤1: 检查文件存在性

```bash
# 进入项目根目录
cd /home/user/autowrKPI

# 检查根目录文件
ls -lh BACKLOG.md PROGRESS.md CLAUDE.md AGENT.md

# 检查三大索引
ls -lh 开发文档/00_index/*.md

# 检查核心层索引
ls -lh js/INDEX.md reference/INDEX.md 开发文档/01_features/INDEX.md 开发文档/板块文档/INDEX.md 开发文档/decisions/INDEX.md

# 检查校验脚本
ls -lh scripts/check-governance.mjs .github/workflows/governance-check.yml
```

**预期结果**: 所有文件都应存在且大小 > 0

---

### 步骤2: 运行治理校验脚本

```bash
# 运行校验脚本
node scripts/check-governance.mjs
```

**预期输出**:
```
═══════════════════════════════════════════
  治理一致性校验 (Governance Check)
═══════════════════════════════════════════

ℹ️  规则1: 检查根目录治理文件...
✅   CLAUDE.md 存在
✅   AGENT.md 存在
✅   BACKLOG.md 存在
✅   PROGRESS.md 存在

ℹ️  规则2: 检查三大索引文件...
✅   开发文档/00_index/DOC_INDEX.md 存在
✅   开发文档/00_index/CODE_INDEX.md 存在
✅   开发文档/00_index/PROGRESS_INDEX.md 存在

ℹ️  规则3: 检查核心层目录索引...
✅   前端核心代码层 INDEX.md 存在
✅   配置与规则层 INDEX.md 存在
✅   功能特性文档层 INDEX.md 存在
✅   板块设计文档层 INDEX.md 存在
✅   技术决策记录层 INDEX.md 存在

ℹ️  规则4: 检查BACKLOG.md中DONE任务的证据...
✅   所有DONE任务的证据完整

═══════════════════════════════════════════
  校验总结 (Summary)
═══════════════════════════════════════════

✅ 🎉 所有治理规则校验通过！
```

**预期退出码**: 0（通过）

---

### 步骤3: 测试BACKLOG证据校验（破坏性测试）

```bash
# 1. 在BACKLOG.md中手动添加一个不完整的DONE条目
# 例如：| TEST-001 | 2026-01-02 | 测试 | - | 测试证据校验 | P1 | DONE | - | - | - |

# 2. 运行校验
node scripts/check-governance.mjs

# 预期：应该报错并退出码为1
```

**预期输出**:
```
❌ 第XX行 [TEST-001] 证据不完整: 关联文档为空, 关联代码为空（若为纯文档任务，应标记为"N/A"）, 验收/证据为空
...
❌ 治理规则校验失败，请修复上述错误。
```

**预期退出码**: 1（失败）

**恢复**: 删除测试条目后再次运行应通过

---

### 步骤4: 验证索引互链

```bash
# 随机选择一个核心层索引，检查互链
cat js/INDEX.md | grep "CODE_INDEX.md"
cat reference/INDEX.md | grep "CODE_INDEX.md"
cat 开发文档/01_features/INDEX.md | grep "DOC_INDEX.md"
```

**预期结果**: 每个核心层索引都应包含返回全局索引的链接

---

### 步骤5: 验证协作协议文档

```bash
# 检查CLAUDE.md顶部是否包含治理协议
head -60 CLAUDE.md | grep "治理协作协议"

# 检查AGENT.md顶部是否包含治理规范
head -70 AGENT.md | grep "治理规范"
```

**预期结果**: 应显示对应的章节标题

---

## 🔙 最小回滚策略

如果对治理改动不满意，可按以下步骤回滚：

### 方式1: Git回滚（推荐）

```bash
# 查看当前提交
git log --oneline -5

# 回滚到治理改动前的提交（假设前一个提交是 abc123）
git reset --hard abc123

# 强制推送（谨慎使用）
git push -f origin <branch-name>
```

### 方式2: 手动删除治理文件

```bash
# 删除新增的治理文件
rm -f BACKLOG.md PROGRESS.md
rm -rf 开发文档/00_index
rm -f js/INDEX.md reference/INDEX.md
rm -f 开发文档/01_features/INDEX.md 开发文档/板块文档/INDEX.md 开发文档/decisions/INDEX.md
rm -f scripts/check-governance.mjs
rm -f .github/workflows/governance-check.yml

# 恢复CLAUDE.md和AGENT.md（从Git历史）
git checkout HEAD~1 CLAUDE.md AGENT.md
```

### 方式3: 选择性保留

如果只想回滚部分内容：

```bash
# 只删除校验脚本（保留索引和账本）
rm -f scripts/check-governance.mjs
rm -f .github/workflows/governance-check.yml

# 只恢复CLAUDE.md和AGENT.md（保留其他治理文件）
git checkout HEAD~1 CLAUDE.md AGENT.md
```

---

## 📌 后续维护建议

### 日常工作流

1. **接到新任务**: 先在 `BACKLOG.md` 登记，状态为 `PROPOSED`
2. **开始工作**: 更新状态为 `IN_PROGRESS`，填写归属对象
3. **完成任务**: 填写关联文档、关联代码、验收/证据，状态改为 `DONE`
4. **记录里程碑**: 在 `PROGRESS.md` 记录关键节点
5. **更新索引**: 如有代码/文档变更，同步更新对应索引
6. **运行校验**: 提交前运行 `node scripts/check-governance.mjs`

### 定期维护

- **每周**: 清理 `BACKLOG.md` 中已完成的任务（移至"历史记录"区域）
- **每月**: 审查 `PROGRESS.md`，归档超过3个月的里程碑
- **每季度**: 审查所有索引的链接有效性，移除失效链接

### 索引更新触发条件

| 场景 | 必须更新的索引 |
|------|--------------|
| 修改 `/js/` 代码 | `js/INDEX.md`, `CODE_INDEX.md` |
| 修改 `/reference/` 配置 | `reference/INDEX.md`, 创建ADR |
| 新增功能 | `开发文档/01_features/INDEX.md`, `DOC_INDEX.md` |
| 新增板块 | `开发文档/板块文档/INDEX.md`, `DOC_INDEX.md` |
| 创建ADR | `开发文档/decisions/INDEX.md` |

---

## 🎓 快速上手指南

### 对于新加入的开发者

1. **第一步**: 阅读 `CLAUDE.md` 顶部的"治理协作协议"（5分钟）
2. **第二步**: 浏览三大索引：`DOC_INDEX.md`, `CODE_INDEX.md`, `PROGRESS_INDEX.md`（10分钟）
3. **第三步**: 查看 `BACKLOG.md` 了解当前待办任务（5分钟）
4. **第四步**: 阅读 `AGENT.md` 了解禁止触碰区域（5分钟）
5. **第五步**: 运行 `node scripts/check-governance.mjs` 熟悉校验流程（2分钟）

**总耗时**: ~30分钟即可上手

### 对于AI Agent

1. **必读**: `AGENT.md` 顶部的"治理规范"
2. **必经**: 三大索引 + 两本账
3. **必做**: 任务完成后更新BACKLOG和PROGRESS
4. **必跑**: 提交前运行 `node scripts/check-governance.mjs`

---

**交付完成时间**: 2026-01-02
**维护者**: autowrKPI Governance Team
**下一步**: 根据验收清单确认所有交付物正常工作
