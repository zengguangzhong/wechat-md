#!/usr/bin/env node
"use strict";

/**
 * 安装 git hooks 到 .git/hooks/ 目录
 * 在 pnpm install 时自动运行
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const hooksDir = path.join(__dirname, 'hooks');
const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');

// 确保 .git/hooks 目录存在
if (!fs.existsSync(gitHooksDir)) {
  fs.mkdirSync(gitHooksDir, { recursive: true });
}

// 复制并设置权限
const hooks = fs.readdirSync(hooksDir);
hooks.forEach(hook => {
  const src = path.join(hooksDir, hook);
  const dest = path.join(gitHooksDir, hook);
  
  // 复制文件
  fs.copyFileSync(src, dest);
  // 设置可执行权限
  fs.chmodSync(dest, 0o755);
  
  console.log(`✅ Installed git hook: ${hook}`);
});

console.log(`\n📝 Installed ${hooks.length} git hook(s)`);
