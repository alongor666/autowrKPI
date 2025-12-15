#!/bin/bash
# 开发快捷命令
# 使用方法: source .dev-shortcuts.sh

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 快速提交（自动更新元数据）
function dev-commit() {
    local feature_id="$1"
    local message="$2"

    if [ -z "$feature_id" ] || [ -z "$message" ]; then
        echo "用法: dev-commit F006 '修复了某个bug'"
        return 1
    fi

    echo -e "${YELLOW}🔄 更新功能单元元数据...${NC}"

    # 更新 meta.json 日期
    local meta_file="开发文档/01_features/${feature_id}_*/meta.json"
    if ls $meta_file 1> /dev/null 2>&1; then
        python3 - <<'PY' $meta_file
import re
import sys
from datetime import date

path = sys.argv[1]
text = open(path, 'r', encoding='utf-8').read()
today = date.today().strftime('%Y-%m-%d')
updated = re.sub(r'("updated_at"\s*:\s*")[^"]*(")', rf'\1{today}\2', text)
open(path, 'w', encoding='utf-8').write(updated)
PY
        echo -e "${GREEN}✓ 已更新 meta.json${NC}"
    fi

    # 重新生成索引
    echo -e "${YELLOW}🔄 重新生成知识库索引...${NC}"
    python3 scripts/generate_docs_index.py 开发文档

    # 提交
    echo -e "${YELLOW}📝 提交变更...${NC}"
    git add .
    git commit -m "$message

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

    echo -e "${GREEN}✅ 完成！${NC}"
}

# 2. 快速推送（执行完整检查）
function dev-push() {
    echo -e "${YELLOW}🚀 准备推送...${NC}"

    # 确认未提交的变更
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}⚠️  发现未提交的变更：${NC}"
        git status -s
        read -p "是否先提交？(y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "请输入提交信息: " commit_msg
            git add .
            git commit -m "$commit_msg"
        fi
    fi

    # 推送（会自动执行 pre-push 检查）
    git push origin main
}

# 3. 添加开发记录
function dev-log() {
    local title="$1"

    if [ -z "$title" ]; then
        echo "用法: dev-log '功能描述'"
        return 1
    fi

    local log_file="开发文档/reports/DEVLOG.md"
    ${EDITOR:-vim} "$log_file"
}

# 4. 检查合规性
function dev-check() {
    echo -e "${YELLOW}🔍 执行合规性检查...${NC}"

    # 检查索引是否最新
    local last_meta=$(python3 - <<'PY'
import glob
import os

paths = glob.glob('开发文档/01_features/*/meta.json')
if not paths:
    raise SystemExit(0)

latest = max(paths, key=lambda p: os.path.getmtime(p))
print(latest)
PY
)
    local index_time=$(python3 -c 'import os; print(int(os.path.getmtime("开发文档/KNOWLEDGE_INDEX.md")))' 2>/dev/null || echo 0)

    if [ -n "$last_meta" ]; then
        local meta_time=$(python3 -c 'import os,sys; print(int(os.path.getmtime(sys.argv[1])))' "$last_meta" 2>/dev/null || echo 0)
        if [ "$meta_time" -gt "$index_time" ]; then
            echo -e "${YELLOW}⚠️  知识库索引需要更新${NC}"
            echo "运行: python3 scripts/generate_docs_index.py 开发文档"
        else
            echo -e "${GREEN}✓ 知识库索引已最新${NC}"
        fi
    fi

    # 检查今天是否有 DEVLOG 记录
    if ! grep -q "$(date +%Y-%m-%d)" 开发文档/reports/DEVLOG.md 2>/dev/null; then
        echo -e "${YELLOW}⚠️  今天还没有 DEVLOG 记录${NC}"
    else
        echo -e "${GREEN}✓ 今天已有 DEVLOG 记录${NC}"
    fi
}

# 5. 显示帮助
function dev-help() {
    cat <<'EOF'
开发快捷命令：

  dev-commit F006 "提交信息"   # 自动更新元数据并提交
  dev-push                     # 执行完整检查并推送
  dev-log "功能描述"            # 添加开发记录
  dev-check                    # 检查合规性
  dev-help                     # 显示本帮助

示例：
  source .dev-shortcuts.sh
  dev-commit F006 "🐛 修复气泡图标签显示问题"
  dev-push
EOF
}

echo -e "${GREEN}✅ 开发快捷命令已加载${NC}"
echo "运行 ${YELLOW}dev-help${NC} 查看可用命令"
