# Git Hooks 自动化文档更新

## 概述

本项目配置了 git hooks，在每次提交代码时自动更新 `PROJECT.md` 项目说明文档。

## 工作原理

### 1. pre-commit hook

文件位置：`.git/hooks/pre-commit`

**触发时机**：每次 `git commit` 之前

**执行流程**：
```
git commit
    ↓
pre-commit hook 触发
    ↓
运行 scripts/update-project-md.js
    ↓
检测 PROJECT.md 是否有变更
    ↓
如果有变更，自动 git add PROJECT.md
    ↓
继续完成提交
```

### 2. 更新脚本

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
# pre-commit hook 会自动更新 PROJECT.md
```

### 手动模式

如果需要手动更新文档：

```bash
pnpm update-docs
# 或
node scripts/update-project-md.js
```

## 注意事项

1. **首次使用**：运行 `pnpm install` 后，`prepare` 脚本会自动设置 hook 权限
2. **跳过 hook**：如果某次提交不想更新文档，使用 `git commit --no-verify`
3. **文档冲突**：如果 PROJECT.md 有冲突，手动解决后重新提交

## 自定义

如需修改更新逻辑，编辑 `scripts/update-project-md.js` 文件。
