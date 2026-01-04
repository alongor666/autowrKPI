# AGENTS.md

## 统一入口
- 文档索引：/开发文档/00_index/DOC_INDEX.md
- 代码索引：/开发文档/00_index/CODE_INDEX.md
- 进展索引：/开发文档/00_index/PROGRESS_INDEX.md
- 需求账本：/BACKLOG.md
- 进展账本：/PROGRESS.md

## 角色与职责
### 架构/治理负责人
- 可读入口：DOC_INDEX、CODE_INDEX、PROGRESS_INDEX
- 必须回写：/BACKLOG.md、/PROGRESS.md、相关 INDEX.md
- 禁止触碰：/reference、/开发文档/板块文档/01_指标体系.md 的口径内容

### 前端开发
- 可读入口：/js/INDEX.md、/css/INDEX.md、/reference/INDEX.md
- 必须回写：涉及核心层目录时更新对应 INDEX.md，并在 /BACKLOG.md 登记
- 禁止触碰：/reference 的数据口径与阈值内容（仅引用）

### 数据/指标分析
- 可读入口：/reference/INDEX.md、/开发文档/板块文档/INDEX.md
- 必须回写：口径变更证据写入 /开发文档/decisions 并登记 /BACKLOG.md
- 禁止触碰：业务实现代码（/js、/css）

### 文档维护
- 可读入口：DOC_INDEX、/开发文档 各 INDEX.md
- 必须回写：对应目录 INDEX.md 与 /PROGRESS.md
- 禁止触碰：/reference 数据与业务实现代码
