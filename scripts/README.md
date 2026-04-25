# Git Hooks 自动化文档更新

## 概述

本项目配置了 git hooks，在每次提交代码时自动更新 `PROJECT.md` 项目说明文档。

## 文件结构

```
scripts/
├── hooks/
│   └── post-commit          # Git hook 源文件（被 git 跟踪）
├── update-project-md.js     # 文档更新脚本
├── install-hooks.js         # Hook 安装脚本
└── README.md                # 本文档
```

## 工作原理

### 1. 安装 Hook

运行 `pnpm install` 时，`prepare` 脚本会自动将 `scripts/hooks/` 下的 hook 文件复制到 `.git/hooks/` 目录。

```bash
pnpm install
# ↓
# prepare: node scripts/install-hooks.js
# ↓
# 复制 scripts/hooks/post-commit → .git/hooks/post-commit
```

### 2. post-commit hook

**触发时机**：每次 `git commit` 之后

**执行流程**：
```
git commit 完成
    ↓
post-commit hook 触发
    ↓
运行 scripts/update-project-md.js
    ↓
自动更新：
  - 最后更新日期
  - 项目统计（源文件数、代码行数）
  - 添加提交记录到更新日志
```

### 3. 更新脚本

文件位置：`scripts/update-project-md.js`

**功能**：
- 更新文档的"最后更新"日期
- 更新项目统计（源文件数、代码行数）
- 添加提交记录到更新日志

## 使用方式

### 自动模式（推荐）

正常提交代码即可，文档会自动更新：

```bash
git add .
git commit -m "feat: 添加新功能"
# post-commit hook 会自动更新 PROJECT.md
```

### 手动模式

如果需要手动更新文档：

```bash
pnpm update-docs
# 或
node scripts/update-project-md.js
```

### 手动安装 Hook

如果 hook 没有自动安装，可以手动运行：

```bash
node scripts/install-hooks.js
```

## 注意事项

1. **首次使用**：运行 `pnpm install` 后，`prepare` 脚本会自动安装 hook
2. **跳过 hook**：如果某次提交不想更新文档，使用 `git commit --no-verify`
3. **文档冲突**：如果 PROJECT.md 有冲突，手动解决后重新提交
4. **包含更新**：hook 更新文档后，运行 `git add PROJECT.md && git commit --amend --no-edit` 将更新包含到上次提交

## 自定义

如需修改更新逻辑，编辑 `scripts/update-project-md.js` 文件。
如需添加新的 hook，将文件放入 `scripts/hooks/` 目录即可。
